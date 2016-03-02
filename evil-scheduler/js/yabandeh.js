(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
    Statement: Statement,
    Abort: Abort,
    Seq: Seq,
    Cond: Cond,
    Fun: Fun,
    Call: Call,
    Return: Return
};

/////////////////////

function Step(pre, action, post) {
    return {
        isStep: true,
        pre: pre,
        action: action,
        post: post,
        bind: function (g) {
            return Step(this.pre, function (ctx) {
                var phase = this.action(ctx);
                return Phase(phase.step.bind(g), phase.ctx);
            }.bind(this), this.post);
        }
    };
}

function AsReturn(step) {
    step.isReturn = true;
    var old_bind = step.bind.bind(step);
    step.bind = function (g) {
        if (!g.isAccept) return this;
        return old_bind(g);
    };
    return step;
}

function AsAccept(step) {
    step.isAccept = true;
    return step;
}

function Unit() {
    return {
        isUnit: true,
        bind: function (g) {
            return g;
        }
    };
}

function Zero() {
    return {
        isZero: true,
        bind: function (g) {
            return this;
        }
    };
}

function Phase(step, ctx) {
    return {
        step: step,
        ctx: ctx
    };
}

/////////////////////

function bind(f, g) {
    return f.bind(g);
}

function unit(x) {
    return x.unit();
}

/////////////////////

function marker(x) {
    return function (thread_id) {
        x.threads[thread_id] = true;
    };
}

function unmarker(x) {
    return function (thread_id) {
        x.threads[thread_id] = false;
    };
}

/////////////////////

function Statement(view, action) {
    var self = {
        view: view,
        action: action,
        threads: {},
        unit: function () {
            return Step(marker(self), function (ctx) {
                self.action(ctx);
                return Phase(Unit(), ctx);
            }, unmarker(self));
        },
        accept_writer: function (offset, writer) {
            writer.write(self.threads, offset, self.view);
            return writer;
        }
    };
    return self;
}

function Return(view, selector) {
    var self = {
        view: view,
        selector: selector,
        threads: {},
        unit: function () {
            return AsReturn(Step(marker(self), function (ctx) {
                ctx.__ret = self.selector(ctx);
                return Phase(Unit(), ctx);
            }, unmarker(self)));
        },
        accept_writer: function (offset, writer) {
            writer.write(self.threads, offset, self.view);
            return writer;
        }
    };
    return self;
}

function Abort(view) {
    var self = {
        threads: {},
        view: view,
        unit: function () {
            return Step(marker(self), function (ctx) {
                return Phase(Zero(), ctx);
            }, unmarker(self));
        },
        accept_writer: function (offset, writer) {
            writer.write(self.threads, offset, view);
            return writer;
        }
    };
    return self;
}

function Seq(statements) {
    var self = {
        statements: statements,
        unit: function () {
            return self.statements.map(unit).reduce(bind, Unit());
        },
        accept_writer: function (offset, writer) {
            for (var i = 0; i < self.statements.length; i++) {
                self.statements[i].accept_writer(offset, writer);
            }
            return writer;
        }
    };
    return self;
}

function Cond(cond_view, predicate, body, alt) {
    var self = {
        cond_view: cond_view,
        predicate: predicate,
        body: body,
        alt: alt,
        threads: {},
        unit: function () {
            return Step(marker(self), function (ctx) {
                if (predicate(ctx)) {
                    return Phase(body.unit(), ctx);
                } else {
                    if (alt) {
                        return Phase(alt.unit(), ctx);
                    } else {
                        return Phase(Unit(), ctx);
                    }
                }
            }, unmarker(self));
        },
        accept_writer: function (offset, writer) {
            writer.write(self.threads, offset, "if (" + cond_view + ") {");
            body.accept_writer(offset + 4, writer);
            if (alt) {
                writer.write(false, offset, "} else {");
                alt.accept_writer(offset + 4, writer);
                writer.write(false, offset, "}");
            } else {
                writer.write(false, offset, "}");
            }
            return writer;
        }
    };
    return self;
}

