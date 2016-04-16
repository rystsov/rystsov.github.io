---
layout: post
title: Distributed variable
name: Distributed variable
tags: ["distr"]
desc: "How to update the write-once distribted switch into a distributed variable with a compare-and-set (CAS) concurrency control mechanism"
has_comments: true
---

<h1>Distributed variable</h1>

In the previous [article]({% post_url 2015-08-22-paxos-register %}) I showed how to create a write-once distributed switch. However in real life we usually want to mutate state. So Let's fix it and design a distributed variable.

<div class="confession">There was variable's pseudocode but later I realised that single degree Paxos can be used as state machine itself. When I did it I saw that there is almost no difference between ditributed switch, variable or even CAS-guarded variable. Please read the <a href="{% post_url 2015-09-16-how-paxos-works %}">A memo on how Paxos works</a> post to understand it and to get information on how to build them.</div>
