(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var RAMPApp = require("./ramp/RAMPApp");

ReactDOM.render(React.createElement(RAMPApp, null), document.getElementById('ramp-placeholder'));

},{"./ramp/RAMPApp":5}],2:[function(require,module,exports){
module.exports = DB;

function DB() {
    var id_gen = 0;
    this.values = [];
    this.index = {};
    this.committed = {};
    this.proposers = [];
    this.broadcasts = [];
    this.broadcast_ballot_number = function (n) {
        this.broadcasts.push({ id: id_gen++, n: n });
    };
    this.apply_ballot_number = function (id) {
        var nova = [];
        this.broadcasts.forEach(function (req) {
            if (req.id == id) {
                this.proposers.forEach(function (proposer) {
                    proposer.n = Math.max(proposer.n, req.n);
                });
            } else {
                nova.push(req);
            }
        }.bind(this));
        this.broadcasts = nova;
    };
    this.gc = function () {
        var next = [];
        this.values.forEach(function (value) {
            if (value.txid == this.committed[value.key.lender][value.key.debtor].txid) {
                next.push(value);
            }
        }.bind(this));
        this.values = next;
    };
    this.prepare = function (shard, values) {
        console.log(shard);
        console.log(values);
        for (var i = 0; i < values.length; i++) {
            var value = clone(values[i]);
            if (!this.index.hasOwnProperty(shard)) {
                this.index[shard] = {};
            }
            if (!this.index[shard].hasOwnProperty(value.key.debtor)) {
                this.index[shard][value.key.debtor] = {};
            }
            this.index[shard][value.key.debtor]["" + value.txid] = value;
            this.values.push(value);
        }
    };
    this.commit = function (shard, txids) {
        if (!this.committed.hasOwnProperty(shard)) {
            this.committed[shard] = {};
        }

        var txid_index = {};
        txids.forEach(function (txid) {
            txid_index[txid] = true;
        });

        this.values.forEach(function (value) {
            if (value.key.lender == shard && txid_index[value.txid]) {
                if (!this.committed[shard].hasOwnProperty(value.key.debtor)) {
                    this.committed[shard][value.key.debtor] = {
                        txid: value.txid, confirmed: false
                    };
                }
                if (this.committed[shard][value.key.debtor].txid < value.txid) {
                    this.committed[shard][value.key.debtor].txid = value.txid;
                    this.committed[shard][value.key.debtor].confirmed = false;
                }
            }
        }.bind(this));
    };
    this.confirm = function (shard, txids) {
        var txid_index = {};
        txids.forEach(function (txid) {
            txid_index[txid] = true;
        });

        this.values.forEach(function (value) {
            if (value.key.lender == shard && txid_index[value.txid]) {
                if (this.committed[shard][value.key.debtor].txid == value.txid) {
                    this.committed[shard][value.key.debtor].confirmed = true;
                }
            }
        }.bind(this));
    };
    this.get = function (shard, values) {
        var result = [];

        values.forEach(function (value) {
            var txid = value.txid;
            if (txid == null) {
                txid = this.committed[shard][value.key.debtor].txid;
            }

            var obj = clone(this.index[shard][value.key.debtor]["" + txid]);
            if (this.committed.hasOwnProperty(shard) && this.committed[shard].hasOwnProperty(value.key.debtor) && this.committed[shard][value.key.debtor].txid == txid) {
                obj.confirmed = this.committed[shard][value.key.debtor].confirmed;
            }
            result.push(obj);
        }.bind(this));

        return result;
    };
    this.get_debts = function (person) {
        var result = [];
        for (var key in this.committed[person]) {
            if (!this.committed[person].hasOwnProperty(key)) {
                continue;
            }
            var txid = this.committed[person][key].txid;
            result.push(clone(this.index[person][key][txid]));
        }
        return result;
    };
}

function clone(x) {
    return JSON.parse(JSON.stringify(x));
}

},{}],3:[function(require,module,exports){
var ProposersView = React.createClass({
    displayName: "ProposersView",

    renderValueTr: function (proposer) {
        return React.createElement(
            "tr",
            null,
            React.createElement(
                "td",
                { className: "prop" },
                proposer.name
            ),
            React.createElement(
                "td",
                { className: "prop" },
                proposer.proposer_id
            ),
            React.createElement(
                "td",
                { className: "prop" },
                proposer.n
            )
        );
    },
    render: function () {
        var broadcast = null;
        if (this.props.db.broadcasts.length > 0) {
            broadcast = React.createElement(
                "div",
                { className: "broadcast" },
                React.createElement(
                    "div",
                    { className: "title" },
                    "Broadcast:"
                ),
                React.createElement(
                    "div",
                    null,
                    this.props.db.broadcasts.map(function (broadcast) {
                        function apply() {
                            this.props.db.apply_ballot_number(broadcast.id);
                            this.props.model.notify();
                        }
                        return React.createElement(
                            "button",
                            { onClick: apply.bind(this) },
                            "n=" + broadcast.n
                        );
                    }.bind(this))
                )
            );
        }
        return React.createElement(
            "div",
            { className: "db2-view proposer-table" },
            React.createElement(
                "h3",
                null,
                "Proposers"
            ),
            React.createElement(
                "table",
                { className: "db2-table" },
                React.createElement(
                    "tbody",
                    null,
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            null,
                            "name"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "proposer id"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "n"
                        )
                    ),
                    this.props.db.proposers.map(function (proposer) {
                        return this.renderValueTr(proposer);
                    }.bind(this))
                )
            ),
            broadcast
        );
    }
});

var CommittedView = React.createClass({
    displayName: "CommittedView",

    renderValueTr: function (committed) {
        return React.createElement(
            "tr",
            null,
            React.createElement(
                "td",
                { className: "prop" },
                committed.shard
            ),
            React.createElement(
                "td",
                { className: "prop" },
                committed.key
            ),
            React.createElement(
                "td",
                { className: "prop" },
                committed.txid
            ),
            React.createElement(
                "td",
                { className: "prop" },
                committed.confirmed ? "true" : "false"
            )
        );
    },
    render: function () {
        return React.createElement(
            "div",
            { className: "db2-view commit-table" },
            React.createElement(
                "h3",
                null,
                "Committed"
            ),
            React.createElement(
                "table",
                { className: "db2-table" },
                React.createElement(
                    "tbody",
                    null,
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            { colSpan: "2" },
                            "key"
                        ),
                        React.createElement("th", { className: "empty" }),
                        React.createElement("th", { className: "empty" })
                    ),
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            null,
                            "lender"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "debtor"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "txid"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "is confirmed"
                        )
                    ),
                    this.props.committed.map(function (committed) {
                        return this.renderValueTr(committed);
                    }.bind(this))
                )
            )
        );
    }
});

var ValuesView = React.createClass({
    displayName: "ValuesView",

    gc: function () {
        this.props.model.gc();
    },
    renderValueTr: function (row) {
        if (row.key == null) {
            return React.createElement(
                "tr",
                null,
                React.createElement("td", { className: "prop" }),
                React.createElement("td", { className: "prop" }),
                React.createElement("td", { className: "prop" }),
                React.createElement("td", { className: "prop" }),
                React.createElement(
                    "td",
                    { className: "prop" },
                    row.meta.lender
                ),
                React.createElement(
                    "td",
                    { className: "prop" },
                    row.meta.debtor
                )
            );
        } else {
            var meta = null;
            if (row.meta == null) {
                meta = [React.createElement("td", { className: "prop" }), React.createElement("td", { className: "prop" })];
            } else {
                meta = [React.createElement(
                    "td",
                    { className: "prop" },
                    row.meta.lender
                ), React.createElement(
                    "td",
                    { className: "prop" },
                    row.meta.debtor
                )];
            }
            return React.createElement(
                "tr",
                null,
                React.createElement(
                    "td",
                    { className: "prop" },
                    row.key.lender
                ),
                React.createElement(
                    "td",
                    { className: "prop" },
                    row.key.debtor
                ),
                React.createElement(
                    "td",
                    { className: "prop" },
                    row.txid
                ),
                React.createElement(
                    "td",
                    { className: "prop" },
                    row.value
                ),
                meta
            );
        }
    },
    render: function () {
        var model = this.props.model;

        var rows = [];
        for (var i = 0; i < this.props.values.length; i++) {
            var base = {
                key: {
                    lender: this.props.values[i].key.lender,
                    debtor: this.props.values[i].key.debtor
                },
                txid: this.props.values[i].txid,
                value: this.props.values[i].value,
                meta: null,
                is_last: true
            };
            if (this.props.values[i].md.length == 0) {
                rows.push(base);
            } else {
                var md = this.props.values[i].md;
                for (var j = 0; j < md.length; j++) {
                    if (j == 0) {
                        rows.push({
                            key: base.key,
                            txid: base.txid,
                            value: base.value,
                            meta: { lender: md[j].lender, debtor: md[j].debtor },
                            is_last: false
                        });
                    } else {
                        rows.push({
                            key: null,
                            meta: { lender: md[j].lender, debtor: md[j].debtor },
                            is_last: j == md.length - 1
                        });
                    }
                }
            }
        }

        return React.createElement(
            "div",
            { className: "db2-view value-table" },
            React.createElement(
                "h3",
                null,
                "Values",
                React.createElement(
                    "span",
                    { className: "gc" },
                    !model.tx1.is_active && !model.tx2.is_active ? React.createElement(
                        "button",
                        { onClick: this.gc },
                        "Collect garbage"
                    ) : React.createElement(
                        "button",
                        { disabled: "disabled", onClick: this.gc },
                        "Collect garbage"
                    )
                )
            ),
            React.createElement(
                "table",
                { className: "db2-table" },
                React.createElement(
                    "tbody",
                    null,
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            { colSpan: "2" },
                            "key"
                        ),
                        React.createElement("th", { className: "empty" }),
                        React.createElement("th", { className: "empty" }),
                        React.createElement(
                            "th",
                            { colSpan: "2" },
                            "meta"
                        )
                    ),
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            null,
                            "lender"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "debtor"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "txid"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "value"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "lender"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "debtor"
                        )
                    ),
                    rows.map(function (row) {
                        return this.renderValueTr(row);
                    }.bind(this))
                )
            )
        );
    }
});

