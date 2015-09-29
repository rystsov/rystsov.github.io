---
layout: post
title: rystsov::Write-once distributed switch
name: Write-once distributed switch
tags: ["distr"]
desc: "Design of the write-once distributed switch"
has_comments: true
---

<h1>Write-once distributed switch</h1>

Imagine a service that provides an API to read and to write a write-once switch (a variable that can be set only once) with the following properties:

1. If a write request succeeds then any consequent write should fail.
2. If a value is written then any consequent read must return the value or fail.
3. Any read request must return empty value until a value is written

The implementation of the service is straightforward when we plan to run it on a single node. But any single node solution has a reliability/availability problem: when the node goes off-line (due to crash or maintenance procedures) our service is unavailable. The obvious solution is to run a service on several nodes to achieve high availability. At that point we enter the realm of distributed systems and everything (including our service) gets more complicated. Try to think how to satisfy the desired properties listed above in a distributed environment (where nodes may temporary go offline and where network may lose messages) and you will see that consistency is a tough problem.

Hopefully this task is already solved by the Paxos consensus algorithm. People usually use Paxos to build way more complex systems than the described service but the algorithm is also applicable here. Moreover the fact that the switch is one of the simplest distributed systems that can be built based on Paxos makes it a good entry point for the engineers who want to understand Paxos by example.

<div class="confession">I wrote this post before I realised that single degree Paxos can be used as state machine itself. When I did it I saw that there is almost no difference between ditributed switch, variable or even CAS-guarded variable. Please read the <a href="{% post_url 2015-09-16-how-paxos-works %}">A memo on how Paxos works</a> post to get information on how to implement them.</div>
