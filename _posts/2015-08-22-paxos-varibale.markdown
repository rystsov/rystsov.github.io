---
layout: post
title: rystsov::The Paxos Variable
name: The Paxos Variable
tags: ["misc"]
has_comments: true
---

<h1>The Paxos Variable</h1>

In the previous article I showed how to create a write-once distributed register. But in real life we usually want to mutate state. So Let's fix it and design a distributed paxos based variable.

Distributed variable is a little bit more complex system than the register but it uses the same idea so if you understand the register then it should be easy to you to understand the variable's design.

The basic idea is to use a sequence of ordered registers to emulate a variable. For example to write a value we write it to the register with the lowest id among empty registers. To read a value we read it from the register with the highest id among filled registers.

Distributed environment is by definition is a concurrent environment too so its very important to have a compare-and-set (CAS) primitive for changing the variable's value. If we want to have a CAS primitive then we need to prevent modifications of the registers if a register with a higher is has already chosen a value. We can achieve it if maintain serializability between any successful register's modifications. Hopefully we can do it if make the acceptors to use the same promise. Let's take a look on the new acceptor's methods.

{% gist rystsov/a45793daa1662a921479 %}

You may be surprised since you don't see a sequence of the registers. Well, we always are interested only in the filled register with the largest id so we don't store the whole sequence.

The API consist of two functions

{% gist rystsov/55b68e8ef68b977598b1 %}

The heart of the algorithm

{% gist rystsov/7f8db599d44ee635655f %}