module.exports = React.createClass({
    displayName: "exports",

    render: function () {
        var db = this.props.model.db;
        var model = this.props.model;

        var sharded = {};
        for (var i = 0; i < db.values.length; i++) {
            var value = db.values[i];
            if (!sharded.hasOwnProperty(value.key.lender)) {
                sharded[value.key.lender] = true;
            }
        }

        var shards = [];
        for (var shard in sharded) {
            if (!sharded.hasOwnProperty(shard)) continue;
            shards.push(shard);
        }
        shards = shards.sort();

        var committed = [];
        shards = shards.forEach(function (shard) {
            var keys = [];
            for (var key in db.committed[shard]) {
                if (!db.committed[shard].hasOwnProperty(key)) continue;
                keys.push(key);
            }
            keys = keys.sort();

            keys.forEach(function (key) {
                committed.push({
                    shard: shard,
                    key: key,
                    txid: db.committed[shard][key].txid,
                    confirmed: db.committed[shard][key].confirmed
                });
            });
        });

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
                        { style: { verticalAlign: "top" } },
                        React.createElement(CommittedView, { committed: committed }),
                        React.createElement(ProposersView, { db: db, model: model })
                    ),
                    React.createElement(
                        "td",
                        { style: { verticalAlign: "top", paddingLeft: "10px" } },
                        React.createElement(ValuesView, { values: reverse(db.values), model: model })
                    )
                )
            )
        );
    }
});

