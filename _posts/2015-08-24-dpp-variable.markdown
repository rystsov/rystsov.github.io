---
layout: post
title: rystsov::dynamic distributed register
name: Dynamic Distributed Register
tags: ["misc"]
desc: "Updates disributed CAS register to work in the dynamic environments"
has_comments: true
---

<h1>Dynamic Distributed Register</h1>

Distributed register that we designed in the [previous post]({% post_url 2015-08-23-paxos-variable %}) has an obvious weakness since it works only with static set of nodes. We know that hardware malfunction are unavoidable so eventually all the nodes will be dead as well as our register. We need a mechanism to introduce new nodes to the cluster and to remove nodes from it to fight with node permanent failures. The [Dynamic Plain Paxos]({% 2015-07-19-dynamic-plain-paxos %}) article explains how we can do it with plain paxos, lets apply the same idea to the resister.

{% gist rystsov/155504eea63e19f040de %}
{% gist rystsov/3e74988da0e09138a7ec %}
{% gist rystsov/d2fc020e28162947d450 %}
