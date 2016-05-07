(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var PaxosApp = require("./paxos/PaxosApp");

ReactDOM.render(React.createElement(PaxosApp, null), document.getElementById('paxos-placeholder'));

},{"./paxos/PaxosApp":3}],2:[function(require,module,exports){
"use strict";

var obj_to_table = require("../stepbystep/sideview/obj_to_table");
var HashVar = require("../stepbystep/model").HashVar;
var icbm_proj = require("./utils/icbm_proj");

module.exports = React.createClass({
    displayName: "exports",

    render: function render() {
        var messages = this.props.messages;
        messages.sort(function (a, b) {
            return a.id - b.id;
        });
        var output = [];
        messages.forEach(function (msg) {
            var color = "hsla(" + msg.thread.color.h + "," + msg.thread.color.s + "%," + "40%," + 1 + ")";
            if (msg.isPromise) {
                output.push(React.createElement(
                    "div",
                    { className: "messages-msg promiseMsg", style: { borderColor: color } },
                    React.createElement(
                        "div",
                        { className: "msg-header", style: { backgroundColor: color } },
                        React.createElement(
                            "button",
                            { onClick: msg.execute.bind(msg) },
                            "Invoke"
                        ),
                        React.createElement(
                            "button",
                            { onClick: msg.lost.bind(msg) },
                            "Lost"
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "msg-body" },
                        React.createElement(
                            "div",
                            { className: "msg-label" },
                            "Invoke promise with"
                        ),
                        React.createElement(
                            "div",
                            { className: "promise-value" },
                            obj_to_table([{
                                acceptor: msg.acceptor.name,
                                key: msg.key,
                                ballot: msg.ballot
                            }])
                        )
                    )
                ));
            } else if (msg.isPromiseOk) {
                output.push(React.createElement(
                    "div",
                    { className: "messages-msg promiseOkMsg", style: { borderColor: color } },
                    React.createElement(
                        "div",
                        { className: "msg-header", style: { backgroundColor: color } },
                        React.createElement(
                            "button",
                            { onClick: msg.execute.bind(msg) },
                            "Return"
                        ),
                        React.createElement(
                            "button",
                            { onClick: msg.lost.bind(msg) },
                            "Lost"
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "msg-body" },
                        React.createElement(
                            "div",
                            { className: "msg-label" },
                            "Return"
                        ),
                        React.createElement(
                            "div",
                            { className: "promise-ok-value" },
                            obj_to_table([{
                                ballot: msg.accepted.ballot,
                                value: icbm_proj(msg.accepted.value)
                            }])
                        ),
                        React.createElement(
                            "div",
                            { className: "msg-label" },
                            "as a result of calling promise with"
                        ),
                        React.createElement(
                            "div",
                            { className: "promise-value" },
                            obj_to_table([{
                                acceptor: msg.promise.acceptor.name,
                                key: msg.promise.key,
                                ballot: msg.promise.ballot
                            }])
                        )
                    )
                ));
            } else if (msg.isPromiseFail) {
                output.push(React.createElement(
                    "div",
                    { className: "messages-msg promiseFailMsg", style: { borderColor: color } },
                    React.createElement(
                        "div",
                        { className: "msg-header", style: { backgroundColor: color } },
                        React.createElement(
                            "button",
                            { onClick: msg.execute.bind(msg) },
                            "Deliver"
                        ),
                        React.createElement(
                            "button",
                            { onClick: msg.lost.bind(msg) },
                            "Lost"
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "msg-body" },
                        React.createElement(
                            "div",
                            { className: "msg-label" },
                            "Return failure"
                        ),
                        React.createElement(
                            "div",
                            { className: "promise-failure-value" },
                            obj_to_table([{
                                ballot: msg.ballot
                            }])
                        ),
                        React.createElement(
                            "div",
                            { className: "msg-label" },
                            "as a result of calling promise with"
                        ),
                        React.createElement(
                            "div",
                            { className: "promise-value" },
                            obj_to_table([{
                                acceptor: msg.promise.acceptor.name,
                                key: msg.promise.key,
                                ballot: msg.promise.ballot
                            }])
                        )
                    )
                ));
            } else if (msg.isAccept) {
                output.push(React.createElement(
                    "div",
                    { className: "messages-msg acceptMsg", style: { borderColor: color } },
                    React.createElement(
                        "div",
                        { className: "msg-header", style: { backgroundColor: color } },
                        React.createElement(
                            "button",
                            { onClick: msg.execute.bind(msg) },
                            "Deliver"
                        ),
                        React.createElement(
                            "button",
                            { onClick: msg.lost.bind(msg) },
                            "Lost"
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "msg-body" },
                        React.createElement(
                            "div",
                            { className: "msg-label" },
                            "Invoke accept with"
                        ),
                        React.createElement(
                            "div",
                            { className: "accept-value" },
                            obj_to_table([{
                                acceptor: msg.acceptor.name,
                                key: msg.key,
                                ballot: msg.ballot,
                                value: icbm_proj(msg.value)
                            }])
                        )
                    )
                ));
            } else if (msg.isAcceptOk) {
                output.push(React.createElement(
                    "div",
                    { className: "messages-msg acceptOkMsg", style: { borderColor: color } },
                    React.createElement(
                        "div",
                        { className: "msg-header", style: { backgroundColor: color } },
                        React.createElement(
                            "button",
                            { onClick: msg.execute.bind(msg) },
                            "Confirm"
                        ),
                        React.createElement(
                            "button",
                            { onClick: msg.lost.bind(msg) },
                            "Lost"
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "msg-body" },
                        React.createElement(
                            "div",
                            { className: "msg-label" },
                            "Confirm invocation of accept with"
                        ),
                        React.createElement(
                            "div",
                            { className: "promise-value" },
                            obj_to_table([{
                                acceptor: msg.request.acceptor.name,
                                key: msg.request.key,
                                ballot: msg.request.ballot,
                                value: icbm_proj(msg.request.value)
                            }])
                        )
                    )
                ));
            } else if (msg.isAcceptFail) {
                output.push(React.createElement(
                    "div",
                    { className: "messages-msg acceptFailureMsg", style: { borderColor: color } },
                    React.createElement(
                        "div",
                        { className: "msg-header", style: { backgroundColor: color } },
                        React.createElement(
                            "button",
                            { onClick: msg.execute.bind(msg) },
                            "Deliver"
                        ),
                        React.createElement(
                            "button",
                            { onClick: msg.lost.bind(msg) },
                            "Lost"
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "msg-body" },
                        React.createElement(
                            "div",
                            { className: "msg-label" },
                            "Return failure"
                        ),
                        React.createElement(
                            "div",
                            { className: "promise-failure-value" },
                            obj_to_table([{
                                ballot: msg.ballot
                            }])
                        ),
                        React.createElement(
                            "div",
                            { className: "msg-label" },
                            "as a result of calling accept with"
                        ),
                        React.createElement(
                            "div",
                            { className: "promise-value" },
                            obj_to_table([{
                                acceptor: msg.request.acceptor.name,
                                key: msg.request.key,
                                ballot: msg.request.ballot,
                                value: icbm_proj(msg.request.value)
                            }])
                        )
                    )
                ));
            } else if (msg.isThreadMessage) {
                output.push(React.createElement(
                    "div",
                    { className: "messages-msg threadMsg", style: { borderColor: color } },
                    React.createElement(
                        "div",
                        { className: "msg-header", style: { backgroundColor: color } },
                        React.createElement(
                            "button",
                            { onClick: msg.execute.bind(msg) },
                            "Step"
                        )
                    )
                ));
            } else if (msg.isUpdateBallotMessage) {
                output.push(React.createElement(
                    "div",
                    { className: "messages-msg threadMsg", style: { borderColor: color } },
                    React.createElement(
                        "div",
                        { className: "msg-header", style: { backgroundColor: color } },
                        React.createElement(
                            "button",
                            { onClick: msg.execute.bind(msg) },
                            "Deliver"
                        ),
                        React.createElement(
                            "button",
                            { onClick: msg.lost.bind(msg) },
                            "Lost"
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "msg-body" },
                        React.createElement(
                            "div",
                            { className: "msg-label" },
                            "Broadcast ballot counter"
                        ),
                        React.createElement(
                            "div",
                            { className: "promise-failure-value" },
                            obj_to_table([{
                                target: { proposer_id: msg.proposer.proposer_id },
                                fail: { promised_ballot: msg.ballot }
                            }])
                        )
                    )
                ));
            }
        });
        return React.createElement(
            "div",
            { className: "messages" },
            output
        );
    }
});

},{"../stepbystep/model":8,"../stepbystep/sideview/obj_to_table":11,"./utils/icbm_proj":6}],3:[function(require,module,exports){
"use strict";

var PaxosModel = require("./PaxosModel");
var view = require("../stepbystep/view");
var ThreadView = require("../yabandeh/ThreadView");
var CodeView = view.CodeView;
var SideView = require("./SideView");

var ThreadControl = React.createClass({
    displayName: "ThreadControl",

    nextHandler: function nextHandler() {
        this.props.thread.iter();
    },
    rerunHandler: function rerunHandler() {
        this.props.thread.init();
    },
    render: function render() {
        var control = null;
        if (this.props.thread.is_active) {
            control = React.createElement(
                "span",
                { className: "tv-btn" },
                React.createElement(
                    "button",
                    { onClick: this.nextHandler, disabled: !!this.props.thread.data.isPaused },
                    "Step"
                )
            );
        } else {
            control = React.createElement(
                "span",
                { className: "tv-btn" },
                React.createElement(
                    "button",
                    { onClick: this.rerunHandler, disabled: !!this.props.thread.data.isPaused },
                    "Start"
                )
            );
        }
        return control;
    }
});

module.exports = React.createClass({
    displayName: "exports",

    getInitialState: function getInitialState() {
        PaxosModel.on_state_updated = function (app_model) {
            this.setState(app_model);
        }.bind(this);

        return PaxosModel;
    },

    render: function render() {
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
                        React.createElement(CodeView, { shift: 2, dom: this.state.paxos })
                    ),
                    React.createElement(
                        "td",
                        { className: "second-td", style: { verticalAlign: "top" } },
                        React.createElement(CodeView, { shift: 2, dom: this.state.client })
                    ),
                    React.createElement(
                        "td",
                        { className: "third-td", style: { verticalAlign: "top" } },
                        React.createElement(
                            "div",
                            { className: "thread-controls" },
                            React.createElement(
                                "div",
                                { className: "lee-control" },
                                React.createElement(
                                    "div",
                                    { className: "general" },
                                    React.createElement(
                                        "span",
                                        null,
                                        "General Lee"
                                    )
                                ),
                                React.createElement(
                                    "div",
                                    { className: "control" },
                                    React.createElement(ThreadControl, { thread: this.state.tx1 })
                                ),
                                React.createElement("div", { className: "clear" })
                            ),
                            React.createElement(
                                "div",
                                { className: "ross-control" },
                                React.createElement(
                                    "div",
                                    { className: "general" },
                                    React.createElement(
                                        "span",
                                        null,
                                        "General Ross"
                                    )
                                ),
                                React.createElement(
                                    "div",
                                    { className: "control" },
                                    React.createElement(ThreadControl, { thread: this.state.tx2 })
                                ),
                                React.createElement("div", { className: "clear" })
                            )
                        ),
                        React.createElement(SideView, { model: this.state })
                    )
                )
            )
        );
    }
});

},{"../stepbystep/view":12,"../yabandeh/ThreadView":13,"./PaxosModel":4,"./SideView":5}],4:[function(require,module,exports){
"use strict";

var model = require("../stepbystep/model");
var AppModel = model.AppModel;

var ThreadModel = model.ThreadModel;

var hl2 = require("../stepbystep/monokai");

var HashVar = model.HashVar;

var icbm_proj = require("./utils/icbm_proj");

var dsl = require("../stepbystep/dsl");
var Statement = dsl.Statement;
var While2 = function While2(view_begin, pred, body, view_end) {
    return dsl.While(hl2(view_begin), pred, body, hl2(view_end));
};
var Abort = dsl.Abort;
var Defer = dsl.Defer;
var Seq = dsl.Seq;
var Cond = dsl.Cond;
var Fun = dsl.Fun;
var Call = function Call(view, pack, fun, unpack) {
    return dsl.Call(hl2(view), pack, fun, unpack);
};
var Call2 = function Call2(view, pack, fun, unpack) {
    return dsl.Call2(hl2(view), pack, fun, unpack);
};
var Return = dsl.Return;
var Return2 = function Return2(view, x) {
    return dsl.Return(hl2(view), x);
};
var TryCatch2 = function TryCatch2(try_view, expression, catch_view, pack, handler, end) {
    return dsl.TryCatch(hl2(try_view), expression, hl2(catch_view), pack, handler, end);
};
var Throw = dsl.Throw;
var Each = dsl.Each;
var Nope2 = function Nope2(x) {
    return dsl.Nope(hl2(x));
};
var Statement2 = function Statement2(view, action) {
    return dsl.Statement(hl2(view), action);
};
var Skip = dsl.Skip;
var Shift = dsl.Shift;
var Marked = dsl.Marked;
var TML = require("../stepbystep/view").TML;
var hl2 = require("../stepbystep/monokai");

var MAJORITY = 2;

var __acceptor = Seq([Nope2("function Acceptor() {"), Shift(Seq([Nope2("this.promised = {};"), Nope2("this.accepted = {};"), Nope2("this.promise = function(key, ballot) {"), Shift(Seq([Nope2("this.promised[key] = ballot;"), Nope2("return ok(this.accepted[key]);")])), Nope2("};"), Nope2("this.accept = function(key, ballot, value) {"), Shift(Seq([Nope2("if (this.promised[key] <= ballot) {"), Shift(Seq([Nope2("this.promised[key] = ballot;"), Nope2("this.accepted[key] = {ballot: ballot, value: value};"), Nope2("return ok();")])), Nope2("}"), Nope2("return fail(this.promised[key]);")])), Nope2("};")])), Nope2("}")]);

var paxos_model = AppModel();
paxos_model.messages = new Messages();
function Acceptor(name) {
    this.name = name;
    this.promised = {};
    this.accepted = {};
    this.isEmpty = function () {
        for (var key in this.promised) {
            if (!this.promised.hasOwnProperty(key)) continue;
            return false;
        }

        for (var key in this.accepted) {
            if (!this.accepted.hasOwnProperty(key)) continue;
            return false;
        }

        return true;
    };
}
paxos_model.acceptors = [new Acceptor("a"), new Acceptor("b"), new Acceptor("c")];

paxos_model.areAllAcceptorsEmpty = function () {
    return paxos_model.acceptors.filter(function (x) {
        return !x.isEmpty();
    }).length == 0;
};

paxos_model.set_sideview = function (type) {
    paxos_model.side_view = type;
};

paxos_model.side_view = "help";

var __promise_rpc;
var promise_rpc_wait;

var __execute = Fun(hl2("this.execute = function(key, action, msg) {"), Seq([Skip(function (ctx) {
    ctx.__thread.frame_var("key", ctx.key);
    ctx.__thread.frame_var("msg", new HashVar(ctx.msg));
}), Statement2("var ballot = 100*(++this.n) + this.proposer_id;", function (ctx) {
    ctx.__self.n++;
    ctx.ballot = 100 * ctx.__self.n + ctx.__self.proposer_id;
    ctx.__thread.frame_var("ballot", ctx.ballot);
}), Statement2("proposers.update_ballot({promised_ballot: ballot});", function (ctx) {
    paxos_model.proposers.forEach(function (proposer) {
        if (proposer != ctx.__self) {
            var msg = new UpdateBallotMessage(paxos_model.messages, proposer, ctx.ballot, ctx.__thread);
            paxos_model.messages.emit(msg);
        }
    });
}), __promise_rpc = Statement2("var q = acceptors.promise(key, ballot);", function (ctx) {
    ctx.__thread.data.q = {
        thread: ctx.__thread,
        ctx: ctx,
        pending: paxos_model.acceptors.length,
        ok: [],
        fail: [],
        timeout: 0,
        try_unblock: function try_unblock() {
            if (this.pending === 0) {
                this.thread.data.isPaused = false;
            }
        }
    };

    ctx.q = ctx.__thread.data.q;

    paxos_model.acceptors.forEach(function (acceptor) {
        var msg = new PromiseMessage(paxos_model.messages, acceptor, ctx.key, ctx.ballot, ctx.q, ctx.__thread);
        paxos_model.messages.emit(msg);
    });
}), Statement2("q.on(x => x.is_fail).do(this.update_ballot.bind(this));", function (ctx) {}), Skip(function (ctx) {
    if (ctx.__thread.data.q.pending != 0) {
        ctx.__thread.data.isPaused = true;
    }
}), promise_rpc_wait = Statement2("var a = q.on(x => x.is_ok).at_least(MAJORITY).wait();", function (ctx) {}), Defer(function (ctx) {
    if (ctx.q.ok.length < MAJORITY) {
        return [dsl.flow.Throw("timeout"), ctx];
    } else {
        return [dsl.flow.Unit(), ctx];
    }
}), Statement2("var curr = a.max(x => x.accepted.ballot).accepted.value;", function (ctx) {
    var ballot = -1;
    var value = null;
    ctx.q.ok.forEach(function (item) {
        if (ballot <= item.ballot) {
            ballot = item.ballot;
            value = item.value;
        }
    });
    ctx.curr = value;
    ctx.__thread.frame_var("curr", icbm_proj(value));
}), Call2("var next = action(curr, msg);", function (ctx) {
    return { value: ctx.curr, msg: ctx.msg };
}, function (ctx) {
    return ctx.action;
}, function (ctx, ret) {
    ctx.next = ret;
    ctx.__thread.frame_var("next", icbm_proj(ret));
}), Statement2("q = acceptors.accept(key, ballot, next);", function (ctx) {
    ctx.__thread.data.q = {
        thread: ctx.__thread,
        ctx: ctx,
        pending: paxos_model.acceptors.length,
        ok: [],
        fail: [],
        timeout: 0,
        proposer: ctx.__self,
        try_unblock: function try_unblock() {
            if (this.pending === 0) {
                this.thread.data.isPaused = false;
            }
        }
    };

    ctx.q = ctx.__thread.data.q;

    paxos_model.acceptors.forEach(function (acceptor) {
        var msg = new AcceptMessage(paxos_model.messages, acceptor, ctx.key, ctx.ballot, ctx.next, ctx.q, ctx.__thread);
        paxos_model.messages.emit(msg);
    });
}), Statement2("q.on(x => x.is_fail).do(this.update_ballot.bind(this));", function (ctx) {}), Skip(function (ctx) {
    if (ctx.__thread.data.q.pending != 0) {
        ctx.__thread.data.isPaused = true;
    }
}), Statement2("q.on(x => x.is_ok).at_least(MAJORITY).wait();", function (ctx) {}), Defer(function (ctx) {
    if (ctx.q.ok.length < MAJORITY) {
        return [dsl.flow.Throw("timeout"), ctx];
    } else {
        return [dsl.flow.Unit(), ctx];
    }
}), Return2("return next;", function (ctx) {
    return ctx.next;
})]), "};");

var __update = Statement2("this.n = Math.max(this.n, fail.promised_ballot / 100);", function (ctx) {
    ctx.__self.n = Math.max(ctx.__self.n, ctx.fail.promised_ballot / 100);
});

var __proposer = Seq([Nope2("function Proposer(acceptors, proposer_id, n) {"), Shift(Seq([Nope2("this.proposer_id = proposer_id;"), Nope2("this.n = n;"), __execute, Seq([Nope2("this.update_ballot = function(fail) {"), Shift(__update), Nope2("};")])])), Nope2("}")]);

var __sign = Fun(hl2("function sign(value, msg) {"), Seq([Skip(function (ctx) {
    ctx.value = JSON.parse(JSON.stringify(ctx.value));
    ctx.__thread.frame_var("value", icbm_proj(ctx.value));
    ctx.__thread.frame_var("msg", new HashVar(ctx.msg));
}), Statement2("value.signs[msg.general] = true;", function (ctx) {
    if (!ctx.value.signs[ctx.msg.general]) {
        ctx.value.signs[ctx.msg.general] = true;
        ctx.value.len += 1;
        ctx.__thread.frame_var("value", icbm_proj(ctx.value));
    }
}), Cond("len(value.signs) == 2", function (ctx) {
    return ctx.value.len == 2;
}, Seq([Statement2("value.signed = true;", function (ctx) {
    ctx.value.signed = true;
    ctx.__thread.frame_var("value", icbm_proj(ctx.value));
})])), Return2("return value;", function (ctx) {
    return ctx.value;
})]), "}");

function icbm_proj(value) {
    if (value == null) {
        return value;
    }
    return [{
        signs: new HashVar(value.signs),
        signed: JSON.stringify(value.signed)
    }];
}

var __unsign = Fun(hl2("function unsign(value, msg) {"), Seq([Skip(function (ctx) {
    ctx.__thread.frame_var("value", icbm_proj(ctx.value));
    ctx.__thread.frame_var("msg", new HashVar(ctx.msg));
}), Cond("value == null", function (ctx) {
    return ctx.value == null;
}, Seq([Statement2("value = {signs: {}, signed: false};", function (ctx) {
    ctx.value = { signs: {}, signed: false, len: 0 };
    ctx.__thread.frame_var("value", icbm_proj(ctx.value));
})])), Skip(function (ctx) {
    ctx.value = JSON.parse(JSON.stringify(ctx.value));
}), Cond("!value.signed", function (ctx) {
    return !ctx.value.signed;
}, Seq([Statement2("delete value.signs[msg.general];", function (ctx) {
    if (ctx.value.signs.hasOwnProperty(ctx.msg.general)) {
        delete ctx.value.signs[ctx.msg.general];
        ctx.__thread.frame_var("value", icbm_proj(ctx.value));
        ctx.value.len -= 1;
    }
})])), Return2("return value;", function (ctx) {
    return ctx.value;
})]), "}");

var client_loop = Seq([While2("while (true) {", function (ctx) {
    return true;
}, Seq([TryCatch2("try {", Seq([Call("var launch = proposer.execute(\"ICBM\", unsign, {\n " + "  general: name\n" + "});", function (ctx) {
    return {
        key: "ICBM",
        action: __unsign,
        msg: { general: ctx.general_name },
        __self: ctx.proposer
    };
}, __execute, function (ctx, ret) {
    ctx.launch = ret;
    ctx.__thread.frame_var("launch", icbm_proj(ret));
}), Cond("launch.signed", function (ctx) {
    return ctx.launch.signed;
}, Seq([Statement2("console.info(\"LAUNCHED!\");", function (ctx) {
    console.info("LAUNCHED");
})]), Seq([Call("launch = proposer.execute(\"ICBM\", sign, {\n " + "  general: name\n" + "});", function (ctx) {
    return {
        key: "ICBM",
        action: __sign,
        msg: { general: ctx.general_name },
        __self: prososer_a
    };
}, __execute, function (ctx, ret) {
    ctx.launch = ret;
    ctx.__thread.frame_var("launch", icbm_proj(ret));
}), Statement2("console.info(launch.signed?\"LAUNCHED\":\"STEADY\");", function (ctx) {
    console.info(ctx.signed ? "LAUNCHED" : "STEADY");
})]))]), "} catch(e) {", function (ctx, obj) {
    ctx.e = obj;
}, Seq([Statement2("console.info(e);", function (ctx) {
    console.info(ctx.e);
})]), "}")]), "}")]);

var prososer_a = {
    proposer_id: 0,
    n: 1
};

var prososer_b = {
    proposer_id: 1,
    n: 1
};

paxos_model.proposers = [prososer_a, prososer_b];

var general_lee = Seq([Skip(function (ctx) {
    ctx.general_name = "Lee";
    ctx.proposer = prososer_a;
    ctx.__thread.frame_var("proposer_id", ctx.proposer.proposer_id);
    ctx.__thread.frame_var("name", ctx.general_name);
}), client_loop]);
var general_ross = Seq([Skip(function (ctx) {
    ctx.general_name = "Ross";
    ctx.proposer = prososer_b;
    ctx.__thread.frame_var("proposer_id", ctx.proposer.proposer_id);
    ctx.__thread.frame_var("name", ctx.general_name);
}), client_loop]);

var lee_thread = ThreadModel(general_lee, paxos_model, "0", 182, 25);
var ross_thread = ThreadModel(general_ross, paxos_model, "1", 51, 100);

function Message(messages) {
    this.id = Message.ID++;
    this.isMessage = true;
    this.messages = messages;
}
Message.ID = 1;

function UpdateBallotMessage(messages, proposer, ballot, thread) {
    Message.call(this, messages);
    this.isUpdateBallotMessage = true;
    this.thread = thread;
    this.ballot = ballot;
    this.proposer = proposer;
    this.execute = function () {
        var _this = this;

        this.messages.rm(this);

        var thread = ThreadModel(Seq([Skip(function (ctx) {
            ctx.__self = _this.proposer;
            ctx.fail = {
                promised_ballot: _this.ballot
            };
        }), __update]), {
            ticked: function ticked() {}
        }, this.thread.thread_id, this.thread.color.h, this.thread.color.s);
        thread.init();

        if (thread.is_active) {
            var step = new ThreadMessage(this.messages, thread);
            step.id = this.id;
            this.messages.emit(step);
        }

        paxos_model.notify();
    };
    this.lost = function () {
        this.messages.rm(this);
        paxos_model.notify();
    };
}

function AcceptOkMessage(messages, promise, mailbox, thread) {
    Message.call(this, messages);
    this.isAcceptOk = true;
    this.mailbox = mailbox;
    this.thread = thread;
    this.request = promise;
    this.method_call_view = ">" + promise.method_call_view + "\n" + "ok();";
    this.execute = function () {
        this.messages.rm(this);
        this.mailbox.pending--;
        this.mailbox.ok.push({});
        this.mailbox.try_unblock();
        paxos_model.notify();
    };
    this.lost = function () {
        this.messages.rm(this);
        this.mailbox.pending--;
        this.mailbox.timeout++;
        this.mailbox.try_unblock();
        paxos_model.notify();
    };
}

function PromiseOkMessage(messages, promise, accepted, mailbox, thread) {
    Message.call(this, messages);
    this.promise = promise;
    this.isPromiseOk = true;
    this.accepted = accepted;
    this.mailbox = mailbox;
    this.thread = thread;
    this.method_call_view = ">" + promise.method_call_view + "\n" + "ok(\"" + promise.key + "\", " + JSON.stringify(this.accepted) + ");";
    this.execute = function () {
        this.messages.rm(this);
        this.mailbox.pending--;
        this.mailbox.ok.push(this.accepted);
        this.mailbox.try_unblock();
        paxos_model.notify();
    };
    this.lost = function () {
        this.messages.rm(this);
        this.mailbox.pending--;
        this.mailbox.timeout++;
        this.mailbox.try_unblock();
        paxos_model.notify();
    };
}

function AcceptFailMessage(messages, promise, ballot, mailbox, thread) {
    Message.call(this, messages);
    this.isAcceptFail = true;
    this.ballot = ballot;
    this.mailbox = mailbox;
    this.thread = thread;
    this.request = promise;
    this.method_call_view = ">" + promise.method_call_view + "\n" + "fail(" + this.ballot + ");";
    this.execute = function () {
        var _this2 = this;

        this.messages.rm(this);
        this.mailbox.pending--;
        this.mailbox.fail.push(this.ballot);
        this.mailbox.try_unblock();

        var thread = ThreadModel(Seq([Skip(function (ctx) {
            ctx.__self = _this2.mailbox.proposer;
            ctx.fail = {
                promised_ballot: _this2.ballot
            };
        }), __update]), {
            ticked: function ticked() {}
        }, this.thread.thread_id, this.thread.color.h, this.thread.color.s);
        thread.init();

        if (thread.is_active) {
            var step = new ThreadMessage(this.messages, thread);
            step.id = this.id;
            this.messages.emit(step);
        }
        paxos_model.notify();
    };
    this.lost = function () {
        this.messages.rm(this);
        this.mailbox.timeout++;
        this.mailbox.pending--;
        this.mailbox.try_unblock();
        paxos_model.notify();
    };
}

function ThreadMessage(messages, thread) {
    Message.call(this, messages);

    this.thread = thread;
    this.isThreadMessage = true;

    this.execute = function () {
        this.thread.iter();
        if (!this.thread.is_active) {
            this.messages.rm(this);
        }
        paxos_model.notify();
    };
}

function PromiseFailMessage(messages, promise, ballot, mailbox, thread) {
    Message.call(this, messages);
    this.isPromiseFail = true;
    this.ballot = ballot;
    this.mailbox = mailbox;
    this.thread = thread;
    this.promise = promise;
    this.method_call_view = ">" + promise.method_call_view + "\n" + "fail(\"" + promise.key + "\", " + this.ballot + ");";
    this.execute = function () {
        var _this3 = this;

        this.messages.rm(this);
        this.mailbox.pending--;
        this.mailbox.fail.push(this.ballot);
        this.mailbox.try_unblock();

        var thread = ThreadModel(Seq([Skip(function (ctx) {
            ctx.__self = _this3.mailbox.proposer;
            ctx.fail = {
                promised_ballot: _this3.ballot
            };
        }), __update]), paxos_model, this.thread.thread_id, this.thread.color.h, this.thread.color.s);
        thread.init();

        if (thread.is_active) {
            var step = new ThreadMessage(this.messages, thread);
            step.id = this.id;
            this.messages.emit(step);
        }
        paxos_model.notify();
    };
    this.lost = function () {
        this.messages.rm(this);
        this.mailbox.timeout++;
        this.mailbox.pending--;
        this.mailbox.try_unblock();
        paxos_model.notify();
    };
}

function AcceptMessage(messages, acceptor, key, ballot, next, mailbox, thread) {
    Message.call(this, messages);
    this.isAccept = true;
    this.acceptor = acceptor;
    this.key = key;
    this.ballot = ballot;
    this.value = next;
    this.mailbox = mailbox;
    this.thread = thread;
    this.method_call_view = "accept(\"" + this.acceptor.name + "\", \"" + this.key + "\", " + this.ballot + "\," + JSON.stringify(this.value);
    ");";
    this.execute = function () {
        this.messages.rm(this);
        if (!this.acceptor.promised.hasOwnProperty(this.key)) {
            this.acceptor.promised[this.key] = -1;
        }
        if (!this.acceptor.accepted.hasOwnProperty(this.key)) {
            this.acceptor.accepted[this.key] = {
                ballot: -1, value: null
            };
        }

        var result;
        if (this.acceptor.promised[this.key] <= this.ballot) {
            this.acceptor.promised[this.key] = this.ballot;
            this.acceptor.accepted[this.key] = { ballot: this.ballot, value: this.value };
            result = new AcceptOkMessage(this.messages, this, this.mailbox, this.thread);
        } else {
            result = new AcceptFailMessage(this.messages, this, this.acceptor.promised[key], this.mailbox, this.thread);
        }
        result.id = this.id;
        this.messages.emit(result);
        paxos_model.notify();
    };
    this.lost = function () {
        this.messages.rm(this);
        this.mailbox.timeout++;
        this.mailbox.pending--;
        this.mailbox.try_unblock();
        paxos_model.notify();
    };
}

function PromiseMessage(messages, acceptor, key, ballot, mailbox, thread) {
    Message.call(this, messages);
    this.isPromise = true;
    this.acceptor = acceptor;
    this.key = key;
    this.ballot = ballot;
    this.mailbox = mailbox;
    this.thread = thread;
    this.method_call_view = "promise(\"" + this.acceptor.name + "\", \"" + this.key + "\", " + this.ballot + ");";
    this.execute = function () {
        this.messages.rm(this);
        if (!this.acceptor.promised.hasOwnProperty(this.key)) {
            this.acceptor.promised[this.key] = -1;
        }
        if (!this.acceptor.accepted.hasOwnProperty(this.key)) {
            this.acceptor.accepted[this.key] = {
                ballot: -1, value: null
            };
        }
        var result;
        if (this.acceptor.promised[this.key] < this.ballot) {
            this.acceptor.promised[this.key] = this.ballot;
            result = new PromiseOkMessage(this.messages, this, this.acceptor.accepted[key], this.mailbox, this.thread);
        } else {
            result = new PromiseFailMessage(this.messages, this, this.acceptor.promised[key], this.mailbox, this.thread);
        }
        result.id = this.id;
        this.messages.emit(result);
        paxos_model.notify();
    };
    this.lost = function () {
        this.messages.rm(this);
        this.mailbox.timeout++;
        this.mailbox.pending--;
        this.mailbox.try_unblock();
        paxos_model.notify();
    };
}

function Messages() {
    this.__messages = [];
    this.emit = function (msg) {
        this.__messages.push(msg);
        return this;
    };
    this.rm = function (msg) {
        this.__messages = this.__messages.filter(function (item) {
            return item != msg;
        });
        return this;
    };
}

paxos_model.paxos = Seq([Nope2("var MAJORITY = 2;"), __acceptor, __proposer]);
paxos_model.client = Seq([__sign, __unsign, client_loop]);
paxos_model.tx1 = lee_thread;
paxos_model.tx2 = ross_thread;
paxos_model.promise_rpc_call = __promise_rpc;
paxos_model.promise_rpc_wait = promise_rpc_wait;

paxos_model.ticked = function (thread) {
    paxos_model.notify();
};

module.exports = paxos_model;

},{"../stepbystep/dsl":7,"../stepbystep/model":8,"../stepbystep/monokai":9,"../stepbystep/view":12,"./utils/icbm_proj":6}],5:[function(require,module,exports){
"use strict";

var Menu;

var StackView = require("../stepbystep/sideview/StackView");
var obj_to_table = require("../stepbystep/sideview/obj_to_table");
var HashVar = require("../stepbystep/model").HashVar;
var Messages = require("./Messages");
var view = require("../stepbystep/view");
var CodeView = view.CodeView;

var icbm_proj = require("./utils/icbm_proj");

var DBView = null;

module.exports = React.createClass({
    displayName: "exports",

    netClicked: function netClicked() {
        this.props.model.set_sideview("net");
        this.props.model.notify();
    },
    dataClicked: function dataClicked() {
        this.props.model.set_sideview("db");
        this.props.model.notify();
    },
    varsClicked: function varsClicked() {
        this.props.model.set_sideview("vars");
        this.props.model.notify();
    },
    render: function render() {
        var _this = this;

        var side_view = this.props.model.side_view;

        var view = null;

        if (side_view == "net") {
            view = React.createElement(Messages, { messages: this.props.model.messages.__messages });
        } else if (side_view == "db") {
            view = React.createElement(DBView, { model: this.props.model });
        } else if (side_view == "vars") {
            view = React.createElement(StackView, { frames: this.props.model.frames });
        } else if (side_view == "help") {
            var database = React.createElement(
                "span",
                { className: "menulink free", onClick: this.dataClicked },
                "Database"
            );

            var stack = null;
            if (this.props.model.has_frames_var()) {
                stack = React.createElement(
                    "span",
                    { className: "menulink free", onClick: this.varsClicked },
                    "Stack"
                );
            } else {
                stack = React.createElement(
                    "span",
                    { className: "menulink dis" },
                    "Stack"
                );
            }

            var network = null;
            if (this.props.model.messages.__messages.length > 0) {
                network = React.createElement(
                    "span",
                    { className: "menulink free", onClick: this.netClicked },
                    "Network (" + this.props.model.messages.__messages.length + ")"
                );
            } else {
                network = React.createElement(
                    "span",
                    { className: "menulink dis" },
                    "Network (0)"
                );
            }

            var start = null;
            var step = null;
            if (this.props.model.tx1.is_active) {
                var disabled = !!this.props.model.tx1.data.isPaused;
                var next = function next() {
                    _this.props.model.tx1.iter();
                };
                step = React.createElement(
                    "button",
                    { onClick: next, disabled: disabled },
                    "Step"
                );
                start = React.createElement(
                    "button",
                    { disabled: true },
                    "Start"
                );
            } else {
                var disabled = !!this.props.model.tx1.data.isPaused;
                var init = function init() {
                    _this.props.model.tx1.init();
                };
                step = React.createElement(
                    "button",
                    { disabled: true },
                    "Step"
                );
                start = React.createElement(
                    "button",
                    { onClick: init, disabled: disabled },
                    "Start"
                );
            }

            view = React.createElement(
                "div",
                { className: "help" },
                React.createElement(
                    "p",
                    null,
                    "Refresh the page to restart the visualization."
                ),
                React.createElement(
                    "p",
                    null,
                    "Click on the General Lee`s ",
                    start,
                    " button to initiate its thread and then on the ",
                    step,
                    " button to evaluate the current step of the thread. Once you get familiar with the one thread add the Ross`s thread to see how they interact together."
                ),
                React.createElement(
                    "p",
                    null,
                    "The ",
                    database,
                    " tab reflects the permanent memory of the system like the proposer`s latest ballot numbers and the state of the acceptors."
                ),
                React.createElement(
                    "p",
                    null,
                    "With the ",
                    stack,
                    " tab you can see the values of the variables visible up to this moment."
                ),
                React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "p",
                        null,
                        "The next line for each acceptor makes a promise RPC call."
                    ),
                    React.createElement(CodeView, { shift: 2, dom: this.props.model.promise_rpc_call }),
                    React.createElement(
                        "p",
                        null,
                        "While the next line blocks the execution and awaits the majority of successful answers"
                    ),
                    React.createElement(CodeView, { shift: 2, dom: this.props.model.promise_rpc_wait })
                ),
                React.createElement(
                    "p",
                    null,
                    "On the ",
                    network,
                    " tab you can control order in which messages between proposers and acceptors are delivered or even lost some of them."
                )
            );
        }
        return React.createElement(
            "div",
            { className: "data-area" },
            React.createElement(Menu, { model: this.props.model }),
            view
        );
    }
});

