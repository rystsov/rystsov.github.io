---
layout: post
title: rystsov::Distributed register
name: Distributed register
tags: ["distr"]
desc: "How to update the write-once registor into a distributed fault-tolerance mutable register with the compare-and-set (CAS) concurrency control mechanism"
has_comments: true
---

<h1>Distributed register</h1>

In the previous [article]({% post_url 2015-08-22-paxos-register %}) I showed how to create a write-once distributed switch. However in real life we usually want to mutate state. So Let's fix it and design a distributed variable.

{% gist rystsov/a45793daa1662a921479 %}

{% gist rystsov/55b68e8ef68b977598b1 %}

{% gist rystsov/7f8db599d44ee635655f %}
