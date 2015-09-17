---
layout: post
title: rystsov::How Paxos works
name: How Paxos works
tags: ["tbd"]
desc: "A memo on how Paxos works"
has_comments: true
---

<div class="abstract-center">
<h1 align="center">A memo on how Paxos works</h1>

<p class="it"><span class="abstract-h1">Abstract. </span>
A couple of months later after I understand Paxos I realised that I can't reproduce the proof, so I read PMS a couple of 
time until I understand it once again. To avoid this situation in the future I wrote this memo and hope that the next time
I'll do in one pass.</p>
</div>

Paxos is a class of synod-based algorithms for building available consistent partition-tolerance distributed systems. It means that if you build a key/value storage with Paxos it should keep working in the presents of network errors (partition-tolerance), node failures (availability) and produce non-contradictory view for each client (consistency).

## Doesn't it violate CAP theorem?
No, it doesn't. Availability in the CAP sense is very strict. For example, a system using two-phase commit (2PC) algorithm 
and a system using Paxos algorithm are both unavailable in a CAP sense. Yet it makes sense for the 2PC system since the 2PC's 
coordinator is a single point of failure and the system can't even tolerate failure of a single node but it's strange for Paxos 
because it tolerates failures of up to N nodes of 2N+1. So Paxos is an available in common sense CP system.

## What can we build with Paxos?

<img src="{{ site.url }}/images/put-on-paxos.png" width="500" class="center-pic"/>

We can build a distributed state machine with Paxos hence we can implement any algorithm on top of it. But it's very 
hard to think about an unscoped domain, so in this post we consider Paxos as a foundation for building distributed data 
storages.

For storages it's a common practice to have two different set of operations: to change the state of the storage and to 
query it. We can observe the same pattern in HTTP (with POST/GET request) and in CQRS (command query responsibility 
segregation) pattern. Paxos provides the consistency guaranties only for write operations, so there is no diffrence between 
write and query operations. To query the system makes 'dirty' read, writes the state back and when it gets consistency 
guaranty it query the state.

## Wait, don't pay so much attention to the details, what is the topology of the Paxos-based distributed system?

Usually a Paxos based distributed system consists of clients, proposals and acceptors. Clients are nodes who wants to 
change or to query the state of system. To do that they connect to any proposal and express the intention, proposal 
commnicates with the acceptors and eventually they agree if the intention was statisfy, rejected or timeouted. Once 
the change is accepted all sequential reads should respect this change.

The paxos topology is similar to the typical 3-tier application (where clients are web-browsers, proposal are fron-end 
servers and acceptors are databases).

## Ok, how proposal and acceptors communicate to agree How the participates of the distributed system communicate?
