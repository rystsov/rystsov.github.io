---
layout: post
title: rystsov::Paxos-based sharded ordered key value store with CAS
name: Paxos-based sharded ordered key value store with CAS
tags: ["misc"]
desc: "How to run an instance of paxos register per per key to get a key value storage and shard it on the fly without loosing consistency"
has_comments: true
---

<h1>Paxos-based sharded ordered key value store with CAS</h1>

To build a key value storage each node runs a new instance of paxos register each time when the node receives a get or put request for a unseen key and redirect all further requests related to the key to that register. Of course different instances on the same node should share the quorum size and the set of nodes and use unified membership change mechanism which generalises the paxos variable's version to with work with a dynamic set of paxos registers. For example its <code>2n+1 to 2n+2</code> transition is:
1. Increase the quorum size.
2. Generate an event on each node.
3. Fetch all keys from the nodes up to the event, union them and sync all of them. Of course this operation can be batched and paralleled.
4. Add a new node to the set of nodes.

Up to this point we designed a replicated key/value with strong consistency and per key test-and-set concurrency control primitive. Since the whole dataset fits one node nothing prevents us from maintaining the order on keys and support range queries.

The next step is to support sharding.

<h2>Sharding</h2>

Imagine a key value storage that lives on three nodes.

<div><img src="{{ site.url }}/images/sharded-paxos-1.png"/></div>

Some day because of the storage usage or high load we will decide to split the storage. So we peek a key from the key space and split the key/value storage into two logical group. First group (A) contains key less-or-equal to the key and the second group contains the rest (B).

<div><img src="{{ site.url }}/images/sharded-paxos-2.png" /></div>

Then we add a node to the B group.

<div><img src="{{ site.url }}/images/sharded-paxos-3.png" /></div>

And remove a node from it.

<div><img src="{{ site.url }}/images/sharded-paxos-4.png" /></div>

And repeat the process until we get A and B clusters working on the different set of nodes.

<div><img src="{{ site.url }}/images/sharded-paxos-5.png" /></div>

As a result we split the storage without stopping the cluster or loosing consistency.
