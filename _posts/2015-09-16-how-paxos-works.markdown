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
I had understood Paxos. A couple of months later I realised that I can't reproduce the proof, so I read Paxos Made Simple article several times until I understood it once again. To avoid this situation in the future I wrote this memo and hope that the next time I'll revise the algorithm in one pass.</p>
</div>

## What is Paxos?

Paxos is a class of synod-based algorithms for building available consistent partition-tolerance distributed systems. It means that if you build a key/value storage with Paxos it should keep working in the presents of network errors (partition-tolerance), node failures (availability) and produce non-contradictory view for each client (consistency).

## Doesn't it violate CAP theorem?
No, it doesn't. Availability in the CAP sense is very strict. For example, a system using two-phase commit (2PC) algorithm 
and a system using Paxos algorithm are both unavailable in a CAP sense. Yet it makes sense for the 2PC system since the 2PC's 
coordinator is a single point of failure and the system can't even tolerate failure of a single node but it's strange for Paxos 
because it tolerates failures of up to N nodes of 2N+1. So Paxos is an available in common sense CP system.

## What can we build with Paxos?

<img src="{{ site.url }}/images/put-on-paxos.jpg" width="500" class="center-pic"/>

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

The paxos topology is similar to the typical 3-tier application (where clients are web-browsers, proposal are front-end 
servers and acceptors are databases).

> **If proposals are similar to front-end servers does it mean that the proposals are stateless?**

No, proposals should be able to generate a unique ID for every request (this ID is known as ballot number) so they should store last used number to be able to generate a new ballot number which is greater than last one. For example servers may have unique coprime numbers as ID and generate next ballot number as a next number which is divisible by the current node's ID and coprime with the ID of the other nodes. If the id of two servers are 3 and 5 then two sequence they generate are 3,6,9,12,18,.. and 5,10,20,25,35,..

## Ok, how proposal and acceptors communicate to agree on the state's change?

Let's take a look on how a Paxos-based distributed system handles a state change request. In typical case it looks like the
following diagram.

<img src="{{ site.url }}/images/paxos-seq.png" width="600" class="center-pic"/>

On the diagram we see two rounds of proposal-acceptors communications. Also we can esimane that for one change the system 
generates from `4f+6` to `8f+6` where `f` is a number of failures that the system can tolerate.

If something bad happened and client didn't recieve confirmation then she should query the state to understand if her change
was applied or not. The concurrent request from the client may collide and abort each other. In this case the clients should read the state and reapply the changes if necessary.

The correctness will be proved below in the post.

## Stop hand waving and show me the code!

Ok. Let's start with the acceptors. As you can see from the sequence diagram it should support two phases: prepare and accept. They are supported via the corresponding endpoints. The algorithm is written in a Python inspired pseudocode. I assume that every hdd.write call is flushed to the disk.

{% gist rystsov/44b25528e74bb617726d %}

As you remember clients communicate only with the proposals so it's a good idea to explore its API. It shouldn't be a surprise that the Proposal's API consists of one `change_query` function which does both query and state change because I did mention before that Paxos guarantees consistensy only for write requests hence to query the state we have to change it.

The `change_query` endpoint accepts two pure function: `change` and `query`. The `change` function validates the old state and maps it into the new state or throws an exception. The `query` function makes a projection of the new state which returns to the client.

Consider that we want to read a distributed variable then we may use identity transform both as `change` and as `query`. If want to perfom a CAS-guarded state transition from old to new value then we should use the following change-generator:

{% gist rystsov/1517327d88eb3576ef94 %}

Once we digest all the previous information the proposal's source code shouldn't be scary.

{% gist rystsov/ca9d195b2737039faaf3 %}

## Why (the hell) it works?

The Paxos algorithm gives us a way to build reliable distributed data structures which keep work in a predictable way even if the whole system experiences network partitioning or node failures. As long as a client can communicate with a proposer and the proposer sees the quorum of the acceptors then the distributed data structure behaves like a concurrent data structure with a serializability property; otherwise it is unavailable.

Let's prove it. First of all we need to make the statement we want to prove more math-ish.

Serializability means that all concurrent operations are executed in some serial order. The order on operations implies the order on the states of the data structure. Now we can define releation on the states, we say that state `B` is a descendant of `A` if `B` is a result of applying one or several `change` functions to the `A` state. We use the subset notation for this

> `A \subset B`

If we show that any successful state change is an ancestor of any future successful state changes then the statement will be proved.

We will do it by reasoning about the space of events (see emit_* int the code of acceptors and proposers).

