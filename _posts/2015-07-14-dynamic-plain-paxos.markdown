---
layout: post
title: rystsov::Dynamic Plain Paxos
name: Dynamic Plain Paxos
tags: ["misc"]
has_comments: true
---

<div class="abstract-center">
<h1 align="center">Dynamic Plain Paxos</h1>

<p class="it"><span class="abstract-h1">Abstract. </span>The classic Paxos consensus algorithm requires a static set of 2F+1 processes to tolerate F transient failures. Dynamic Plain Paxos is an extension and a drop-in replacement for the classic Paxos algorithm that allows to change the membership during the reaching of consensus. It satisfies the requirements of the real world systems to replace a permanently failed node or to extend the size of the cluster to tolerate more transient failures.</p>

<p class="it">The article describes a generic way to prove the correctness of paxos-based distributes systems during the change of configuration and uses it to prove the correctness of membership changes.</p>

<p><span class="abstract-h1">Article.</span>
<a href="{{ site.url }}/files/dynamic-plain-paxos.pdf">http://rystsov.info/files/dynamic-plain-paxos.pdf</a></p>
</div>

<h2>Reflections</h2>

In theory Paxos is very simple algorithm but in practice it is very hard to do it right. Partially it happens because the original paper omits non-essential sub-problems like:
 
 1. generation of ballot numbers
 2. leader election
 3. membership change

The first two problems have various solutions. For example, if we assign a unique number to each proposer from a set of co-prime numbers then each proposer can use exponent of the positive integers with base equal to it's unique number as a source of ballot numbers. Since paxos doesn't lose consistency when there are several leaders one can implement leader election by timeouts and heartbeats and doesn't care if they overlap in the most weirdest way.

On the contrary the third problem is hard and I haven't found an extension of the paxos that solves it. Yet it doesn't mean that paxos doesn't support membership change :)

Usually when people talk about paxos they may keep in mind either consensus protocol (aka Synod, single instance paxos or plain paxos) or a replicated state machine (aka Multi-Paxos) because both of them were described in the original paxos paper. Its true that Synod doesn't support membership manipulations but some flavors of multi-paxos, e.g. Cheap Paxos, do.

Since engineers need an ability to replace, to remove or to add a server to a cluster they don't care about plain paxos. They go even further and use paxos and multi-paxos as synonyms like Diego Ongaro does with the Raft paper.

This equivocation explains why paxos may be made simple (synod) and moderately complex (multi-paxos) at the same time.

I believe that we, engineers, must fight complexity every moment. So I really don't like that we are forced to build systems around multi-paxos instead of paxos just to achieve desired operational characteristics. Moreover I felt the complexity of multi-paxos doesn't correspond to the complexity of the problem it solves. It gave me a courage to design [an extension of the plain paxos]({{ site.url }}/files/dynamic-plain-paxos.pdf) that solves the third problem but stays as close as possible to the plain paxos.

I used an old fashioned way to prove the correctness of the algorithm and I'm pretty sure about the proof but I can't exclude a possibility of mistake. Of cause I asked several smart fellows to review the proof and they also didn't find any flow. But it would be better if more people would try to compromise it.

In the upcoming posts I want to demonstrate how to design distributed systems around Dynamic Plain Paxos instead of Multi-Paxos and to create a TLA+ spec.