function reverse(values) {
    values = JSON.parse(JSON.stringify(values));
    values.reverse();
    return values;
}

},{}],4:[function(require,module,exports){
module.exports = KeyTable;

function KeyTable(bydefault) {
    this.store = [];
    this.put = function (key, value) {
        for (var i = 0; i < this.store.length; i++) {
            if (this.store[i].has(key)) {
                this.store[i].value = value;
                return;
            }
        }
        this.store.push(item(key, value));
    };
    this.get = function (key) {
        for (var i = 0; i < this.store.length; i++) {
            if (this.store[i].has(key)) {
                return this.store[i].value;
            }
        }
        var obj = item(key, bydefault());
        this.store.push(obj);
        return obj.value;
    };
    this.values = function () {
        var result = [];
        for (var i = 0; i < this.store.length; i++) {
            result.push(this.store[i].value);
        }
        return result;
    };
    this.forEach = function (iter) {
        for (var i = 0; i < this.store.length; i++) {
            iter(this.store[i].key, this.store[i].value);
        }
    };
    this.as_obj = function () {
        var obj = {};
        for (var i = 0; i < this.store.length; i++) {
            var key = this.store[i].key.lender + "/" + this.store[i].key.debtor;
            obj[key] = this.store[i].value;
        }
        return obj;
    };
    function item(key, value) {
        return {
            has: function (x) {
                return x.lender == key.lender && x.debtor == key.debtor;
            },
            key: key,
            value: value
        };
    }
}

},{}],5:[function(require,module,exports){
var RAMPModel = require("./RAMPModel");
var view = require("../stepbystep/view");
var ThreadView = require("../yabandeh/ThreadView");
var SideView = require("./SideView");

var CodeView = view.CodeView;

module.exports = React.createClass({
    displayName: "exports",

    getInitialState: function () {
        RAMPModel.on_state_updated = function (app_model) {
            this.setState(app_model);
        }.bind(this);

        return RAMPModel;
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
                        { className: "first-td", style: { verticalAlign: "top" } },
                        React.createElement(CodeView, { dom: this.state.proposer, shift: 2, width: 68 })
                    ),
                    React.createElement(
                        "td",
                        { className: "second-td", style: { verticalAlign: "top" } },
                        React.createElement(
                            "div",
                            { style: { "position": "relative" } },
                            React.createElement(
                                "div",
                                { style: { "position": "fixed" } },
                                React.createElement(
                                    "div",
                                    null,
                                    React.createElement(
                                        "div",
                                        { style: { "display": "inline-block", marginRight: "5px" } },
                                        React.createElement(ThreadView, { title: "Tx#1", thread: this.state.tx1, model: this.state })
                                    ),
                                    React.createElement(
                                        "div",
                                        { style: { "display": "inline-block" } },
                                        React.createElement(ThreadView, { title: "Tx#2", thread: this.state.tx2, model: this.state })
                                    )
                                ),
                                React.createElement(SideView, { model: this.state })
                            )
                        )
                    )
                )
            )
        );
    }
});

},{"../stepbystep/view":11,"../yabandeh/ThreadView":12,"./RAMPModel":6,"./SideView":7}],6:[function(require,module,exports){
var dsl = require("../stepbystep/dsl");
var DB = require("./DB");
var KeyTable = require("./KeyTable");

var Statement = dsl.Statement;
var Abort = dsl.Abort;
var Seq = dsl.Seq;
var Cond = dsl.Cond;
var Fun = dsl.Fun;
var Call = dsl.Call;
var Return = dsl.Return;
var Each = dsl.Each;
var Nope = dsl.Nope;
var Skip = dsl.Skip;
var Shift = dsl.Shift;
var Marked = dsl.Marked;
var TML = require("../stepbystep/view").TML;
var hl2 = require("../stepbystep/monokai");

var model = require("../stepbystep/model");
var AppModel = model.AppModel;
var ThreadModel = model.ThreadModel;
var HashVar = model.HashVar;

var ramp_model = AppModel();
module.exports = ramp_model;

ramp_model.change_notify = function (fn, args) {
    fn.apply(ramp_model, args);
    ramp_model.notify();
};

ramp_model.set_sideview = function (type) {
    module.exports.side_view = type;
};

//ramp_model.change_notify(ramp_model.set_sideview, ["sql:prepare"])

module.exports.side_view = "db";

function db_prepare_clicked() {
    ramp_model.set_sideview("sql:prepare");
    ramp_model.notify();
};
function db_commit_clicked() {
    ramp_model.set_sideview("sql:commit");
    ramp_model.notify();
};
function db_get_clicked() {
    ramp_model.set_sideview("sql:get");
    ramp_model.notify();
};
function db_debts_clicked() {
    ramp_model.set_sideview("sql:debts");
    ramp_model.notify();
};
function db_confirm_clicked() {
    ramp_model.set_sideview("sql:confirm");
    ramp_model.notify();
};

var db = new DB();

db.prepare("Euclid", [{ key: { lender: "Euclid", debtor: "Galois" }, txid: 0, value: 0, md: [] }, { key: { lender: "Euclid", debtor: "Godel" }, txid: 0, value: 0, md: [] }]);
db.prepare("Galois", [{ key: { lender: "Galois", debtor: "Euclid" }, txid: 0, value: 0, md: [] }, { key: { lender: "Galois", debtor: "Godel" }, txid: 0, value: 0, md: [] }]);
db.prepare("Godel", [{ key: { lender: "Godel", debtor: "Euclid" }, txid: 0, value: 0, md: [] }, { key: { lender: "Godel", debtor: "Galois" }, txid: 0, value: 0, md: [] }]);
db.commit("Euclid", [0]);
db.commit("Galois", [0]);
db.commit("Godel", [0]);
db.proposers = [{ name: "proposer1", proposer_id: 0, n: 0 }, { name: "proposer2", proposer_id: 1, n: 0 }];

var __req = Fun(hl2("function read_to(query, ret) {"), Seq([Skip(function (ctx) {
    ctx.__thread.frame_var("query", ctx.query);
}), Each(function (ctx) {
    var sharded = {};
    ctx.query.forEach(function (key) {
        if (!sharded.hasOwnProperty(key.key.lender)) {
            sharded[key.key.lender] = [];
        }
        sharded[key.key.lender].push(key);
    });
    var items = [];
    for (var shard in sharded) {
        if (!sharded.hasOwnProperty(shard)) continue;
        items.push({
            shard: shard,
            values: sharded[shard]
        });
    }
    return items;
}, function (e) {
    return { s: e.shard, ks: e.values };
}, "query.group_by(x => shard(x.key)).flatMap((s, ks) => {", Seq([Skip(function (ctx) {
    ctx.__thread.frame_var("s", ctx.s);
    ctx.__thread.frame_var("ks", ctx.ks);
}), Statement([hl2("return "), TML.Click("dbs[s].get(ks)", db_get_clicked), ".map(x=>(x.key,x));"], function (ctx) {
    db.get(ctx.s, ctx.ks).forEach(function (e) {
        ctx.__seed.__seed.ret.put(e.key, e);
    });
})]), "}).each((key,value) => { ret[key]=value; });")]), "}");

////////////////////////////////////////////////////////////

var __put_all = Fun(hl2("this.put_all = function(changes) {"), Seq([Skip(function (ctx) {
    ctx.__thread.frame_var("changes", ctx.changes);
}), Statement(hl2("var toptx = changes.map(x => x.txid).reduce(Math.max, 0);\n" + "this.n = Math.max(this.n, toptx / 10);\n" + "var txid = 100*(++this.n) + this.proposer_id;"), function (ctx) {
    ctx.toptx = ctx.changes.map(function (x) {
        return x.txid;
    }).reduce(function (x, y) {
        return Math.max(x, y);
    }, 0);
    ctx.__thread.frame_var("toptx", ctx.toptx);
    ctx.__self.n = Math.max(ctx.__self.n, ctx.toptx / 100);
    ctx.__thread.frame_var("n", ctx.__self.n);
    ctx.__self.n += 1;
    ctx.txid = 100 * ctx.__self.n + ctx.__self.proposer_id;
    ctx.__thread.frame_var("txid", ctx.txid);
}), Statement(hl2("proposers.broadcast(this.n);"), function (ctx) {
    module.exports.db.broadcast_ballot_number(ctx.__self.n);
}), Statement(hl2("var md = set(changes.map(x => x.key));\n" + "var by_shard = changes.map((key,value) => {\n" + "  key: key,\n" + "  txid: txid,\n" + "  value: value,\n" + "  md: md - { key }\n" + "}).group_by(x=>shard(x.key));"), function (ctx) {
    ctx.md = ctx.changes.map(function (x) {
        return x.key;
    });
    ctx.__thread.frame_var("md", ctx.md);
    ctx.group_by = {};
    for (var i = 0; i < ctx.changes.length; i++) {
        var key = ctx.changes[i].key.lender;
        if (!ctx.group_by.hasOwnProperty(key)) {
            ctx.group_by[key] = [];
        }
        ctx.group_by[key].push({
            key: ctx.changes[i].key,
            txid: ctx.txid,
            value: ctx.changes[i].value,
            md: ctx.md.filter(function (md) {
                return !(md.lender == ctx.changes[i].key.lender && md.debtor == ctx.changes[i].key.debtor);
            })
        });
    }
    ctx.__thread.frame_var("md", ctx.md);
    ctx.__thread.frame_var("by_shard", new HashVar(ctx.group_by));
}), Each(function (ctx) {
    var arr = [];
    for (var shard in ctx.group_by) {
        if (!ctx.group_by.hasOwnProperty(shard)) continue;
        arr.push({ shard: shard, values: ctx.group_by[shard] });
    }
    return arr;
}, function (e) {
    return e;
}, "by_shard.each((shard,values) => {", Seq([Skip(function (ctx) {
    ctx.__thread.frame_var(null, [{ shard: ctx.shard, values: ctx.values }]);
}), Statement([TML.Click("dbs[shard].prepare(values)", db_prepare_clicked), ";"], function (ctx) {
    db.prepare(ctx.shard, ctx.values);
})]), "});"), Skip(function (ctx) {
    ctx.shards = [];
    for (var shard in ctx.group_by) {
        if (!ctx.group_by.hasOwnProperty(shard)) {
            continue;
        }
        ctx.shards.push(shard);
    }
}), Each(function (ctx) {
    return ctx.shards;
}, function (e) {
    return { shard: e };
}, "by_shard.each((shard,_) => {", Seq([Skip(function (ctx) {
    ctx.__thread.frame_var("shard", ctx.shard);
}), Statement([TML.Click("dbs[shard].commit([txid])", db_commit_clicked), ";"], function (ctx) {
    db.commit(ctx.shard, [ctx.__seed.txid]);
})]), "});"), Each(function (ctx) {
    return ctx.shards;
}, function (e) {
    return { shard: e };
}, "by_shard.each((shard,_) => {", Seq([Skip(function (ctx) {
    ctx.__thread.frame_var("shard", ctx.shard);
}), Statement([TML.Click("dbs[shard].confirm([txid])", db_confirm_clicked), ";"], function (ctx) {
    db.confirm(ctx.shard, [ctx.__seed.txid]);
})]), "});")]), "};");

var __confirm = Fun(hl2("function confirm(values) {"), Seq([Skip(function (ctx) {
    ctx.__thread.frame_var("values", ctx.values);
}), Statement(hl2("var fresh = set(values.when(x => !x.confirmed).flatMap(x => [\n" + "  {shard: shard(x.key), txid: x.txid}\n" + "] + x.md.map(y => {shard: shard(y), txid: x.txid})));\n" + "var by_shard = fresh.group_by(x => x.shard).map(\n" + "  (shard, values) => (shard, values.map(x => x.txid))\n" + ");"), function (ctx) {
    var unfinished = [];
    var is_used = {};
    var add = function (shard, txid) {
        if (is_used.hasOwnProperty(shard) && is_used[shard][txid]) {
            return;
        }
        if (!is_used.hasOwnProperty(shard)) {
            is_used[shard] = {};
        }
        is_used[shard][txid] = true;
        unfinished.push({ shard: shard, txid: txid });
    };
    for (var i = 0; i < ctx.values.length; i++) {
        if (ctx.values[i].confirmed === false) {
            add(ctx.values[i].key.lender, ctx.values[i].txid);
            ctx.values[i].md.forEach(function (md) {
                add(md.lender, ctx.values[i].txid);
            });
        }
    }
    ctx.unfinished = unfinished;
    ctx.__thread.frame_var("fresh", ctx.unfinished);
    var by_shard = {};
    ctx.unfinished.forEach(function (x) {
        if (!by_shard.hasOwnProperty(x.shard)) {
            by_shard[x.shard] = [];
        }
        by_shard[x.shard].push(x.txid);
    });
    var groupped = [];
    for (var shard in by_shard) {
        if (!by_shard.hasOwnProperty(shard)) {
            continue;
        }
        groupped.push({ shard: shard, txids: by_shard[shard] });
    }
    ctx.by_shard = groupped;
    ctx.__thread.frame_var("by_shard", groupped);
}), Each(function (ctx) {
    return ctx.by_shard;
}, function (e) {
    return { shard: e.shard, txids: e.txids };
}, "by_shard.each((shard,txids) => {", Seq([Skip(function (ctx) {
    ctx.__thread.frame_var("shard", ctx.shard);
    ctx.__thread.frame_var("txids", ctx.txids);
}), Statement([TML.Click("dbs[shard].commit(txids)", db_commit_clicked), ";"], function (ctx) {
    db.commit(ctx.shard, ctx.txids);
})]), "});"), Each(function (ctx) {
    return ctx.by_shard;
}, function (e) {
    return { shard: e.shard, txids: e.txids };
}, "by_shard.each((shard,txids) => {", Seq([Skip(function (ctx) {
    ctx.__thread.frame_var("shard", ctx.shard);
    ctx.__thread.frame_var("txids", ctx.txids);
}), Statement([TML.Click("dbs[shard].confirm(txids)", db_confirm_clicked), ";"], function (ctx) {
    db.confirm(ctx.shard, ctx.txids);
})]), "});")]), "}");

var __get_all = Fun(hl2("this.get_all = function(keys) {"), Seq([Skip(function (ctx) {
    ctx.__thread.frame_var("keys", ctx.keys);
}), Statement(hl2("var ret = {};"), function (ctx) {
    ctx.ret = new KeyTable();
    ctx.__thread.frame_var("ret", new HashVar(ctx.ret.as_obj()));
}), Call("read_to(keys.map(key=>{key: key, txid: null}), ret);", function (ctx) {
    return { query: ctx.keys.map(function (key) {
            return { key: key, txid: null };
        }) };
}, __req, function (ctx, ret) {
    ctx.__thread.frame_var("ret", new HashVar(ctx.ret.as_obj()));
}), Call("confirm(ret.values());", function (ctx) {
    return { values: ctx.ret.values() };
}, __confirm, function (ctx, ret) {}), Statement(hl2("var versions = [\n" + "  {key: md, txid: r.txid} | r in ret.values(), md in r.md\n" + "];\n" + "var newer = versions.group_by(x => x.key).map(\n" + "  (key, values) => (key, max(values))\n" + ").when(\n" + "  (key, txid) => key in ret && txid > ret[key].txid\n" + ");"), function (ctx) {
    var latest = new KeyTable(function () {
        return -1;
    });
    var versions = [];
    ctx.ret.forEach(function (r_key, r) {
        for (var md_key in r.md) {
            if (!r.md.hasOwnProperty(md_key)) continue;
            var md = r.md[md_key];
            versions.push({ key: md, txid: r.txid });
            latest.put(md, Math.max(r.txid, latest.get(md)));
        }
    });
    ctx.__thread.frame_var("versions", versions);
    var newer = [];
    ctx.ret.forEach(function (key, value) {
        if (latest.get(key) > value.txid) {
            newer.push({
                key: key,
                txid: latest.get(key)
            });
        }
    });
    ctx.newer = newer;
    ctx.__thread.frame_var("newer", newer);
}), Call("read_to(newer.map((key, txid)=>{key: key, txid: txid}), ret);", function (ctx) {
    return { query: ctx.newer };
}, __req, function (ctx, ret) {}), Return(hl2("return ret;"), function (ctx) {
    return ctx.ret;
}), Nope(""), __req, Nope(""), __confirm]), "};");

var __get_borrowers = Fun(hl2("function get_borrowers() {"), Seq([Statement([hl2("var keys = "), TML.Click("db[shard(person)].get_debts_of(person)", db_debts_clicked), ";"], function (ctx) {
    ctx.keys = db.get_debts(ctx.person);
    ctx.__thread.frame_var("keys", ctx.keys);
}), Statement(hl2("keys = keys.map(key => {\n" + "  {lender: person, debtor: key.debtor}\n" + "})\n" + "var borrowers = {};"), function (ctx) {
    var values = ctx.keys;
    var result = [];
    values.forEach(function (value) {
        result.push({ lender: value.key.lender, debtor: value.key.debtor });
    });
    ctx.keys = result;
    ctx.__thread.frame_var("keys", result);
    ctx.borrowers = {};
    ctx.__thread.frame_var("borrowers", new HashVar({}));
}), Call("proposer.get_all(keys).values().each(\n" + "  v => borrowers[v.key.borrower] = v\n" + ");", function (ctx) {
    return {
        keys: ctx.keys,
        __self: ctx.proposer
    };
}, __get_all, function (ctx, ret) {
    ret.forEach(function (key, value) {
        ctx.borrowers[value.key.debtor] = value;
    });
    ctx.__thread.frame_var("borrowers", new HashVar(ctx.borrowers));
}), Return(hl2("return borrowers;"), function (ctx) {
    return ctx.borrowers;
})]), "}");

function wrap_update(update, has_thread, is_open_by_user) {
    if (has_thread.update || is_open_by_user.update) {
        var signature;
        if (is_open_by_user.update && !has_thread.update) {
            signature = Nope([hl2("function update(proposer, person, changes) { "), TML.Click("collapse", collapse_update)]);
        } else {
            signature = Nope(hl2("function update(proposer, person, changes) {"));
        }
        return Seq([Nope(""), signature, Shift(update.body), Nope("}")]);
    } else {
        return Seq([Nope(""), Nope([hl2("function update(proposer, person, changes) { "), TML.Click("...", expand_update), " }"])]);
    }
}

function wrap_get(get, has_thread, is_open_by_user) {
    if (has_thread.get || is_open_by_user.get) {
        var signature;
        if (is_open_by_user.get && !has_thread.get) {
            signature = Nope([hl2("this.get_all = function(keys) { "), TML.Click("collapse", collapse_get)]);
        } else {
            signature = Nope(hl2("this.get_all = function(keys) {"));
        }
        return Seq([Nope(""), signature, Shift(get.body), Nope("};")]);
    } else {
        return Seq([Nope(""), Nope([hl2("this.get_all = function(keys) { "), TML.Click("...", expand_get), " };"])]);
    }
}

function wrap_put(put, has_thread, is_open_by_user) {
    if (has_thread.put || is_open_by_user.put) {
        var signature;
        if (is_open_by_user.put && !has_thread.put) {
            signature = Nope([hl2("this.put_all = function(changes) { "), TML.Click("collapse", collapse_put)]);
        } else {
            signature = Nope(hl2("this.put_all = function(changes) { "));
        }
        return Seq([Nope(""), signature, Shift(put.body), Nope("};")]);
    } else {
        return Seq([Nope(""), Nope([hl2("this.put_all = function(changes) { "), TML.Click("...", expand_put), " };"])]);
    }
}

var __update = Fun(hl2("function update(proposer, person, changes) {"), Seq([Skip(function (ctx) {
    ctx.__thread.frame_var("proposer", ctx.proposer.name);
    ctx.__thread.frame_var("person", ctx.person);
    ctx.__thread.frame_var("changes", ctx.changes);
}), Call(hl2("var borrowers = get_borrowers();"), function (ctx) {
    return {
        proposer: ctx.proposer,
        person: ctx.person
    };
}, __get_borrowers, function (ctx, ret) {
    ctx.borrowers = ret;
    ctx.__thread.frame_var("borrowers", new HashVar(ret));
}), Statement(hl2("changes = changes.flatMap(x => [\n" + "  { key: { lender: person, debtor: x.borrower },\n" + "    value: borrowers[x.borrower].value + x.changes,\n" + "    txid: borrowers[x.borrower].txid }, \n" + "  { key: { lender: x.borrower, debtor: person },\n" + "    value: -(borrowers[x.borrower].value + x.changes),\n" + "    txid: borrowers[x.borrower].txid }\n" + "]);"), function (ctx) {
    var changes = [];
    ctx.changes.forEach(function (change) {
        changes.push({
            key: { lender: ctx.person, debtor: change.debtor },
            value: ctx.borrowers[change.debtor].value + change.value,
            txid: ctx.borrowers[change.debtor].txid
        });
        changes.push({
            key: { lender: change.debtor, debtor: ctx.person },
            value: -(ctx.borrowers[change.debtor].value + change.value),
            txid: ctx.borrowers[change.debtor].txid
        });
    });
    ctx.changes = changes;
    ctx.__thread.frame_var("changes", changes);
}), Call("proposer.put_all(changes);", function (ctx) {
    return {
        changes: ctx.changes,
        __self: ctx.proposer
    };
}, __put_all, function (ctx, ret) {}), Nope(""), __get_borrowers]), "}");

function make_core(put_all, get_all, update) {
    return Seq([Nope(hl2("function Proposer(proposers, proposer_id, n) {")), Shift(Seq([Nope(hl2("this.proposer_id = proposer_id;")), Nope(hl2("this.n = n;")), put_all, get_all])), Nope("}"), update]);
}

var has_thread = {
    put: false,
    get: false,
    update: false
};

var is_open_by_user = {
    put: false,
    get: false,
    update: false
};

function expand_put() {
    is_open_by_user.put = true;
    expand();
}

function expand_get() {
    is_open_by_user.get = true;
    expand();
}

function expand_update() {
    is_open_by_user.update = true;
    expand();
}

function collapse_put() {
    is_open_by_user.put = false;
    expand();
}

function collapse_get() {
    is_open_by_user.get = false;
    expand();
}

function collapse_update() {
    is_open_by_user.update = false;
    expand();
}

function expand() {
    module.exports.proposer = make_core(wrap_put(__put_all, has_thread, is_open_by_user), wrap_get(__get_all, has_thread, is_open_by_user), wrap_update(__update, has_thread, is_open_by_user));
    module.exports.notify();
}

module.exports.proposer = make_core(wrap_put(__put_all, has_thread, is_open_by_user), wrap_get(__get_all, has_thread, is_open_by_user), wrap_update(__update, has_thread, is_open_by_user));

////////////////////////////////////////////////////////////

module.exports.ticked = function (thread) {
    has_thread = {
        put: is_called_from(thread.ctx, __put_all),
        get: is_called_from(thread.ctx, __get_all),
        update: is_called_from(thread.ctx, __update)
    };

    if (ramp_model.frames.length == 0) {
        ramp_model.side_view = "db";
    }

    expand();

    function is_called_from(ctx, fun) {
        if (!ctx) return false;
        if (ctx.__fun === fun) return true;
        return is_called_from(ctx.__seed, fun);
    }
};

ramp_model.frames = [];
ramp_model.clear_frames = function (thread) {
    ramp_model.frames = ramp_model.frames.filter(function (x) {
        return x.thread_id != thread.thread_id;
    });
};
ramp_model.push_frame = function (thread) {
    ramp_model.frames.push({
        thread_id: thread.thread_id,
        thread: thread,
        vars: []
    });
};
ramp_model.pop_frame = function (thread) {
    var tail = [];
    while (true) {
        var frame = ramp_model.frames.pop();
        if (frame.thread_id == thread.thread_id) {
            break;
        }
        tail.push(frame);
    }
    while (tail.length > 0) {
        ramp_model.frames.push(tail.pop());
    }
};
ramp_model.frame_var = function (thread, name, obj) {
    for (var i = ramp_model.frames.length - 1; i >= 0; i--) {
        if (ramp_model.frames[i].thread_id == thread.thread_id) {
            ramp_model.frames[i].vars = ramp_model.frames[i].vars.filter(function (val) {
                return name == null || val.name != name;
            });
            ramp_model.frames[i].vars.push({ name: name, obj: obj });
            return;
        }
    }
    throw "WTF?!";
};
ramp_model.has_frames_var = function () {
    var count = 0;
    module.exports.frames.forEach(function (frame) {
        count += frame.vars.length;
    });
    return count > 0;
};

////////////////
// 15

var __tx1 = get_tx("proposer1", "Euclid", [{ debtor: "Galois", value: 3 }, { debtor: "Godel", value: 3 }]);

var __tx2 = get_tx("proposer2", "Godel", [{ debtor: "Euclid", value: 10 }, { debtor: "Galois", value: 10 }]);

module.exports.db = db;
module.exports.gc = function () {
    this.db.gc();
    module.exports.notify();
};

module.exports.tx1 = ThreadModel(__tx1, module.exports, "0", 182, 25);
module.exports.tx2 = ThreadModel(__tx2, module.exports, "1", 51, 100);

function get_tx(proposer, person, changes) {
    var text = "update(" + proposer + ", \"" + person + "\", [\n";
    changes.forEach(function (change, i) {
        var c = i + 1 == changes.length ? "" : ",";
        text += "  {debtor: \"" + change.debtor + "\", value: " + change.value + "}" + c + "\n";
    });
    text += "]);";
    var proposer = db.proposers.filter(function (x) {
        return x.name == proposer;
    })[0];
    return Seq([Call(text, function (ctx) {
        return {
            person: person,
            changes: changes,
            proposer: proposer
        };
    }, __update, function (ctx, ret) {})]);
}

},{"../stepbystep/dsl":8,"../stepbystep/model":9,"../stepbystep/monokai":10,"../stepbystep/view":11,"./DB":2,"./KeyTable":4}],7:[function(require,module,exports){
var DBView = require("./DBView");
var HashVar = require("../stepbystep/model").HashVar;
var buildShadesMap = require("../stepbystep/view").buildShadesMap;

var GET_QUERY, PREPARE_QUERY, COMMIT_QUERY, FINALIZE_QUERY, DEBTS_QUERY;

var StackView, Menu, QueryView;

module.exports = React.createClass({
    displayName: "exports",

    render: function () {
        var side_view = this.props.model.side_view;

        var view = null;

        if (side_view == "db") {
            view = React.createElement(DBView, { model: this.props.model });
        } else if (side_view == "vars") {
            var vars = extractVarsFromFrames(this.props.model.frames);
            if (vars.length > 0) {
                view = React.createElement(StackView, { vars: vars });
            }
        } else if (side_view.indexOf("sql:") == 0) {
            view = React.createElement(QueryView, { query: side_view });
        }
        return React.createElement(
            "div",
            { className: "data-area" },
            React.createElement(Menu, { model: this.props.model }),
            view
        );
    }
});

QueryView = React.createClass({
    displayName: "QueryView",

    render: function () {
        var query = "";
        if (this.props.query == "sql:get") {
            query = GET_QUERY;
        } else if (this.props.query == "sql:prepare") {
            query = PREPARE_QUERY;
        } else if (this.props.query == "sql:commit") {
            query = COMMIT_QUERY;
        } else if (this.props.query == "sql:debts") {
            query = DEBTS_QUERY;
        } else if (this.props.query == "sql:confirm") {
            query = FINALIZE_QUERY;
        }
        return React.createElement(
            "div",
            null,
            React.createElement(
                "pre",
                null,
                query
            )
        );
    }
});

Menu = React.createClass({
    displayName: "Menu",

    dataClicked: function () {
        this.props.model.set_sideview("db");
        this.props.model.notify();
    },
    varsClicked: function () {
        this.props.model.set_sideview("vars");
        this.props.model.notify();
    },
    render: function () {
        var side_view = this.props.model.side_view;

        var menu = [];
        if (side_view == "db") {
            menu.push(React.createElement(
                "span",
                { className: "curr" },
                "Database"
            ));
        } else {
            menu.push(React.createElement(
                "span",
                { className: "free", onClick: this.dataClicked },
                "Database"
            ));
        }

        if (side_view == "vars") {
            menu.push(React.createElement(
                "span",
                { className: "curr" },
                "Stackframe variables"
            ));
        } else {
            if (this.props.model.has_frames_var()) {
                menu.push(React.createElement(
                    "span",
                    { className: "free", onClick: this.varsClicked },
                    "Stackframe variables"
                ));
            } else {
                menu.push(React.createElement(
                    "span",
                    { className: "dis" },
                    "Stackframe variables"
                ));
            }
        }

        if (side_view.indexOf("sql:") == 0) {
            menu.push(React.createElement(
                "span",
                { className: "curr" },
                "Query"
            ));
        } else {
            menu.push(React.createElement(
                "span",
                { className: "dis" },
                "Query"
            ));
        }

        return React.createElement(
            "div",
            { className: "menu" },
            menu
        );
    }
});

StackView = React.createClass({
    displayName: "StackView",

    render: function () {
        return React.createElement(
            "div",
            { className: "var-view" },
            React.createElement(
                "table",
                { className: "var-table" },
                React.createElement(
                    "tbody",
                    null,
                    this.props.vars.map(function (record) {
                        var color = "hsla(" + record.h + "," + record.s + "%," + "40%," + record.a + ")";
                        return React.createElement(
                            "tr",
                            { className: "var-tr" },
                            React.createElement(
                                "td",
                                { className: "var-name", style: { "backgroundColor": color } },
                                record.name
                            ),
                            React.createElement(
                                "td",
                                { className: "var-value" },
                                obj_to_table(record.obj)
                            )
                        );
                    })
                )
            )
        );
    }
});

function extractVarsFromFrames(frames) {
    var deep_by_thread = {};
    for (var i = 0; i < frames.length; i++) {
        var frame = frames[i];
        if (!deep_by_thread.hasOwnProperty(frame.thread.thread_id)) {
            deep_by_thread[frame.thread.thread_id] = {};
        }
        if (frame.vars.length > 0) {
            deep_by_thread[frame.thread.thread_id][i] = true;
        }
    }
    var shades_by_thread = {};
    for (var thread in deep_by_thread) {
        if (!deep_by_thread.hasOwnProperty(thread)) continue;
        shades_by_thread[thread] = buildShadesMap(deep_by_thread[thread]);
    }

    var vars = [];
    for (var i = 0; i < frames.length; i++) {
        var frame = frames[i];
        if (frame.vars.length == 0) continue;
        var h = frame.thread.color.h;
        var s = frame.thread.color.s;
        var a = shades_by_thread[frame.thread.thread_id][i];
        frame.vars.forEach(function (record) {
            vars.push({
                name: record.name,
                obj: record.obj,
                h: h,
                s: s,
                a: a
            });
        });
    }

    return reverse(vars);
}

GET_QUERY = "function get($key_txid_pairs) {\n" + "  A = (\n" + "    SELECT key, txid \n" + "    FROM $key_txid_pairs\n" + "    WHERE txid != NULL\n" + "  )\n" + "  B = (\n" + "    SELECT key\n" + "    FROM $key_txid_pairs\n" + "    WHERE txid == NULL\n" + "  )\n" + "  C = (\n" + "    SELECT B.key, c.txid \n" + "    FROM B LEFT JOIN Committed c \n" + "     ON c.key == B.key\n" + "  )\n" + "  D = A UNION C\n" + "  return (\n" + "    SELECT \n" + "      key, p.txid, value,\n" + "      md, confirmed\n" + "    FROM Prepared p\n" + "    LEFT JOIN Committed c\n" + "      ON p.txid == c.txid\n" + "    WHERE (key, txid) in D\n" + "  )\n" + "}";

PREPARE_QUERY = "function prepare($values) {\n" + "  INSERT INTO Prepared(\n" + "    key, txid, value, md\n" + "  ) SELECT key, txid, value, md\n" + "  FROM $values;\n" + "}";

COMMIT_QUERY = "function commit($txids) {\n" + "  A = (\n" + "    SELECT key, txid, confirmed\n" + "    FROM Prepared\n" + "    WHERE txid in $txid\n" + "  )\n" + "  Committed = (\n" + "    SELECT key, MAX(txid)\n" + "    FROM A UNION Committed\n" + "    GROUP BY key\n" + "  )\n" + "  UPDATE Committed\n" + "  SET\n" + "    confirmed = false\n" + "  WHERE \n" + "    txid in $txids AND\n" + "    NOT(confirmed)\n" + "}";

FINALIZE_QUERY = "function confirm($txids) {\n" + "  UPDATE Committed\n" + "  SET\n" + "    confirmed = true\n" + "  WHERE txid in $txids\n" + "}";

DEBTS_QUERY = "function get_debts_of($person) {\n" + "  A = (\n" + "    SELECT key, txid\n" + "    FROM Committed \n" + "    WHERE key.creditor = $person\n" + "  )\n" + "  return (\n" + "    SELECT key, txid, value, md\n" + "    FROM Prepared\n" + "    WHERE (key, txid) in A\n" + "  )\n" + "}";

function tabler(obj) {
    if (obj instanceof HashVar) {
        var rows = [];
        for (var key in obj.obj) {
            if (!obj.obj.hasOwnProperty(key)) continue;
            if (Array.isArray(obj.obj[key])) {
                for (var j = 0; j < obj.obj[key].length; j++) {
                    rows.push({ key: j == 0 ? key : null, value: obj.obj[key][j] });
                }
            } else {
                rows.push({ key: key, value: obj.obj[key] });
            }
        }
        if (rows.length == 0) {
            return React.createElement(
                "span",
                { className: "value-obj-empty" },
                "{}"
            );
        } else {
            var tableInfo = build_table_info(rows[0].value, null, null);
            return React.createElement(
                "table",
                { className: "value-table" },
                React.createElement(
                    "tbody",
                    null,
                    tableInfo.get_header().map(function (tr) {
                        return React.createElement(
                            "tr",
                            null,
                            React.createElement("th", { className: "empty" }),
                            tr
                        );
                    }),
                    rows.map(function (obj) {
                        var row = [obj.key == null ? React.createElement("th", { className: "empty" }) : React.createElement(
                            "th",
                            { className: "header prop" },
                            obj.key
                        )];
                        tableInfo.render_row(obj.value, row);
                        return React.createElement(
                            "tr",
                            { className: "value-table-obj" },
                            row
                        );
                    })
                )
            );
        }
    } else {
        if (obj.length == 0) {
            return React.createElement(
                "span",
                { className: "value-list-empty" },
                "[]"
            );
        } else {
            var tableInfo = build_table_info(obj[0], null, null);
            return React.createElement(
                "table",
                { className: "value-table" },
                React.createElement(
                    "tbody",
                    null,
                    tableInfo.get_header().map(function (tr) {
                        return React.createElement(
                            "tr",
                            null,
                            tr
                        );
                    }),
                    obj.map(function (obj) {
                        var row = [];
                        tableInfo.render_row(obj, row);
                        return React.createElement(
                            "tr",
                            { className: "value-table-obj" },
                            row
                        );
                    })
                )
            );
        }
    }

    function TableInfo(is_leaf, name, prop) {
        this.is_leaf = is_leaf;
        this.name = name;
        this.prop = prop;
        this.children = [];
        this.spans = is_leaf ? 1 : 0;
        this.lvl = 0;
        this.get_header = function () {
            var by_lvl = this.collect_by_lvl([]);
            var last = null;
            var table = [];
            var tr = [];
            by_lvl.forEach(function (node) {
                if (last == null) {
                    last = node.lvl;
                }
                if (last != node.lvl) {
                    table.push(tr);
                    tr = [];
                    last = node.lvl;
                }
                tr.push(node);
            });
            table.push(tr);
            table = table.filter(function (tr) {
                return !tr.every(function (cell) {
                    return cell.name == null;
                });
            }).map(function (tr) {
                return tr.map(function (node) {
                    var name = node.name == null ? "" : node.name;
                    var className = node.name == null ? "empty" : "header";
                    return React.createElement(
                        "th",
                        { className: className, colSpan: node.spans },
                        name
                    );
                });
            });
            return table;
        };
        this.render_row = function (obj, collector) {
            if (this.is_leaf) {
                collector.push(React.createElement(
                    "td",
                    { className: "prop" },
                    obj_to_table(obj[this.prop])
                ));
            } else {
                if (this.prop != null) {
                    obj = obj[this.prop];
                }
                this.children.forEach(function (child) {
                    child.render_row(obj, collector);
                });
            }
        };
        this.collect_by_lvl = function (list) {
            var plan = [this];
            var i = 0;
            while (i < plan.length) {
                var e = plan[i];
                list.push(e);
                e.children.forEach(function (child) {
                    plan.push(child);
                });
                i++;
            }
            return list;
        };
    }

    function build_table_info(obj, name, prop) {
        if (typeof obj != "object" || Array.isArray(obj) || obj == null) {
            return new TableInfo(true, name, prop);
        } else {
            var root = new TableInfo(false, name, prop);
            var children = [];
            for (var key in obj) {
                if (!obj.hasOwnProperty(key)) continue;
                var child = build_table_info(obj[key], key, key);
                root.lvl = Math.max(root.lvl, child.lvl + 1);
                root.spans += child.spans;
                children.push(child);
            }
            children.forEach(function (child) {
                root.children.push(fill_skips(root.lvl - 1, child));
            });
            return root;
        }

        function fill_skips(lvl, node) {
            if (lvl < node.lvl) throw "WTF?!";
            if (lvl == node.lvl) return node;
            var filler = new TableInfo(false, null);
            filler.lvl = lvl;
            filler.children.push(fill_skips(lvl - 1, node));
            return filler;
        }
    }
}

function obj_to_table(obj) {
    if (typeof obj == "string") {
        return React.createElement(
            "span",
            { className: "value-string" },
            "\"" + obj + "\""
        );
    }
    if (obj == null) {
        return React.createElement(
            "span",
            { className: "value-null" },
            "null"
        );
    }
    if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] == "number") {
        return JSON.stringify(obj);
    }
    if (Array.isArray(obj) || obj instanceof HashVar) {
        return tabler(obj);
    }
    return JSON.stringify(obj);
}

