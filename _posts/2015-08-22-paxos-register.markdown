---
layout: post
title: rystsov::The Paxos Register
name: The Paxos Register
tags: ["misc"]
has_comments: true
---

<h1>The Paxos Register</h1>

Imagine a service that provides an API to read and to write a write-once variable with the following properties:

1. If a write request succeeds then any consequent write should fail.
2. If a value is written then any consequent read must return the value or fail.
3. Any read request must return empty value until a value is written

The implementation of the service is straightforward when we plan to run it on a single node. But any single node solution has a reliability/availability problem: when the node goes off-line (due to crash or maintenance procedures) our service is unavailable. The obvious solution is to run a service on several nodes to achieve high availability. At that point we enter the realm of distributed systems and everything (including our service) gets harder. Try to think how to satisfy the desired properties in a distributed environment (where nodes may temporary go offline and where network may lose messages) and you will see that consistency is a tough problem.

Hopefully this task is already solved by the paxos consensus algorithm. People usually use paxos to build way more complex systems than the described service (register) but the algorithm is also applicable here. Moreover the fact that the register is one of the simplest distributed system that can be built based on paxos makes it is a good entry point for the engineers who what to understand paxos on an example.

The description of the register is written in a python inspired pseudocode. I assume that every write to an instance variable is intercepted, redirected to a persistent storage and fsync-ed. Of course every read from an instance variable reads from the storage. The pseudocode follows the algorithm described in the [Paxos Made Simple](http://research.microsoft.com/en-us/um/people/lamport/pubs/paxos-simple.pdf) paper by Leslie Lamport, please read it to understand the idea behind the code and see the proof.

Acceptors:

{% gist rystsov/1614f7499d0aca0f8fb4 %}

API:

{% gist rystsov/324373b0de555a31ac45 %}

Heart of the algorithm:

{% gist rystsov/9de335004dc2718f70f4 %}