DBView = React.createClass({
    displayName: "DBView",

    render: function render() {
        var promised = [];
        this.props.model.acceptors.forEach(function (acceptor) {
            for (var key in acceptor.promised) {
                promised.push({
                    acceptor: acceptor.name,
                    key: key,
                    value: acceptor.promised[key]
                });
            }
        });

        var accepted = [];
        this.props.model.acceptors.forEach(function (acceptor) {
            for (var key in acceptor.accepted) {
                var value = null;
                if (acceptor.accepted[key].value != null) {
                    var signs = [];
                    for (var general in acceptor.accepted[key].value.signs) {
                        signs.push(general);
                    }
                    value = [{
                        signs: signs,
                        signed: acceptor.accepted[key].value.signed
                    }];
                }

                accepted.push({
                    acceptor: acceptor.name,
                    key: key,
                    ballot: acceptor.accepted[key].ballot,
                    value: value
                });
            }
        });

        var tables = [];

        tables.push(React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "table_name" },
                "Proposers"
            ),
            obj_to_table(this.props.model.proposers)
        ));

        if (promised.length > 0) {
            tables.push(React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { className: "table_name" },
                    "Promised"
                ),
                obj_to_table(promised)
            ));
        }

        if (accepted.length > 0) {
            tables.push(React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { className: "table_name" },
                    "Accepted"
                ),
                obj_to_table(accepted)
            ));
        }

        return React.createElement(
            "div",
            { className: "databases" },
            tables
        );
    }
});

