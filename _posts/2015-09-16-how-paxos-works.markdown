---
layout: post
title: rystsov::How Paxos works
name: How Paxos works
tags: ["tbd"]
desc: "A memo on how Paxos works"
has_comments: true
has_math: true
---

<div class="abstract-center">
<h1 align="center">A memo on how Paxos works</h1>

<p class="it"><span class="abstract-h1">Abstract. </span>
Once I understood Paxos but a couple of months later I realised that I didn't. I reread 'Paxos Made Simple' but it was almost as hard as the first time so I wrote this memo to help me in the future to understand Paxos faster.</p>
</div>

## What is Paxos?

Paxos is a class of synod-based algorithms for building available consistent distributed systems on top of asynchronous and unreliable network. For example if you're building a key/value storage then Paxos will help you to keep it working in the present of network errors (partition-tolerance), node failures (availability) and to produce non-contradictory (between clients) views.

## Doesn't it violate CAP theorem?

No, it doesn't. Availability in the CAP sense is very strict. For example, a system using two-phase commit (2PC) algorithm 
and a system using Paxos algorithm are both unavailable in a CAP sense. It makes sense for the 2PC system since the 2PC's 
coordinator is a single point of failure but it's strange for Paxos because it tolerates up to N fails out of 2N+1 nodes.

Paxos is an available in common sense CP system.

## What can we build with Paxos?

<img src="{{ site.url }}/images/put-on-paxos.jpg" width="500" class="center-pic"/>

We can build a distributed state machine with Paxos and implement any algorithm on top of it. But it's very 
hard to think about an unscoped domain, so in this post we consider Paxos as a foundation for building distributed data 
storages.

It's a common practice for storages to have write operations to mutate its state and read operations to query it. Paxos is different, it guaranties consistency only for write operations, so to query its state the system makes read, writes the state back and when the state change is accepted the system queries the written state.

## Wait, don't pay so much attention to the details, what is the topology of the Paxos-based distributed system?

Usually a Paxos-based distributed system consists of clients, proposers and acceptors. Clients
mutate and query the state of the system, proposers process the client's commands and acceptors store the information.

The paxos topology is similar to the typical 3-tier application (where clients are web-browsers, proposers are front-end 
servers and acceptors are databases).

> **If proposals are similar to front-end servers does it mean that the proposals are stateless?**

No, proposals should be able to generate a global unique ID (ballot number) for every request it process. They store last used ballot number to be able to generate a new one which is greater than the current. For example servers may have unique coprime numbers as ID and generate next ballot number as a next number which is divisible by the current node's ID and coprime with the ID of the other nodes. If the id of two servers are 3 and 5 then two sequences they generate are 3,6,9,12,18,.. and 5,10,20,25,35,..

## Ok, how proposal and acceptors communicate to agree on the system state?

Let's take a look on how a Paxos-based distributed system handles a state mutation request. In typical case is:

1. Client connects to any single proposal and issue the command.
2. The proposal commnicates with the acceptors and agree on the system's state.
3. Once the change is accepted all reads should reflect the change.

<img src="{{ site.url }}/images/paxos-seq.png" width="600" class="center-pic"/>

On the diagram we see two rounds of proposal-acceptors communications. We also can estimate that the system 
generates from `4f+6` to `8f+6` messages for every change/read where `f` is a number of failures that the system can tolerate.

If something bad happens and client doesn't recieve a confirmation then she should query the system to understand if her change
was applied or not. For example it may happen when the concurrent requests from the clients may collide and abort each other.

## Stop hand waving and show me the code!

Ok. Let's start with the acceptors. As you can see from the sequence diagram it supports two phases: prepare and accept. They are supported via the corresponding endpoints. The algorithm itself is written in a Python inspired pseudocode. I assume that every hdd.write call is flushed to the disk.

{% gist rystsov/44b25528e74bb617726d %}

As you remember clients communicate only with the proposals so it's a good idea to explore its API. I did mention before that Paxos guarantees consistensy only for write requests so it shouldn't be a surprise that the proposer's API consists just of one `change_query` endpoint.

It accepts two pure function: `change` and `query`. The `change` function validates the old state and maps it into the new state (or throws an exception). The `query` function makes a projection of the new state and returns it to the client.

Consider that we want to read a distributed variable then we may use identity transform both as `change` and as `query`. If want to perfom a CAS-guarded state transition from old to new value then we should use the following change-generator:

{% gist rystsov/1517327d88eb3576ef94 %}

Once we digest all the previous information the proposal's source code shouldn't be too scary.

{% gist rystsov/ca9d195b2737039faaf3 %}

## Why (the hell) it works?

The Paxos algorithm gives us a way to build reliable distributed data structures which keep work in a predictable way even if the whole system experiences network partitioning or node failures. As long as a client can communicate with a proposer and the proposer sees the quorum of the acceptors the distributed storage behaves like a thread safe (serializability) data structure (unavailable otherwise).

Let's prove it. First of all we need to make the statement we want to prove more math-ish.

Serializability means that all concurrent operations are executed in some serial order which gives us a sequence of states.

The order on operations implies the order on the states of the data structure. It gives us a hint that we Now we can define releation on the states, we say that state `B` is a descendant of `A` if `B` is a result of applying one or several `change` functions to the `A` state. We use the subset notation for this

> $A \subset B$

If we show that any successful state change is an ancestor of any future successful state changes then the statement will be proved.

We will do it by reasoning about the space of events (see emit_* invocation in the code of acceptors and proposers).

<div class="hpw-conventions">

<p>When the system is about to send a confirmation that the state was changed (n is a ballot number of the change) it calls emit_executed(n,...) to generate an event. We use $\bar{n}^2$ symbol to refer to this event. $\bar{n}^1$ is used for emit_prepared(n,...), $\ddot{n}^2$ for emit_accepted(n,...) and $\ddot{n}^1$ for emit_promised(n,...).</p>

<p>By definition $\bar{n}^1$ and $\bar{n}^2$ are single events, but $\ddot{n}^1$ and $\ddot{n}^2$ each is a sets of events where different events of the set corespond to different acceptors.</p>

<p>We use $\mathrm{E}$ to name a set of events generated by an instance of the system (track). We use $\mathbb{E}$ to refer to sets of tracks.</p>

<p>We want to prove that any new successfuly writen state is an descendant of all previous successfull written state changes. Let's translate it to math:</p>

$$\forall \mathrm{E} \in \mathbb{E} \quad \forall \bar{n}^2 \in \mathrm{E} \quad \forall \bar{m}^2 \in \mathrm{E} \quad \mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\bar{m}^2) \vee \mathrm{s}(\bar{m}^2) \subset \mathrm{s}(\bar{n}^2)$$

<p>where $\mathrm{s}(x) \equiv x.\mathrm{state}$.</p>

<p>To improve readability we omit the declarations of existance of all used events. For example the later expression we simplify to</p>

$$\mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\bar{m}^2) \vee \mathrm{s}(\bar{m}^2) \subset \mathrm{s}(\bar{n}^2)$$

<p>For the same purpose we allow to use $\ddot{n}^2$ and $\ddot{n}^1$ symbols a scalar context like $\mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\ddot{m}^2)$ instead of using the verbose expression: $\forall \dot{m}^2 \in \ddot{m}^2 \quad \mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\dot{m}^2)$.</p>

</div>

**Statement.** We're proving that:

$$\mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\bar{m}^2) \vee \mathrm{s}(\bar{m}^2) \subset \mathrm{s}(\bar{n}^2)$$

It obviously holds for any track if the following expression is true for the same track:

$$n<m \Rightarrow \mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\bar{m}^2)$$

It holds for the track the following expression also holds:

$$n<m \Rightarrow \mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\ddot{m}^2)$$

So we reduced our task to this problem. Let's prove it by contradiction.

**Proof.** Let

$$\exists n \; \exists m \; n < m \; : \; \mathrm{s}(\bar{n}^2) \not\subset \mathrm{s}(\ddot{m}^2)$$

We will use a couple of lemmas to falsify it. But first we need to define `unwrap` function which maps a ballot number of the write to the ballot number of the previous write.

$$\mathrm{unwrap}(\ddot{x}^2) = \bar{x}^1.\mathrm{vassals}.\mathrm{max}(x \to x.\mathrm{accepted\_n}).\mathrm{accepted\_n}$$

We may think about `unwrap` as an invertion of the `change`, because

$$ \mathrm{s}(\ddot{b}^2) = \mathrm{change}(\mathrm{s}(\ddot{a}^2)) \;\Rightarrow\; a=\mathrm{unwrap}(\ddot{b}^2)$$

We're ready the lemmas.

*Lemma 1* $\mathrm{s}(\ddot{b}^2) = \mathrm{change}(\mathrm{s}(\ddot{a}^2)) \;\Rightarrow\; a<b$

