---
layout: post
title: rystsov::distributed register for the dynamic environment
name: Distributed register for the dynamic environment
tags: ["distr"]
desc: "Updates distributed CAS register to work in the dynamic environment"
has_comments: true
---

<h1>Distributed register for the dynamic environment</h1>

Distributed register that we designed in the [previous post]({% post_url 2015-08-23-paxos-variable %}) has an obvious weakness: it works only with the static set of nodes. We know that hardware malfunctions are unavoidable and eventually all the nodes will be broken. So we need a mechanism to add (remove) nodes to the cluster to let the register outlive the nodes it runs on. The [Dynamic Plain Paxos]({% post_url 2015-07-19-dynamic-plain-paxos %}) article explains how we can do it with plain Paxos. We need to adapt it to use with the register.

Lets take a look on the coordinator which manages the process of changing the membership. Compared to the article mentioned above we don't use filters. Filters were added to make the proof understandable, but if you think about them you will notice that a system with filters behaves the same way as a system without them, so we can omit filters during the implementation.

{% gist rystsov/0644f6cf7b45f5a72e81 %}

As you can see, to change membership we execute several simple steps like increasing the quorum size or altering the set of nodes. But we can't think that those simple changes happen instantly since the old value may be used in the running '_read_write_read' operation. It makes sense to wait until all running operations with old value are finished. This is implemented via the 'era' variable and 'the _epic_change' method.

The acceptors methods are left intact.

{% gist rystsov/155504eea63e19f040de %}

API has a couple of new methods to perform the steps. All new methods are idempotent.

{% gist rystsov/3e74988da0e09138a7ec %}

Heart of the algorithm.

{% gist rystsov/d2fc020e28162947d450 %}