Menu = React.createClass({
    displayName: "Menu",

    netClicked: function netClicked() {
        this.props.model.set_sideview("net");
        this.props.model.notify();
    },
    dataClicked: function dataClicked() {
        this.props.model.set_sideview("db");
        this.props.model.notify();
    },
    varsClicked: function varsClicked() {
        this.props.model.set_sideview("vars");
        this.props.model.notify();
    },
    helpClicked: function helpClicked() {
        this.props.model.set_sideview("help");
        this.props.model.notify();
    },
    render: function render() {
        var side_view = this.props.model.side_view;

        var menu = [];
        if (side_view == "net") {
            menu.push(React.createElement(
                "span",
                { className: "curr" },
                "Network (" + this.props.model.messages.__messages.length + ")"
            ));
        } else {
            if (this.props.model.messages.__messages.length > 0) {
                menu.push(React.createElement(
                    "span",
                    { className: "free", onClick: this.netClicked },
                    "Network (" + this.props.model.messages.__messages.length + ")"
                ));
            } else {
                menu.push(React.createElement(
                    "span",
                    { className: "dis" },
                    "Network (0)"
                ));
            }
        }

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
                "Stack"
            ));
        } else {
            if (this.props.model.has_frames_var()) {
                menu.push(React.createElement(
                    "span",
                    { className: "free", onClick: this.varsClicked },
                    "Stack"
                ));
            } else {
                menu.push(React.createElement(
                    "span",
                    { className: "dis" },
                    "Stack"
                ));
            }
        }

        if (side_view == "help") {
            menu.push(React.createElement(
                "span",
                { className: "curr" },
                "Help"
            ));
        } else {
            menu.push(React.createElement(
                "span",
                { className: "free", onClick: this.helpClicked },
                "Help"
            ));
        }

        return React.createElement(
            "div",
            { className: "menu" },
            menu
        );
    }
});

},{"../stepbystep/model":8,"../stepbystep/sideview/StackView":10,"../stepbystep/sideview/obj_to_table":11,"../stepbystep/view":12,"./Messages":2,"./utils/icbm_proj":6}],6:[function(require,module,exports){
"use strict";

var HashVar = require("../../stepbystep/model").HashVar;

module.exports = function (value) {
    if (value != null) {
        var signs = [];
        for (var general in value.signs) {
            signs.push(general);
        }
        return [{
            signs: signs,
            signed: value.signed
        }];
    }

    return null;
};

},{"../../stepbystep/model":8}],7:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

