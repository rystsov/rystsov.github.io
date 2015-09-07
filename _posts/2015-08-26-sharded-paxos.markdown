---
layout: post
title: rystsov::Paxos-based sharded ordered key value store with CAS
name: Paxos-based sharded ordered key value store with CAS
tags: ["distr"]
desc: "How to run an instance of paxos variable per key to build a key value storage and how to shard it on the fly without loosing consistency"
has_comments: true
---

<h1>Paxos-based sharded ordered key value store with CAS</h1>

To build a key value storage each node runs a new instance of Paxos variable each time when the node receives a get or put request for an unseen key and redirects all further requests related to the key to that variable. Of course different instances on the same node should share the quorum size and the set of nodes and use unified membership change mechanism which generalises the Paxos variable's version to work with a dynamic set of Paxos variables. For example its <code>2n+1 to 2n+2</code> transition is:

1. Increase the quorum size.
2. Generate an event on each node.
3. Fetch all keys from the nodes up to the event, union them and sync all of them. Of course this operation may be optimized by batching and by parallel processing.
4. Add a new node to the set of nodes.

Up to this point we designed a replicated key/value with strong consistency and per key test-and-set concurrency control primitive. Since the whole dataset fits one node nothing prevents us from maintaining the order on keys and support range queries.

The next step is to support sharding.

<h2>Sharding</h2>

Imagine a key value storage that lives on three nodes.

<img src="{{ site.url }}/images/sharded-paxos-1.png" width="450" class="sharded-paxos-pic"/>

Some day because of the storage usage or high load we will decide to split the storage. So we peek a key from the key space and split the key/value storage into two logical groups. First group (A) contains key less-or-equal to the key and the second group contains the rest (B).

<img src="{{ site.url }}/images/sharded-paxos-2.png" width="450" class="sharded-paxos-pic"/>

Then we add a node to the B group.

<img src="{{ site.url }}/images/sharded-paxos-3.png" width="500" class="sharded-paxos-pic"/>

And remove a node from it.

<img src="{{ site.url }}/images/sharded-paxos-4.png" width="500" class="sharded-paxos-pic"/>

And repeat the process until we get A and B clusters working on the different sets of nodes.

<img src="{{ site.url }}/images/sharded-paxos-5.png" width="545" class="sharded-paxos-pic"/>

As a result we split the storage without stopping the cluster or loosing consistency.
