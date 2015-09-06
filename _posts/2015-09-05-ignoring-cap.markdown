---
layout: post
title: rystsov::YACAP
name: Yet another post about CAP theorem and the ways to ignore it
tags: ["pre_distr"]
desc: "CAP theorem is much weaker most people think and it's possible to build a system that satisfy business requirements without violating the theorem"
has_comments: true
---

<h1>Ignoring the CAP</h1>

CAP theorem states you can pick two of three:

<ul id="what_is_cap">
<li><span>C.</span> Linearizability (sanity)</li>
<li><span>A.</span> Availability (response time of any alive node doesn't depend on the duration of network failures or on the duration of downtime of other nodes)</li>
<li><span>P.</span> Network failure (split brain) resistance</li>
</ul>

Since the network is unreliable we can't ignore P it implies we should choose between:

1. sanity but unavailability (CP)
2. availability but insanity (AP)

The choice seems to be very hard. But hopefully A. and P. both have a wide range of values so we can keep sanity and trade some levels of split-brain resistance for availability. For example paxos-based solutions are available as long you are in the same partitioning as a quorum of the nodes.

In this post I want to describe a couple of ways how to keep sanity and sane levels of AP.

<h2>Separate worlds and saga transactions</h2>

A principle of locality states that any interaction between objects happens only if the objects are close to each other. It holds both for physics and social studies. For example it's expectable that people tend to interact with people from the same city.

The principle gives birth to a common pattern for MMORPG games and other distributed systems: to split participants into groups to minimize interaction between members of different groups and to store data of the same group on the same shard. Since most interactions are local then majority of the operations are inter-shard and cross-shard transactions are rare so if there is a split brain then it affects only small number of operations. We will discuss later how to handle those transactions.

Another interesting result of the locality principle is that people expect that interaction between distant object takes time. For example a gamer of a Star Trek based MMORPG may except that it may take time to send loot from Vulcan to Qo'noS; or a user of online banking system may except that sending money to an oversea account takes more time than locally.

It gives us a chance to easy availability of some operations without hurting the business. For example if customer excepts that the execution of the cross group operations may take time then a distributed system can postpone execution of cross-shard transactions until the network partition is fixed. The expectable delay hides availability effect of the split-brain. In terms of CAP theorem we sacrificed availability of some operations (cross group operations) in order to provide C and better P.

Yet we allow some transactions to be continues in time it doesn't mean that we want customers to wait until the transactions are finished. Hence we split a transaction into blocking local and asynchronous remote parts. For example when customer wants to transfer money from, say, US account to Indonesia the system may:

1. Create a object describing a transaction and its status in the US shard
2. Block money on the US account
3. Put an inquiry to the Indonesian output queue on US shard

Once the connection is restored Indonesian shard:

1. reads the messages from the Indonesian output queues on the remote shards
2. adds money to the account
3. notify the US shard that the transaction is over (via the US output queue)

The US user can monitor of the progress of the transaction via the transaction object.

BTW The idea of splitting one logical transaction into several storage transaction is called saga transactions.

<h2>Dual citizenship</h2>

Imagine that we built a banking system using the separate worlds idea for a bank with branches all over the world. It is natural to group people by country and to host country's shard in the country to provide best latency for the customers. This approach has a several disadvantages. One of them: in case of network partitioning a client from one country who visit another country can't access his money.

The obvious solution is split person's account between two shards: home shard to store major fraction of money and foreigner shard to store smaller fraction. With this modification any customer can use foreigner account when the connectivity with home shard is loss. The use of different accounts can be made implicit to customers.

<h2>Conclusion</h2>

CAP theorem tells us that we can only pick two of three CAP-properties. Hopefully CAP's definitions for availability and other properties are too strict and we can build a robust distributed system that solves business tasks using not so C, not so A or not so P foundation. 

When I realized this my perception of CAP theorem shifted. I visualized CAP theorem as this inequality:

<img src="{{ site.url }}/images/cap.png" width="450" class="center-pic"/>

When n is 1 we have to choose between CP or AP systems. In real life we can live with different range of not so available services (like paxos) so have different scale of availability and n > 1. It means that we have larger variety of the distributed systems with different consistency or available levels and some of them they may fit our requirements.

BTW the number of the solutions of the inequality grows as a quadratic function of n.