module.exports = {
    Statement: Statement,
    Abort: Abort,
    Seq: Seq,
    Cond: Cond,
    Fun: Fun,
    Call: Call,
    Call2: Call2,
    Return: Return,
    Each: Each,
    Nope: Nope,
    Shift: Shift,
    Skip: Skip,
    Defer: Defer,
    While: While,
    Wormhole: Wormhole,
    Marked: Marked,
    TryCatch: TryCatch,
    Throw: ThrowAst,
    flow: {
        Throw: Throw,
        Unit: Unit
    }
};

var hl2 = require("./monokai");

/////////////////////

function Step(pre, action, post) {
    return {
        isStep: true,
        pre: pre,
        post: post,
        get_action: function get_action() {
            return action;
        },
        bind: function bind(g) {
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
        get_action: function get_action() {
            return action;
        },
        bind: function bind(g) {
            return Jump(function (ctx) {
                var phase = action(ctx);
                return Phase(phase.step.bind(g), phase.ctx);
            });
        }
    };
}

function Throw(obj) {
    return {
        isThrow: true,
        obj: obj,
        bind: function bind(g) {
            if (g.isCatch) {
                return g.caught(this.obj).bind(g.tail);
            } else {
                return this;
            }
        }
    };
}

function Catch(caught, tail) {
    return {
        isCatch: true,
        caught: caught,
        tail: tail,
        extract: function extract() {
            return tail;
        },
        bind: function bind(g) {
            return Catch(caught, this.tail.bind(g));
        }
    };
}

// TODO: implement via try/catch
function AsReturn(step) {
    return {
        isReturn: true,
        step: step,
        bind: function bind(g) {
            if (!g.isAccept) return this;
            return step.bind(g.step);
        }
    };
}

function AsAccept(step) {
    return {
        isAccept: true,
        step: step,
        extract: function extract() {
            return step;
        },
        bind: function bind(g) {
            return AsAccept(step.bind(g));
        }
    };
}

function Unit() {
    return {
        isUnit: true,
        bind: function bind(g) {
            return g;
        }
    };
}

function Zero() {
    return {
        isZero: true,
        bind: function bind(g) {
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

function _unit(x) {
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

// Move to ast.*

// TODO: remove
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
        unit: function unit() {
            return Step(marker(self), function (ctx) {
                action(ctx);
                return Phase(Unit(), ctx);
            }, unmarker(self));
        },
        accept_writer: function accept_writer(offset, writer, shift) {
            writer.write(self.marked, offset, self.view);
            return writer;
        }
    };
    return self;
}

function Marked(label, body) {
    var self = {
        label: label,
        unit: function unit() {
            return body.unit();
        },
        accept_writer: function accept_writer(offset, writer, shift) {
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
        unit: function unit() {
            return Jump(function (ctx) {
                action(ctx);
                return Phase(Unit(), ctx);
            });
        },
        accept_writer: function accept_writer(offset, writer, shift) {
            return writer;
        }
    };
    return self;
}

function Defer(action) {
    var self = {
        action: action,
        unit: function unit() {
            return Jump(function (ctx) {
                var _action = action(ctx);

                var _action2 = _slicedToArray(_action, 2);

                var step = _action2[0];
                var state = _action2[1];

                return Phase(step, state);
            });
        },
        accept_writer: function accept_writer(offset, writer, shift) {
            return writer;
        }
    };
    return self;
}

function TryCatch(try_view, expression, catch_view, pack, handler, end) {
    var self = {
        try_view: try_view,
        expression: expression,
        catch_view: catch_view,
        pack: pack,
        handler: handler,
        end: end,
        marked: {},
        unit: function unit() {
            var call = Step(marker(self), function (ctx) {
                return Phase(expression.unit(), ctx);
            }, unmarker(self));

            var catcher = Catch(function (obj) {
                return Jump(function (ctx) {
                    pack(ctx, obj);
                    return Phase(self.handler.unit(), ctx);
                });
            }, Unit());

            return call.bind(catcher);
        },
        accept_writer: function accept_writer(offset, writer, shift) {
            writer.write(self.marked, offset, try_view);
            self.expression.accept_writer(offset + shift, writer, shift);
            writer.write(self.marked, offset, catch_view);
            self.handler.accept_writer(offset + shift, writer, shift);
            writer.write(self.marked, offset, end);
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
        unit: function unit() {
            return AsReturn(Step(marker(self), function (ctx) {
                ctx.__ret = self.selector(ctx);
                return Phase(Unit(), ctx);
            }, unmarker(self)));
        },
        accept_writer: function accept_writer(offset, writer, shift) {
            writer.write(self.marked, offset, self.view);
            return writer;
        }
    };
    return self;
}

function ThrowAst(view, selector) {
    var self = {
        view: view,
        selector: selector,
        marked: {},
        unit: function unit() {
            return Step(marker(self), function (ctx) {
                var obj = selector(ctx);
                return Phase(Throw(obj), ctx);
            }, unmarker(self));
        },
        accept_writer: function accept_writer(offset, writer, shift) {
            writer.write(self.marked, offset, self.view);
            return writer;
        }
    };
    return self;
}

// TODO: remove in favor of Throw
function Abort(view) {
    var self = {
        marked: {},
        view: view,
        unit: function unit() {
            return Step(marker(self), function (ctx) {
                return Phase(Zero(), ctx);
            }, unmarker(self));
        },
        accept_writer: function accept_writer(offset, writer, shift) {
            writer.write(self.marked, offset, view);
            return writer;
        }
    };
    return self;
}

function Seq(statements) {
    var self = {
        statements: statements,
        unit: function unit() {
            return self.statements.map(_unit).reduce(bind, Unit());
        },
        accept_writer: function accept_writer(offset, writer, shift) {
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
        unit: function unit() {
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
        accept_writer: function accept_writer(offset, writer, shift) {
            writer.write(self.marked, offset, hl2("if (" + cond_view + ") {"));
            body.accept_writer(offset + shift, writer, shift);
            if (alt) {
                writer.write(false, offset, hl2("} else {"));
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
        unit: function unit() {
            return Unit();
        },
        accept_writer: function accept_writer(offset, writer, shift) {
            writer.write(false, offset, begin);
            body.accept_writer(offset + shift, writer, shift);
            writer.write(false, offset, end);
            return writer;
        }
    };
    return self;
}

function While(view_begin, pred, body, view_end) {
    var self = {
        marked: {},
        unit: function unit() {
            return Step(marker(self), function (ctx) {
                if (pred(ctx)) {
                    return Phase(body.unit().bind(self.unit()), ctx);
                } else {
                    return Phase(Unit(), ctx);
                }
            }, unmarker(self));
        },
        accept_writer: function accept_writer(offset, writer, shift) {
            writer.write(self.marked, offset, view_begin);
            body.accept_writer(offset + shift, writer, shift);
            writer.write(self.marked, offset, view_end);
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
        unit: function unit() {
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
        accept_writer: function accept_writer(offset, writer, shift) {
            writer.write(self.marked, offset, begin);
            body.accept_writer(offset + shift, writer, shift);
            writer.write(self.marked, offset, end);
            return writer;
        }
    };

    return self;
}

// TODO: replace with Call2
function Call(view, pack, fun, unpack) {
    var self = {
        view: view,
        pack: pack,
        fun: fun,
        unpack: unpack,
        marked: {},
        unit: function unit() {
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
            var catcher = Catch(function (obj) {
                return Jump(function (ctx) {
                    unmarker(self)(ctx.__thread);
                    ctx.__thread.pop_frame();
                    return Phase(Throw(obj), ctx.__seed);
                });
            }, Unit());
            return call.bind(accept).bind(pause).bind(catcher);
        },
        accept_writer: function accept_writer(offset, writer, shift) {
            writer.write(self.marked, offset, view);
            return writer;
        }
    };
    return self;
}

function Call2(view, pack, fun, unpack) {
    var self = {
        view: view,
        pack: pack,
        fun: fun,
        unpack: unpack,
        marked: {},
        unit: function unit() {
            var call = Step(marker(self), function (ctx) {
                var fun = self.fun(ctx);
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
            var catcher = Catch(function (obj) {
                return Jump(function (ctx) {
                    unmarker(self)(ctx.__thread);
                    ctx.__thread.pop_frame();
                    return Phase(Throw(obj), ctx.__seed);
                });
            }, Unit());
            return call.bind(accept).bind(pause).bind(catcher);
        },
        accept_writer: function accept_writer(offset, writer, shift) {
            writer.write(self.marked, offset, view);
            return writer;
        }
    };

    return self;
}

function Nope(view) {
    var self = {
        view: view,
        unit: function unit() {
            return Unit();
        },
        accept_writer: function accept_writer(offset, writer, shift) {
            writer.write(false, offset, view);
            return writer;
        }
    };
    return self;
}

function Shift(body) {
    var self = {
        body: body,
        unit: function unit() {
            return Unit();
        },
        accept_writer: function accept_writer(offset, writer, shift) {
            body.accept_writer(offset + shift, writer, shift);
            return writer;
        }
    };
    return self;
}

},{"./monokai":9}],8:[function(require,module,exports){
"use strict";

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
        app_model: app_model,
        thread: entry_point,
        color: { h: h, s: s },
        ts: 0,
        trace: {},
        step: {},
        data: {},

        push_frame: function push_frame() {
            self.app_model.push_frame(self);
        },
        pop_frame: function pop_frame() {
            self.app_model.pop_frame(self);
        },
        frame_var: function frame_var(name, obj) {
            self.app_model.frame_var(self, name, obj);
        },
        init: function init() {
            self.was_active = true;
            self.was_aborted = false;
            self.step = self.thread.unit();
            self.ctx = {
                __thread: self
            };

            while (self.step.isJump || self.step.isAccept || self.step.isCatch) {
                while (self.step.isJump) {
                    var phase = self.step.get_action()(self.ctx);
                    self.ctx = phase.ctx;
                    self.step = phase.step;
                }
                if (self.step.isAccept || self.step.isCatch) {
                    self.step = self.step.extract();
                }
            }

            if (self.step.isStep) {
                self.ts += 1;
                self.is_active = true;
                self.step.pre(self);
            }
            self.app_model.ticked(self);
        },
        unselect: function unselect() {
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
        abort: function abort() {
            self.unselect();
            self.was_aborted = true;
            self.is_active = false;
            self.ctx = {
                __thread: self
            };
            self.app_model.clear_frames(self);
            self.app_model.ticked(self);
        },
        iter: function iter() {
            if (self.step.isStep) {
                var phase = self.step.get_action()(self.ctx);
                self.step.post(self);
                self.ctx = phase.ctx;
                self.step = phase.step;
                while (self.step.isJump || self.step.isAccept || self.step.isCatch) {
                    while (self.step.isJump) {
                        var phase = self.step.get_action()(self.ctx);
                        self.ctx = phase.ctx;
                        self.step = phase.step;
                    }
                    if (self.step.isAccept || self.step.isCatch) {
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
            self.app_model.ticked(self);
        }
    };
    return self;
}

function AppModel() {
    var app_model = {
        on_state_updated: null,
        notify: function notify() {
            if (app_model.on_state_updated != null) {
                app_model.on_state_updated(app_model);
            }
        },
        frames: [],
        clear_frames: function clear_frames(thread) {
            this.frames = this.frames.filter(function (x) {
                return x.thread_id != thread.thread_id;
            });
        },
        push_frame: function push_frame(thread) {
            this.frames.push({
                thread_id: thread.thread_id,
                thread: thread,
                vars: []
            });
        },
        pop_frame: function pop_frame(thread) {
            var tail = [];
            while (true) {
                var frame = this.frames.pop();
                if (frame.thread_id == thread.thread_id) {
                    break;
                }
                tail.push(frame);
            }
            while (tail.length > 0) {
                this.frames.push(tail.pop());
            }
        },
        frame_var: function frame_var(thread, name, obj) {
            for (var i = this.frames.length - 1; i >= 0; i--) {
                if (this.frames[i].thread_id == thread.thread_id) {
                    this.frames[i].vars = this.frames[i].vars.filter(function (val) {
                        return name == null || val.name != name;
                    });
                    this.frames[i].vars.push({ name: name, obj: obj });
                    return;
                }
            }
            this.push_frame(thread);
            this.frame_var(thread, name, obj);
            //throw "WTF?!";
        },
        has_frames_var: function has_frames_var() {
            var count = 0;
            this.frames.forEach(function (frame) {
                count += frame.vars.length;
            });
            return count > 0;
        }
    };
    return app_model;
}

},{}],9:[function(require,module,exports){
"use strict";

module.exports = hl2;

var TML = require("../stepbystep/view").TML;

function hl2(text) {
    return html(text.replace(/"([^"]+)"/g, "<span class=\"string\">\"$1\"</span>").replace(/function ([^(]+)\(/g, "function <span class=\"fun-name\">$1</span>(").replace(/this.([^ ]+) = function/, "this.<span class=\"fun-name\">$1</span> = function").replace(/function/g, "<span class=\"function\">function</span>").replace(/([^a-z])(\d+)/g, "$1<span class=\"number\">$2</span>").replace(/return/g, "<span class=\"return\">return</span>").replace(/while/g, "<span class=\"while\">while</span>").replace(/if/g, "<span class=\"if\">if</span>").replace(/else/g, "<span class=\"else\">else</span>").replace(/try/g, "<span class=\"try\">try</span>").replace(/catch/g, "<span class=\"catch\">catch</span>").replace(/true/g, "<span class=\"bool\">true</span>").replace(/false/g, "<span class=\"bool\">false</span>").replace(/this/g, "<span class=\"this\">this</span>").replace(/var/g, "<span class=\"var\">var</span>"));
}

function html(text) {
    return TML.html(text);
}

},{"../stepbystep/view":12}],10:[function(require,module,exports){
"use strict";

var obj_to_table = require("./obj_to_table");

var buildShadesMap = require("../view").buildShadesMap;

module.exports = React.createClass({
    displayName: "exports",

    render: function render() {
        var vars = extractVarsFromFrames(this.props.frames);
        if (vars.length > 0) {
            return React.createElement(
                "div",
                { className: "var-view" },
                React.createElement(
                    "table",
                    { className: "var-table" },
                    React.createElement(
                        "tbody",
                        null,
                        vars.map(function (record) {
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
        };
        return null;
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

function reverse(arr) {
    arr = Array.prototype.slice.call(arr);
    arr.reverse();
    return arr;
}

},{"../view":12,"./obj_to_table":11}],11:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var HashVar = require("../model").HashVar;

module.exports = obj_to_table;

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
                if (this.prop != null) {
                    obj = obj[this.prop];
                }
                collector.push(React.createElement(
                    "td",
                    { className: "prop" },
                    obj_to_table(obj)
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
        if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) != "object" || obj instanceof HashVar || Array.isArray(obj) || obj == null) {
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

},{"../model":8}],12:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

    renderCodeDOMRawHTML: function renderCodeDOMRawHTML(codeDOM) {
        var shift = 4;
        if (this.props.shift) {
            shift = this.props.shift;
        }
        return codeDOM.accept_writer(0, HtmlCodeWriter(), shift).get(this.props.width);
    },
    render: function render() {
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
        begin_marked: function begin_marked(label) {
            var prev = self.line_group;
            self.line_group = {
                is_group: true,
                label: label,
                lines: [],
                prev: prev
            };
        },
        end_marked: function end_marked() {
            var curr = self.line_group;
            self.line_group = curr.prev;
            self.line_group.lines.push(curr);
        },
        write: function write(marked, offset, line) {
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
                if ((typeof element === "undefined" ? "undefined" : _typeof(element)) == "object") {
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
        get: function get(width) {
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

},{}],13:[function(require,module,exports){
"use strict";

var view = require("../stepbystep/view");
var CodeView = view.CodeView;

var ThreadControl = React.createClass({
    displayName: "ThreadControl",

    nextHandler: function nextHandler() {
        this.props.thread.iter();
    },
    abortHandler: function abortHandler() {
        this.props.thread.abort();
    },
    rerunHandler: function rerunHandler() {
        this.props.thread.init();
    },
    render: function render() {
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

    render: function render() {
        return React.createElement(
            "div",
            { className: "thread-view" },
            React.createElement(ThreadControl, { title: this.props.title, thread: this.props.thread }),
            React.createElement(CodeView, { dom: this.props.thread.thread })
        );
    }
});

},{"../stepbystep/view":12}]},{},[1]);