function Fun(signature, body) {
    var self = {
        signature: signature,
        body: body,
        unit: function () {
            return Unit();
        },
        accept_writer: function (offset, writer) {
            writer.write(false, offset, "function " + signature + " {");
            body.accept_writer(offset + 4, writer);
            writer.write(false, offset, "}");
            return writer;
        }
    };
    return self;
}

function Call(view, pack, fun, unpack) {
    var self = {
        view: view,
        pack: pack,
        fun: fun,
        unpack: unpack,
        threads: {},
        unit: function () {
            return bind(Step(marker(self), function (ctx) {
                var sub = pack(ctx);
                sub.__seed = ctx;
                return Phase(fun.body.unit(), sub);
            }, unmarker(self)), AsAccept(Step(marker(self), function (ctx) {
                if (!ctx.__seed) {
                    throw "WTF?!";
                }
                var seed = ctx.__seed;
                var ret = ctx.__ret;
                unpack(seed, ret);
                return Phase(Unit(), seed);
            }, unmarker(self))));
        },
        accept_writer: function (offset, writer) {
            writer.write(self.threads, offset, view);
            return writer;
        }
    };

    return self;
}

},{}],2:[function(require,module,exports){
module.exports = {
    ThreadModel: ThreadModel,
    AppModel: AppModel
};

function ThreadModel(entry_point, app_model, thread_id) {
    var thread_model = {
        thread_id: thread_id,
        is_active: false,
        was_active: false,
        was_aborted: false,
        thread: entry_point,
        init: function () {
            thread_model.was_active = true;
            thread_model.was_aborted = false;
            thread_model.step = thread_model.thread.unit();
            thread_model.ctx = {};
            if (thread_model.step.isStep) {
                thread_model.is_active = true;
                thread_model.step.pre(thread_id);
            }
            app_model.notify();
        },
        iter: function () {
            if (thread_model.step.isStep) {
                var phase = thread_model.step.action(thread_model.ctx);
                thread_model.step.post(thread_id);
                thread_model.ctx = phase.ctx;
                thread_model.step = phase.step;
            }
            if (thread_model.step.isStep) {
                thread_model.step.pre(thread_id);
            } else {
                if (thread_model.step.isZero) {
                    thread_model.was_aborted = true;
                }
                thread_model.is_active = false;
            }
            app_model.notify();
        }
    };
    return thread_model;
}

function AppModel() {
    var app_model = {
        on_state_updated: null,
        notify: function () {
            if (app_model.on_state_updated != null) {
                app_model.on_state_updated(app_model);
            }
        }
    };
    return app_model;
}

},{}],3:[function(require,module,exports){
module.exports.CodeView = React.createClass({
    displayName: "CodeView",

    renderCodeDOMRawHTML: function (codeDOM) {
        var html = codeDOM.accept_writer(0, HtmlCodeWriter(this.props.threads_marker)).get();
        return { __html: html };
    },
    render: function () {
        return React.createElement("div", {
            className: "codeView",
            dangerouslySetInnerHTML: this.renderCodeDOMRawHTML(this.props.dom) });
    }
});

function HtmlCodeWriter(threads_marker) {
    var self = {
        lines: [],
        write: function (threads, offset, line) {
            var off = repeat(" ", offset);
            var active = active_threads(threads);
            if (active.length > 0) {
                self.lines.push({
                    is_current: true,
                    class_name: threads_marker(active),
                    line: off + line.replace(/\n/g, "\n" + off)
                });
            } else {
                self.lines.push({
                    is_current: false,
                    line: off + line.replace(/\n/g, "\n" + off)
                });
            }
        },
        get: function () {
            var text = "";
            for (var i = 0; i < self.lines.length; i++) {
                var isLast = i == self.lines.length - 1;
                var line = self.lines[i];
                var line_text = line.line + (isLast ? "" : "\n");
                if (line.is_current) {
                    text += "</pre><pre class=\"" + line.class_name + "\">";
                    text += line_text;
                    text += "</pre><pre>";
                } else {
                    text += line_text;
                }
            }
            return "<pre>" + text + "</pre>";
        }
    };
    return self;
    function active_threads(threads) {
        var active = [];
        for (var x in threads) {
            if (threads.hasOwnProperty(x)) {
                if (threads[x]) {
                    active.push("" + x);
                }
            }
        }
        return active;
    }
    function repeat(text, n) {
        var off = "";
        for (var i = 0; i < n; i++) {
            off += text;
        }
        return off;
    }
}

},{}],4:[function(require,module,exports){
var YabandehApp = require("./yabandeh/YabandehApp");

ReactDOM.render(React.createElement(YabandehApp, null), document.getElementById('yabandeh-placeholder'));

},{"./yabandeh/YabandehApp":9}],5:[function(require,module,exports){
module.exports = {
    __storage: {},
    __txid: 0,
    get: function (key) {
        if (!this.__storage.hasOwnProperty(key)) {
            throw "WTF?!";
        }
        return deep_copy(this.__storage[key]);
    },
    put: function (key, object) {
        object = deep_copy(object);
        this.__storage[key] = object;
    },
    put_cas: function (key, object, cas) {
        object = deep_copy(object);
        var obj = this.get(key);
        for (var prop in cas) {
            if (cas.hasOwnProperty(prop)) {
                if (obj[prop] != cas[prop]) {
                    return false;
                }
            }
        }
        this.__storage[key] = object;
        return true;
    },
    put_if: function (key, object, test) {
        object = deep_copy(object);
        var obj = this.get(key);
        if (!test(obj)) {
            return false;
        }
        this.__storage[key] = object;
        return true;
    },
    new_tx: function () {
        var tx_id = "tx:" + this.__txid++;
        var tx = { ver: 0, status: "pending" };
        this.put(tx_id, tx);
        tx.id = tx_id;
        return tx;
    }
};

function deep_copy(object) {
    return JSON.parse(JSON.stringify(object));
}

},{}],6:[function(require,module,exports){
module.exports = React.createClass({
    displayName: "exports",

    renderKeyValueTr: function (key, value) {
        return React.createElement(
            "tr",
            null,
            React.createElement(
                "th",
                null,
                key
            ),
            React.createElement(
                "td",
                null,
                value.ver
            ),
            React.createElement(
                "td",
                null,
                value.value
            ),
            React.createElement(
                "td",
                null,
                value.future
            ),
            React.createElement(
                "td",
                null,
                value.tx_link
            )
        );
    },
    render: function () {
        var a = this.props.db.get("a");
        var b = this.props.db.get("b");
        var c = this.props.db.get("c");
        return React.createElement(
            "div",
            { className: "info-block dbview" },
            React.createElement(
                "h3",
                null,
                "State"
            ),
            React.createElement(
                "table",
                null,
                React.createElement(
                    "tbody",
                    null,
                    React.createElement(
                        "tr",
                        { className: "header" },
                        React.createElement("th", null),
                        React.createElement(
                            "th",
                            null,
                            "ver"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "value"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "future"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "tx_link"
                        )
                    ),
                    this.renderKeyValueTr("a", a),
                    this.renderKeyValueTr("b", b),
                    this.renderKeyValueTr("c", c)
                )
            )
        );
    }
});

},{}],7:[function(require,module,exports){
module.exports = React.createClass({
    displayName: "exports",

    render: function () {
        var db = this.props.db;
        var a = db.get("a");
        var b = db.get("b");
        var c = db.get("c");

        var in_use = {};
        in_use[a.tx_link] = true;
        in_use[b.tx_link] = true;
        in_use[c.tx_link] = true;

        var txs = [];
        for (var key in this.props.db.__storage) {
            if (!this.props.db.__storage.hasOwnProperty(key)) continue;
            if (key.indexOf("tx:") != 0) continue;
            txs.push(key);
        }

        txs.sort(function (x, y) {
            return parseInt(x.substring(3)) - parseInt(y.substring(3));
        });

        var cut = [];
        for (var i = Math.max(txs.length - 5, 0); i < txs.length; i++) {
            cut.push(txs[i]);
        }
        txs = cut;

        if (txs.length == 0) {
            return React.createElement("div", { className: "txview" });
        }

        return React.createElement(
            "div",
            { className: "info-block txview" },
            React.createElement(
                "h3",
                null,
                "Transactions"
            ),
            React.createElement(
                "table",
                null,
                React.createElement(
                    "tbody",
                    null,
                    React.createElement(
                        "tr",
                        { className: "header" },
                        React.createElement("th", null),
                        React.createElement(
                            "th",
                            null,
                            "ver"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "status"
                        )
                    ),
                    txs.map(function (tx_key) {
                        var tx = db.get(tx_key);
                        return React.createElement(
                            "tr",
                            null,
                            React.createElement(
                                "th",
                                null,
                                tx_key
                            ),
                            React.createElement(
                                "td",
                                null,
                                tx.ver
                            ),
                            React.createElement(
                                "td",
                                null,
                                tx.status
                            )
                        );
                    })
                )
            )
        );
    }
});

},{}],8:[function(require,module,exports){
module.exports = React.createClass({
    displayName: "exports",

    nextHandler: function () {
        this.props.thread.iter();
    },
    rerunHandler: function () {
        this.props.thread.init();
    },
    render: function () {
        var button = null;
        var text = "";
        if (this.props.thread.is_active) {
            button = React.createElement(
                "button",
                { onClick: this.nextHandler },
                "Execute"
            );
        } else {
            if (this.props.thread.was_active) {
                button = React.createElement(
                    "button",
                    { onClick: this.rerunHandler },
                    "Restart"
                );
                if (this.props.thread.was_aborted) {
                    text = "Aborted";
                } else {
                    text = "Executed";
                }
            } else {
                button = React.createElement(
                    "button",
                    { onClick: this.rerunHandler },
                    "Start"
                );
            }
        }

        return React.createElement(
            "div",
            { className: "threadControl" },
            button,
            React.createElement(
                "span",
                null,
                text
            )
        );
    }
});

},{}],9:[function(require,module,exports){
var YabandehModel = require("./YabandehModel");
var view = require("../stepbystep/view");
var ThreadControl = require("./ThreadControl");

var CodeView;
var DBView = require("./DBView");
var TXView = require("./TXView");

var ThreadView = React.createClass({
    displayName: "ThreadView",

    render: function () {
        return React.createElement(
            "div",
            { className: "info-block threadview" },
            React.createElement(
                "h3",
                null,
                this.props.title
            ),
            React.createElement(CodeView, { dom: this.props.thread.thread }),
            React.createElement(ThreadControl, { thread: this.props.thread })
        );
    }
});

module.exports = React.createClass({
    displayName: "exports",

    getInitialState: function () {
        var app_model = YabandehModel();
        app_model.on_state_updated = function (app_model) {
            this.setState(app_model);
        }.bind(this);

        return app_model;
    },

    render: function () {
        return React.createElement(
            "table",
            null,
            React.createElement(
                "tbody",
                null,
                React.createElement(
                    "tr",
                    null,
                    React.createElement(
                        "td",
                        { className: "first-td" },
                        React.createElement(CodeView, { dom: this.state.clean_read })
                    ),
                    React.createElement(
                        "td",
                        { className: "second-td" },
                        React.createElement(CodeView, { dom: this.state.update }),
                        React.createElement(CodeView, { dom: this.state.commit }),
                        React.createElement(CodeView, { dom: this.state.clean })
                    ),
                    React.createElement(
                        "td",
                        { className: "third-td" },
                        React.createElement(ThreadView, { title: "Swap a and b", thread: this.state.tx1 }),
                        React.createElement(ThreadView, { title: "Swap b and c", thread: this.state.tx2 }),
                        React.createElement(DBView, { db: this.state.db }),
                        React.createElement(TXView, { db: this.state.db })
                    )
                )
            )
        );
    }
});

var CodeView = React.createClass({
    displayName: "CodeView",

    render: function () {
        var CV = view.CodeView;
        return React.createElement(CV, { dom: this.props.dom, threads_marker: threads_marker });
    }
});

function threads_marker(threads) {
    if (threads.length > 2) throw "WTF";
    var known = {
        "0": true,
        "1": true
    };
    for (var i = 0; i < threads.length; i++) {
        if (!known[threads[i]]) throw "WTF";
    }
    if (threads.length == 2) {
        return "thread01";
    }
    if (threads.length == 1) {
        return "thread" + threads[0];
    }
    return "nop";
}

},{"../stepbystep/view":3,"./DBView":6,"./TXView":7,"./ThreadControl":8,"./YabandehModel":10}],10:[function(require,module,exports){
module.exports = YabandehModel;

var dsl = require("../stepbystep/dsl");

var Statement = dsl.Statement;
var Abort = dsl.Abort;
var Seq = dsl.Seq;
var Cond = dsl.Cond;
var Fun = dsl.Fun;
var Call = dsl.Call;
var Return = dsl.Return;

var model = require("../stepbystep/model");
var AppModel = model.AppModel;
var ThreadModel = model.ThreadModel;

var db = require("./DB");

db.put("a", { ver: 0, value: "\"a\"", future: null, tx_link: null });
db.put("b", { ver: 0, value: "\"b\"", future: null, tx_link: null });
db.put("c", { ver: 0, value: "\"c\"", future: null, tx_link: null });

function equal(x, y) {
    return sub(x, y) && sub(y, x);
    function sub(x, y) {
        for (var prop in x) {
            if (x.hasOwnProperty(prop)) {
                if (x[prop] != y[prop]) {
                    return false;
                }
            }
        }
        return true;
    }
}

var __clean_read = Fun("clean_read(key)", Seq([Statement("var obj = db.get(key);", function (ctx) {
    ctx.obj = db.get(ctx.key);
}), Cond("obj.tx_link != null", function (ctx) {
    return ctx.obj.tx_link != null;
}, Seq([Statement("var status = null;", function (ctx) {
    ctx.status = null;
}), Statement("var tx = db.get(obj.tx_link);", function (ctx) {
    ctx.tx = db.get(ctx.obj.tx_link);
}), Cond("tx.status==\"pending\"", function (ctx) {
    return ctx.tx.status == "pending";
}, Seq([Statement("var aborted = {status: \"aborted\", ver: tx.ver+1};", function (ctx) {
    ctx.aborted = { status: "aborted", ver: ctx.tx.ver + 1 };
}), Cond("db.put_cas(obj.tx_link, aborted, {ver: tx.ver}", function (ctx) {
    return db.put_cas(ctx.obj.tx_link, ctx.aborted, { ver: ctx.tx.ver });
}, Seq([Statement("status = \"aborted\";", function (ctx) {
    ctx.status = "aborted";
})]), Seq([Statement("status = db.get(obj.tx_link).status;", function (ctx) {
    ctx.status = db.get(ctx.obj.tx_link).status;
})]))]), Seq([Statement("status = tx.status;", function (ctx) {
    ctx.status = ctx.tx.status;
})])), Cond("status == \"aborted\"", function (ctx) {
    return ctx.status == "aborted";
}, Seq([Statement("obj.future = null;", function (ctx) {
    ctx.obj.future = null;
}), Statement("obj.tx_link = null;", function (ctx) {
    ctx.obj.tx_link = null;
}), Return("return obj;", function (ctx) {
    return ctx.obj;
})])), Cond("status == \"committed\"", function (ctx) {
    return ctx.status == "committed";
}, Seq([Statement("var clean = {\n    value: obj.future,\n    ver: obj.ver + 1,\n    tx_link: null\n};", function (ctx) {
    ctx.clean = { value: ctx.obj.future, ver: ctx.obj.ver + 1, tx_link: null };
}), Statement("var cond = function(x) {\n    return equal(x, clean) || x.ver==obj.ver;\n};", function (ctx) {
    ctx.cond = function (x) {
        return equal(x, ctx.clean) || x.ver == ctx.obj.ver;
    };
}), Cond("db.put_if(key, clean, cond)", function (ctx) {
    return db.put_if(ctx.key, ctx.clean, ctx.cond);
}, Seq([Return("return clean;", function (ctx) {
    return ctx.clean;
})]))])), Abort("throw \"exit\";")])), Return("return obj;", function (ctx) {
    return ctx.obj;
})]));

var __update = Fun("update(tx_key, key, obj, value)", Seq([Statement("var updated = {\n" + "    value: obj.value,\n" + "    future: value,\n" + "    ver: obj.ver+1,\n" + "    tx_link: tx_key\n" + "};", function (ctx) {
    ctx.updated = {
        value: ctx.obj.value,
        future: ctx.value,
        ver: ctx.obj.ver + 1,
        tx_link: ctx.tx_key
    };
}), Cond("db.put_cas(\n" + "    key,\n" + "    updated,\n" + "    {ver: obj.ver}\n" + ")", function (ctx) {
    return db.put_cas(ctx.key, ctx.updated, { ver: ctx.obj.ver });
}, Seq([Return("return updated;", function (ctx) {
    return ctx.updated;
})])), Abort("throw \"exit\";")]));

var __commit = Fun("commit(tx_key, tx)", Seq([Statement("var committed = {\n" + "    status: \"committed\",\n" + "    ver: tx.ver+1\n" + "};", function (ctx) {
    ctx.committed = { status: "committed", ver: ctx.tx.ver + 1 };
}), Cond("!db.put_cas(\n" + "    tx_key,\n" + "    committed,\n" + "    {ver: tx.ver}\n" + ")", function (ctx) {
    return !db.put_cas(ctx.tx_key, ctx.committed, { ver: ctx.tx.ver });
}, Seq([Abort("throw \"exit\";")]))]));

var __clean = Fun("clean(key, obj)", Seq([Statement("var tidy = {\n" + "    value: obj.future,\n" + "    ver: obj.ver+1,\n" + "    future: null,\n" + "    tx_link: null,\n" + "};", function (ctx) {
    ctx.tidy = { value: ctx.obj.future, ver: ctx.obj.ver + 1, future: null, tx_link: null };
}), Statement("db.put_cas(key, tidy, {ver: obj.ver});", function (ctx) {
    db.put_cas(ctx.key, ctx.tidy, { ver: ctx.obj.ver });
})]));

function get_swap_tx(tx, var1, var2) {
    return Seq([Statement("var " + tx + " = db.new_tx();", function (ctx) {
        ctx[tx] = db.new_tx();
    }), Call("var " + var1 + " = clean_read(\"" + var1 + "\");", function (ctx) {
        return { key: var1 };
    }, __clean_read, function (ctx, ret) {
        ctx[var1] = ret;
    }), Call("var " + var2 + " = clean_read(\"" + var2 + "\");", function (ctx) {
        return { key: var2 };
    }, __clean_read, function (ctx, ret) {
        ctx[var2] = ret;
    }), Call(var1 + " = update(" + tx + ".id, \"" + var1 + "\", " + var1 + ", " + var2 + ".value);", function (ctx) {
        return { tx_key: ctx[tx].id, key: var1, obj: ctx[var1], value: ctx[var2].value };
    }, __update, function (ctx, ret) {
        ctx[var1] = ret;
    }), Call(var2 + " = update(" + tx + ".id, \"" + var2 + "\", " + var2 + ", " + var1 + ".value);", function (ctx) {
        return { tx_key: ctx[tx].id, key: var2, obj: ctx[var2], value: ctx[var1].value };
    }, __update, function (ctx, ret) {
        ctx[var2] = ret;
    }), Call("commit(" + tx + ".id, " + tx + ");", function (ctx) {
        return { tx_key: ctx[tx].id, tx: ctx[tx] };
    }, __commit, function (ctx, ret) {}), Call("clean(\"" + var1 + "\", " + var1 + ");", function (ctx) {
        return { key: var1, obj: ctx[var1] };
    }, __clean, function (ctx, ret) {}), Call("clean(\"" + var2 + "\", " + var2 + ");", function (ctx) {
        return { key: var2, obj: ctx[var2] };
    }, __clean, function (ctx, ret) {})]);
}

__tx1 = get_swap_tx("tx1", "a", "b");
__tx2 = get_swap_tx("tx2", "b", "c");

function YabandehModel() {
    var app_model = AppModel();
    app_model.clean_read = __clean_read;
    app_model.update = __update;
    app_model.commit = __commit;
    app_model.clean = __clean;
    app_model.tx1 = ThreadModel(__tx1, app_model, "0");
    app_model.tx2 = ThreadModel(__tx2, app_model, "1");
    app_model.db = db;
    return app_model;
}

},{"../stepbystep/dsl":1,"../stepbystep/model":2,"./DB":5}]},{},[4]);