*Lemma 2* $\forall \bar{a}^2 \in \mathrm{E} \; \forall b>a \quad \ddot{b}^2 \in \mathrm{E} \;\Rightarrow\; a \leq \mathrm{unwrap}(\ddot{b}^2)$ 

We want to use them to falsify the assumption:

$$\exists n \; \exists m \; n < m \; : \; \mathrm{s}(\bar{n}^2) \not\subset \mathrm{s}(\ddot{m}^2)$$

1. $z = m,\;k=0$.
2. $z_{k+1} = \mathrm{unwrap}(z_k),\;k=k+1$. Bacause of the first lemma $z_x$ is an ansestor of any $z_y$ where $y<x$
3. Lemma 2 states that $n \leq z_k$. So we have two cases:
    1. If $n < z_k$ then goto step #2
    2. If $n = z_k$ then $n$ is $z_k$, but $z_k$ is an ansestor of $z_0$ which is $m$ hence $\mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\ddot{m}^2)$ **Q.E.D.**

**Lemma 1** $\mathrm{s}(\ddot{b}^2) = \mathrm{change}(\mathrm{s}(\ddot{a}^2)) \;\Rightarrow\; a<b$ is true because we explicitly check it in the proposer's source code, see [the monotonicity assert](https://gist.github.com/rystsov/ca9d195b2737039faaf3#file-how-paxos-proposer-py-L24).

**Lemma 2.** $\forall \bar{a}^2 \in \mathrm{E} \; \forall b>a \quad \ddot{b}^2 \in \mathrm{E} \;\Rightarrow\; a \leq \mathrm{unwrap}(\ddot{b}^2)$ 

**Proof.** Let's proove the second lemma. We need to show that

$$ \forall \bar{a}^2 \in \mathrm{E} \; \forall b>a \quad \ddot{b}^2 \in \mathrm{E} \;\Rightarrow\; a \leq \mathrm{unwrap}(\ddot{b}^2) $$

**The proof.** Since we don't write a new state $\ddot{b}^2$ unless we got a confirmation from the majority $\bar{b}^1$ then the following statement holds:

$$\forall \ddot{b}^2 \in \mathrm{E} \;\Rightarrow\; \forall \bar{b}^1 \in \mathrm{E}$$

Proposer should receive promises from a majority of the acceptors before it generates a $\ddot{b}^1$ event. It guarantees truth of the following expression:

$$\mathrm{N} = \bar{b}.\mathrm{vassals}.[\mathrm{node\_id}] \cap \ddot{a}^2.[\mathrm{node\_id}] \neq \emptyset$$

Where $\bigtriangleup.[\odot]\equiv\bigtriangleup.\mathrm{map}(x\to x.\odot)$.

Let $n \in \mathrm{N}, \; \dot{a}^2 \in \ddot{a}^2 \cap \mathrm{E[n]}$ and $\dot{b}^1 \in \ddot{b}^1 \cap \mathrm{E[n]}$ where $\mathrm{E[n]}$ are events that happened on the $n$ node.

$\dot{a}^2.\mathrm{ts} < \dot{b}^1.\mathrm{ts}$ holds because acceptor doesn't accept states with lower ballot number when it promised to accept a state with higher ballot number and $a<b$.

By definition $\dot{a}^2.\mathrm{accepted\_n}$ is the ballot number of the accepted state at monent $\dot{a}.\mathrm{ts}$ on node $n$. The same is also true for $\dot{b}^1$.

Since the ballot numbers of the accepted state is a monotonically increasing function of time then

$$\dot{a}^2.\mathrm{accepted\_n} \leq \dot{b}^1.\mathrm{accepted\_n}$$

By definition $\dot{b}^1.\mathrm{accepted\_n} \in \bar{b}^1.\mathrm{vassals}.[\mathrm{accepted\_n}]$ so

$$\dot{b}^1.\mathrm{accepted\_n} \leq \bar{b}^1.\mathrm{vassals}.\mathrm{max}(x \to x.\mathrm{accepted\_n}).\mathrm{accepted\_n} = \mathrm{unwrap}(\ddot{b}^2)$$

And it's the final in prooving the lemma since:

$$a = \dot{a}^2.\mathrm{accepted\_n} \leq \dot{b}^1.\mathrm{accepted\_n} \leq \mathrm{unwrap}(\ddot{b}^2)$$

Q.E.D.