### The proof

When the system is about to send a confirmation that the state was changed (n is a ballot number of the change) it calls emit_executed(n,...) to generate an event. We use $\bar{n}^2$ symbol to refer to this event. $\bar{n}^1$ is used for emit_prepared(n,...), $\ddot{n}^2$ for emit_accepted(n,...) and $\ddot{n}^1$ for emit_promised(n,...).

By definition $\bar{n}^1$ and $\bar{n}^2$ are single events, but $\ddot{n}^1$ and $\ddot{n}^2$ each is a sets of events where different events of the set corespond to different acceptors.

We use $\mathrm{E}$ to name a set of events generated by an instance of the system (track). We use $\mathbb{E}$ to refer to sets of tracks.

We want to prove that any new successfuly writen state is an descendant of all previous successfull written state changes. Let's translate it to math:

$$\forall \mathrm{E} \in \mathbb{E} \quad \forall \bar{n}^2 \in \mathrm{E} \quad \forall \bar{m}^2 \in \mathrm{E} \quad \mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\bar{m}^2) \vee \mathrm{s}(\bar{m}^2) \subset \mathrm{s}(\bar{n}^2)$$

where $\mathrm{s}(x) \equiv x.\mathrm{state}$.

To improve readability we omit the declarations of existance of all used events. For example the later expression we simplify to

$$\mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\bar{m}^2) \vee \mathrm{s}(\bar{m}^2) \subset \mathrm{s}(\bar{n}^2)$$

For the same purpose we allow to use $\ddot{n}^2$ and $\ddot{n}^1$ symbols a scalar context like $\mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\ddot{m}^2)$ instead of using the verbose expression: $\forall \dot{m}^2 \in \ddot{m}^2 \quad \mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\dot{m}^2)$.

We're proving that:

$$\mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\bar{m}^2) \vee \mathrm{s}(\bar{m}^2) \subset \mathrm{s}(\bar{n}^2)$$

It obviously holds for any track if the following expression is true for the same track:

$$n<m \Rightarrow \mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\bar{m}^2)$$

It holds for the track the following expression also holds:

$$n<m \Rightarrow \mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\ddot{m}^2)$$

So we reduced our task to this problem. Let's prove it by contradiction.

Let

$$\exists n \; \exists m \; n < m \; : \; \mathrm{s}(\bar{n}^2) \not\subset \mathrm{s}(\ddot{m}^2)$$

We will use a couple of lemmas to falsify it. But first we need to define `unwrap` function which maps a ballot number of the write to the ballot number of the previous write.

$$\mathrm{unwrap}(\ddot{x}^2) = \bar{x}^1.\mathrm{vassals}.\mathrm{max}(x \to x.\mathrm{accepted\_n}).\mathrm{accepted\_n}$$

We may think about `unwrap` as an invertion of the `change`, because

$$ \mathrm{s}(\ddot{b}^2) = \mathrm{change}(\mathrm{s}(\ddot{a}^2)) \;\Rightarrow\; a=\mathrm{unwrap}(\ddot{b}^2)$$

We're ready the lemmas.

**Lemma 1** $\mathrm{s}(\ddot{b}^2) = \mathrm{change}(\mathrm{s}(\ddot{a}^2)) \;\Rightarrow\; a<b$

**Lemma 2** $\forall \bar{a}^2 \in \mathrm{E} \; \forall b>a \quad \ddot{b}^2 \in \mathrm{E} \;\Rightarrow\; a \leq \mathrm{unwrap}(\ddot{b}^2)$ 

We want to use them to falsify the assumption:

$$\exists n \; \exists m \; n < m \; : \; \mathrm{s}(\bar{n}^2) \not\subset \mathrm{s}(\ddot{m}^2)$$

1. $z = m,\;k=0$.
2. $z_{k+1} = \mathrm{unwrap}(z_k),\;k=k+1$. Bacause of the first lemma $z_x$ is an ansestor of any $z_y$ where $y<x$
3. Lemma 2 states that $n \leq z_k$. So we have two cases:
    1. If $n < z_k$ then goto step #2
    2. If $n = z_k$ then $n$ is $z_k$, but $z_k$ is an ansestor of $z_0$ which is $m$ hence $\mathrm{s}(\bar{n}^2) \subset \mathrm{s}(\ddot{m}^2)$ Q.E.D.

Lemma 1 is true because we explicitly check it in the proposer's source code, see the monotonicity assert.

Let's proove the second lemma. We need to show that

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
