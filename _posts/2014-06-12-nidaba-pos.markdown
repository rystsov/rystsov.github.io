---
layout: nidaba
title: rystsov::Nidaba::PoS
name: "Proof-of-work meets proof-of-stake"
tags: ["nidaba"]
---

<h1>51% attack is cheap </h1>

Nidaba's economics is based on several ideas:
<ul>
	<li>using the supply and demand model to keep the price of Nidaba's intrinsic currency stable</li>
	<li>setting an expiration date for intrinsic currency (after which it can't be transfered to a certificate's account) to keep the money production rate uniform</li>
	<li>charging an interest for keeping intrinsic currency on certificate's account for the same reason</li>
	<li>adjusting the base price of domain ownership to the rise of average miner's performance</li>
</ul>

Those ideas leads to a serious problem: on early stages of the network development a blockchain's fork can be done for a moderate price since the difficulty is proportial to the demand of intrinsic currency. As a result this can undermine the trust to the system. Suppose that the annual price of ownership is 30$ and that there are 1000 certificates with the base price of ownership then the price of creating the fork of one month lenght is 2500$ (1000*30$/12).

<h2>Using proof-of-stake as a protection</h2>

The solution is a combination of the proof-of-work (described in the Nidaba whitepaper) and a proof-of-stake, but instead of stake we use certificates, so it can be called the proof-of-cert.

1. after a miner mines the block they broadcasts it
2. using the block's hash as a seed the list of certificates is shuffled
3. any owner of a certificate can signs the block, but if the certificate is closer to the top of the list the signature is more valuable when we compare different branchs to determine the main one
4. after a timeout has passed miners start working on a new block

Of cause a malefactor can register a batch of certificates, refuse to sign an official branch and sign only their branch, but it would make an attack more expensive. Also we suppose that it is less lickly that a malefactor is an early adopter, so the shuffle should be biased and place older certificates closer to the top of the list, so an attacker should control far more than 50% of certificates to do their dirty business.