function reverse(arr) {
    arr = Array.prototype.slice.call(arr);
    arr.reverse();
    return arr;
}

},{"../stepbystep/model":9,"../stepbystep/view":11,"./DBView":3}],8:[function(require,module,exports){
module.exports = {
    Statement: Statement,
    Abort: Abort,
    Seq: Seq,
    Cond: Cond,
    Fun: Fun,
    Call: Call,
    Return: Return,
    Each: Each,
    Nope: Nope,
    Shift: Shift,
    Skip: Skip,
    Wormhole: Wormhole,
    Marked: Marked
};

/////////////////////

function Step(pre, action, post) {
    return {
        isStep: true,
        pre: pre,
        post: post,
        get_action: function () {
            return action;
        },
        bind: function (g) {
            return Step(this.pre, function (ctx) {
                var phase = action(ctx);
                return Phase(phase.step.bind(g), phase.ctx);
            }.bind(this), this.post);
        }
    };
}

function Jump(action) {
    return {
        isJump: true,
        get_action: function () {
            return action;
        },
        bind: function (g) {
            return Jump(function (ctx) {
                var phase = action(ctx);
                return Phase(phase.step.bind(g), phase.ctx);
            });
        }
    };
}

function AsReturn(step) {
    return {
        isReturn: true,
        step: step,
        bind: function (g) {
            if (!g.isAccept) return this;
            return step.bind(g.step);
        }
    };
}

function AsAccept(step) {
    return {
        isAccept: true,
        step: step,
        extract: function () {
            return step;
        },
        bind: function (g) {
            return AsAccept(step.bind(g));
        }
    };
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

function none() {}

function marker(x) {
    return function (thread) {
        if (!x.marked.hasOwnProperty(thread.id)) {
            x.marked[thread.thread_id] = {
                thread: thread,
                hits: []
            };
        }
        x.marked[thread.thread_id].hits.push(thread.ts);
        thread.trace[thread.ts] = x;
    };
}

function unmarker(x) {
    return function (thread) {
        var ts = x.marked[thread.thread_id].hits.pop();
        if (x.marked[thread.thread_id].hits.length == 0) {
            delete x.marked[thread.thread_id];
        }
        delete thread.trace[ts];
    };
}

/////////////////////

function Wormhole() {
    this.pres = [];
    this.posts = [];
    this.pre = function () {
        this.pres.forEach(function (x) {
            x();
        });
    };
    this.post = function () {
        this.posts.forEach(function (x) {
            x();
        });
    };
    this.reg = function (stmnt) {
        var wh = this;
        var step = stmnt.unit();
        this.pres.push(step.pre);
        this.posts.push(step.post);
        step.unit = function () {
            return Step(wh.pre.bind(wh), step.action, wh.post.bind(wh));
        };
        return step;
    };
}

function Statement(view, action) {
    var self = {
        view: view,
        action: action,
        marked: {},
        unit: function () {
            return Step(marker(self), function (ctx) {
                action(ctx);
                return Phase(Unit(), ctx);
            }, unmarker(self));
        },
        accept_writer: function (offset, writer, shift) {
            writer.write(self.marked, offset, self.view);
            return writer;
        }
    };
    return self;
}

function Marked(label, body) {
    var self = {
        label: label,
        unit: function () {
            return body.unit();
        },
        accept_writer: function (offset, writer, shift) {
            writer.begin_marked(label);
            body.accept_writer(offset, writer, shift);
            writer.end_marked();
            return writer;
        }
    };
    return self;
}

function Skip(action) {
    var self = {
        action: action,
        unit: function () {
            return Jump(function (ctx) {
                action(ctx);
                return Phase(Unit(), ctx);
            });
        },
        accept_writer: function (offset, writer, shift) {
            return writer;
        }
    };
    return self;
}

function Return(view, selector) {
    var self = {
        view: view,
        selector: selector,
        marked: {},
        unit: function () {
            return AsReturn(Step(marker(self), function (ctx) {
                ctx.__ret = self.selector(ctx);
                return Phase(Unit(), ctx);
            }, unmarker(self)));
        },
        accept_writer: function (offset, writer, shift) {
            writer.write(self.marked, offset, self.view);
            return writer;
        }
    };
    return self;
}

function Abort(view) {
    var self = {
        marked: {},
        view: view,
        unit: function () {
            return Step(marker(self), function (ctx) {
                return Phase(Zero(), ctx);
            }, unmarker(self));
        },
        accept_writer: function (offset, writer, shift) {
            writer.write(self.marked, offset, view);
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
        accept_writer: function (offset, writer, shift) {
            for (var i = 0; i < self.statements.length; i++) {
                self.statements[i].accept_writer(offset, writer, shift);
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
        marked: {},
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
        accept_writer: function (offset, writer, shift) {
            writer.write(self.marked, offset, "if (" + cond_view + ") {");
            body.accept_writer(offset + shift, writer, shift);
            if (alt) {
                writer.write(false, offset, "} else {");
                alt.accept_writer(offset + shift, writer, shift);
                writer.write(false, offset, "}");
            } else {
                writer.write(false, offset, "}");
            }
            return writer;
        }
    };
    return self;
}

function Fun(begin, body, end) {
    var self = {
        signature: begin,
        body: body,
        end: end,
        unit: function () {
            return Unit();
        },
        accept_writer: function (offset, writer, shift) {
            writer.write(false, offset, begin);
            body.accept_writer(offset + shift, writer, shift);
            writer.write(false, offset, end);
            return writer;
        }
    };
    return self;
}

function Each(selector, pack, begin, body, end) {
    var self = {
        selector: selector,
        pack: pack,
        begin: begin,
        body: body,
        end: end,
        marked: {},
        unit: function () {
            return Step(marker(self), function (ctx) {
                var xs = selector(ctx);
                var arr = [];
                xs.forEach(function (x) {
                    arr.push(x);
                });
                if (xs.length == 0) {
                    return Phase(Unit(), ctx);
                } else {
                    var tail = Jump(function (ctx) {
                        ctx.__thread.pop_frame();
                        return Phase(Unit(), ctx);
                    }).bind(Step(marker(self), function (ctx) {
                        return Phase(Unit(), ctx.__seed);
                    }, unmarker(self)));
                    for (var i = xs.length - 1; i >= 0; i--) {
                        tail = function (item) {
                            var repack = Jump(function (ctx) {
                                ctx.__thread.pop_frame();
                                var packed = pack(item);
                                packed.__thread = ctx.__thread;
                                packed.__seed = ctx.__seed;
                                ctx.__thread.push_frame();
                                return Phase(Unit(), packed);
                            });
                            return repack.bind(body.unit()).bind(tail);
                        }(xs[i]);
                    }
                    ctx.__thread.push_frame();
                    return Phase(tail, { __seed: ctx, __thread: ctx.__thread });
                }
            }, unmarker(self));
        },
        accept_writer: function (offset, writer, shift) {
            writer.write(self.marked, offset, begin);
            body.accept_writer(offset + shift, writer, shift);
            writer.write(self.marked, offset, end);
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
        marked: {},
        unit: function () {
            var call = Step(marker(self), function (ctx) {
                ctx.__thread.push_frame();
                var sub = pack(ctx);
                sub.__seed = ctx;
                sub.__fun = fun;
                sub.__thread = ctx.__thread;
                return Phase(fun.body.unit(), sub);
            }, none);
            var accept = AsAccept(Jump(function (ctx) {
                var seed = ctx.__seed;
                var ret = ctx.__ret;
                ctx.__thread.pop_frame();
                unpack(seed, ret);
                return Phase(Unit(), seed);
            }));
            var pause = Step(none, function (ctx) {
                return Phase(Unit(), ctx);
            }, unmarker(self));
            return call.bind(accept).bind(pause);
        },
        accept_writer: function (offset, writer, shift) {
            writer.write(self.marked, offset, view);
            return writer;
        }
    };

    return self;
}

function Nope(view) {
    var self = {
        view: view,
        unit: function () {
            return Unit();
        },
        accept_writer: function (offset, writer, shift) {
            writer.write(false, offset, view);
            return writer;
        }
    };
    return self;
}

function Shift(body) {
    var self = {
        body: body,
        unit: function () {
            return Unit();
        },
        accept_writer: function (offset, writer, shift) {
            body.accept_writer(offset + shift, writer, shift);
            return writer;
        }
    };
    return self;
}

},{}],9:[function(require,module,exports){
module.exports = {
    ThreadModel: ThreadModel,
    AppModel: AppModel,
    HashVar: HashVar
};

function HashVar(obj) {
    this.obj = obj;
}

function ThreadModel(entry_point, app_model, thread_id, h, s) {
    var self = {
        thread_id: thread_id,
        is_active: false,
        was_active: false,
        was_aborted: false,
        thread: entry_point,
        color: { h: h, s: s },
        ts: 0,
        trace: {},
        step: {},

        push_frame: function () {
            app_model.push_frame(self);
        },
        pop_frame: function () {
            app_model.pop_frame(self);
        },
        frame_var: function (name, obj) {
            app_model.frame_var(self, name, obj);
        },
        init: function () {
            self.was_active = true;
            self.was_aborted = false;
            self.step = self.thread.unit();
            self.ctx = {
                __thread: self
            };

            while (self.step.isJump || self.step.isAccept) {
                while (self.step.isJump) {
                    var phase = self.step.get_action()(self.ctx);
                    self.ctx = phase.ctx;
                    self.step = phase.step;
                }
                if (self.step.isAccept) {
                    self.step = self.step.extract();
                }
            }

            if (self.step.isStep) {
                self.ts += 1;
                self.is_active = true;
                self.step.pre(self);
            }
            app_model.ticked(self);
        },
        unselect: function () {
            var trace = [];
            for (var ts in self.trace) {
                if (!self.trace.hasOwnProperty(ts)) {
                    continue;
                }
                trace.push(ts);
            }
            trace.forEach(function (ts) {
                delete self.trace[ts].marked[self.thread_id];
                delete self.trace[ts];
            });
        },
        abort: function () {
            self.unselect();
            self.was_aborted = true;
            self.is_active = false;
            self.ctx = {
                __thread: self
            };
            app_model.clear_frames(self);
            app_model.ticked(self);
        },
        iter: function () {
            if (self.step.isStep) {
                var phase = self.step.get_action()(self.ctx);
                self.step.post(self);
                self.ctx = phase.ctx;
                self.step = phase.step;
                while (self.step.isJump || self.step.isAccept) {
                    while (self.step.isJump) {
                        var phase = self.step.get_action()(self.ctx);
                        self.ctx = phase.ctx;
                        self.step = phase.step;
                    }
                    if (self.step.isAccept) {
                        self.step = self.step.extract();
                    }
                }
            }
            if (self.step.isStep) {
                self.ts += 1;
                self.step.pre(self);
            } else {
                if (self.step.isZero) {
                    self.was_aborted = true;
                }
                self.is_active = false;
                self.unselect();
            }
            app_model.ticked(self);
        }
    };
    return self;
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

},{}],10:[function(require,module,exports){
module.exports = hl2;

var TML = require("../stepbystep/view").TML;

function hl2(text) {
    return html(text.replace(/function ([^(]+)\(/g, "function <span class=\"fun-name\">$1</span>(").replace(/this.([^ ]+) = function/, "this.<span class=\"fun-name\">$1</span> = function").replace(/function/g, "<span class=\"function\">function</span>").replace(/([^a-z])(\d+)/g, "$1<span class=\"number\">$2</span>").replace(/return/g, "<span class=\"return\">return</span>").replace(/this/g, "<span class=\"this\">this</span>").replace(/var/g, "<span class=\"var\">var</span>"));
}

function html(text) {
    return TML.html(text);
}

},{"../stepbystep/view":11}],11:[function(require,module,exports){
var TML = {};
TML.Click = function (x, f) {
    return { is_click: true, text: x, f: f };
};
TML.html = function (text) {
    return { is_html: true, text: text };
};

module.exports.TML = TML;

module.exports.CodeView = React.createClass({
    displayName: "CodeView",

    renderCodeDOMRawHTML: function (codeDOM) {
        var shift = 4;
        if (this.props.shift) {
            shift = this.props.shift;
        }
        return codeDOM.accept_writer(0, HtmlCodeWriter(), shift).get(this.props.width);
    },
    render: function () {
        return React.createElement(
            "div",
            { className: "codeView" },
            this.renderCodeDOMRawHTML(this.props.dom)
        );
    }
});

module.exports.buildShadesMap = buildShadesMap;

function buildShadesMap(set) {
    var tss = [];
    var ts_pos = {};
    for (var ts in set) {
        if (!set.hasOwnProperty(ts)) {
            continue;
        }
        if (!set[ts]) {
            continue;
        }
        tss.push(parseInt(ts));
    }
    tss = tss.sort(function (x, y) {
        return x - y;
    });
    for (var i = 0; i < tss.length; i++) {
        ts_pos[tss[i]] = (1.0 + i) / tss.length;
    }
    return ts_pos;
}

function HtmlCodeWriter() {
    var self = {
        line_group: {
            is_group: true,
            label: null,
            lines: [],
            prev: null
        },
        begin_marked: function (label) {
            var prev = self.line_group;
            self.line_group = {
                is_group: true,
                label: label,
                lines: [],
                prev: prev
            };
        },
        end_marked: function () {
            var curr = self.line_group;
            self.line_group = curr.prev;
            self.line_group.lines.push(curr);
        },
        write: function (marked, offset, line) {
            var off = repeat(" ", offset);

            var sink = [React.createElement(
                "span",
                null,
                off
            )];
            fill_with_tml(line, sink, off);
            line = sink;

            var h = 0;
            var s = 0;
            var a = 0.0;
            var c = 0;

            for (var thread_id in marked) {
                if (!marked.hasOwnProperty(thread_id)) {
                    continue;
                }
                var thread = marked[thread_id].thread;
                var ts_pos = buildShadesMap(thread.trace);
                var hit = -1;
                marked[thread_id].hits.forEach(function (x) {
                    hit = Math.max(hit, x);
                });
                if (hit != -1) {
                    h += thread.color.h;
                    s += thread.color.s;
                    a += ts_pos[hit];
                    c += 1;
                }
            }

            if (c > 0) {
                self.line_group.lines.push({
                    is_group: false,
                    is_current: true,
                    color: { h: Math.floor(h / c), s: Math.floor(s / c), a: a / c },
                    text: line
                });
            } else {
                self.line_group.lines.push({
                    is_group: false,
                    is_current: false,
                    text: line
                });
            }

            function fill_with_tml(element, sink, off) {
                if (typeof element == "string") {
                    sink.push(React.createElement(
                        "span",
                        null,
                        element.replace(/\n/g, "\n" + off)
                    ));
                    return;
                }
                if (Array.isArray(element)) {
                    element.forEach(function (item) {
                        fill_with_tml(item, sink, off);
                    });
                    return;
                }
                if (typeof element == "object") {
                    if (element.is_html) {
                        sink.push(React.createElement("span", { dangerouslySetInnerHTML: {
                                __html: element.text.replace(/\n/g, "\n" + off)
                            } }));
                        return;
                    }
                    if (element.is_click) {
                        var subsink = [];
                        fill_with_tml(element.text, subsink, off);
                        sink.push(React.createElement(
                            "span",
                            { className: "code_link", onClick: element.f },
                            subsink
                        ));
                        return;
                    }
                    throw "WTF?!";
                }
            }
        },
        get: function (width) {
            if (self.line_group.label != null) {
                throw "WTF?!";
            }

            var pres = [];
            render_group(self.line_group, true, pres);
            return React.createElement(
                "div",
                { className: "sourceCode" },
                pres
            );

            function render_group(group, is_last_group, pres) {
                var widthStyle = {};
                if (width) {
                    widthStyle.width = "" + width + "ch";
                }

                var text = [];
                for (var i = 0; i < group.lines.length; i++) {
                    var isLast = i == group.lines.length - 1;
                    var line = group.lines[i];
                    if (line.is_group) {
                        pres.push(React.createElement(
                            "pre",
                            { style: widthStyle },
                            text
                        ));
                        text = [];
                        var sub = [];
                        render_group(line, isLast && is_last_group, sub);
                        pres.push(React.createElement(
                            "div",
                            { className: "sourceCode " + line.label },
                            sub
                        ));
                    } else {
                        if (line.is_current) {
                            pres.push(React.createElement(
                                "pre",
                                { style: widthStyle },
                                text
                            ));
                            var style = clone(widthStyle);
                            style.backgroundColor = "hsla(" + line.color.h + "," + line.color.s + "%," + "40%," + line.color.a + ")";
                            var lineView = [line.text];
                            if (!(isLast && is_last_group)) {
                                lineView.push(React.createElement(
                                    "span",
                                    null,
                                    "\n"
                                ));
                            }
                            pres.push(React.createElement(
                                "pre",
                                { style: style },
                                lineView
                            ));
                            text = [];
                        } else {
                            text.push(line.text);
                            if (!isLast) {
                                text.push(React.createElement(
                                    "span",
                                    null,
                                    "\n"
                                ));
                            }
                        }
                    }
                }
                pres.push(React.createElement(
                    "pre",
                    { style: widthStyle },
                    text
                ));
            }
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

function clone(x) {
    return JSON.parse(JSON.stringify(x));
}

},{}],12:[function(require,module,exports){
var view = require("../stepbystep/view");
var CodeView = view.CodeView;

var ThreadControl = React.createClass({
    displayName: "ThreadControl",

    nextHandler: function () {
        this.props.thread.iter();
    },
    abortHandler: function () {
        this.props.thread.abort();
    },
    rerunHandler: function () {
        this.props.thread.init();
    },
    render: function () {
        var controls = [];
        var title = this.props.title;
        if (this.props.thread.is_active) {
            controls.push(React.createElement(
                "span",
                { className: "tv-btn" },
                React.createElement(
                    "button",
                    { onClick: this.nextHandler },
                    "Step"
                )
            ));
            controls.push(React.createElement(
                "span",
                { className: "tv-btn" },
                React.createElement(
                    "button",
                    { onClick: this.abortHandler },
                    "Abort"
                )
            ));
        } else {
            if (this.props.thread.was_active) {
                controls.push(React.createElement(
                    "span",
                    { className: "tv-btn" },
                    React.createElement(
                        "button",
                        { onClick: this.rerunHandler },
                        "Restart"
                    )
                ));
                controls.push(React.createElement(
                    "span",
                    { className: "tv-status" },
                    this.props.thread.was_aborted ? "Aborted" : "Executed"
                ));
            } else {
                controls.push(React.createElement(
                    "span",
                    { className: "tv-btn" },
                    React.createElement(
                        "button",
                        { onClick: this.rerunHandler },
                        "Start"
                    )
                ));
            }
        }
        return React.createElement(
            "div",
            { className: "thread-control" },
            title,
            controls
        );
    }
});

module.exports = React.createClass({
    displayName: "exports",

    render: function () {
        return React.createElement(
            "div",
            { className: "thread-view" },
            React.createElement(ThreadControl, { title: this.props.title, thread: this.props.thread }),
            React.createElement(CodeView, { dom: this.props.thread.thread })
        );
    }
});

},{"../stepbystep/view":11}]},{},[1]);
