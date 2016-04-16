---
layout: nidaba
title: Nidaba::Auction
name: "Penny auction is ripoff"
tags: ["nidaba"]
---

In the Nidaba whitepaper I suggested to use penny auction as an auction for a certificate's name.

> Penny auction is form of auction in which bids are non-refundable, so if a person makes a bid, but loses an auction then they doesn't receive their bid back. 

I thought it was a neat idea because it reduces an activity of cybersquatters and because refunding of means transferred to certificate's account may violate uniform production rate since it interferes with charging an interest rate for storing means on account.

But frankly penny auction is a ripoff and nobody pay for a name if they can lose the bid without reason. So I came to a classic auction but with some changes which provide consistency with charging an interest rate.

Let's review the penny auction for some name. Suppose that the base price is 1 and the interest rate is 0.99998. Also all calculations are rounded down to 6 sign after the point.

> **Block 1** User X starts an auction with default price of ownership (1x base price) by opening an account with 72 uom (units of money). After the block the account holds 70.99858(=(72-1)·0.99998) uom, since 1 uom was withdrawn as an ownership fee and the account was charged for storing the means. X is an ownership.

> **Block 61** There are 10.949980 uom on X's account

> **Block 62** User X transfers 3000 uom to their account. After the block there are 3009.889781 uom on it

> **Block 112** There are 2956.906833 uom on X's account

> **Block 113** User Y, open an account with 2200 uom and explicit bid a new price of ownership (2x base price) to become an ownership. As a result Y has to pay for the ownership of the name behindhand (112+1)·(2x base price), so after the block the balance on his account is 1973.96052(=(2200 - 113·2)·0.99998).

Now Y is an ownership, X may give up or make a higher bid to become an ownership. After the auction is closed the current ownership becomes the final ownership of the name (unless they miss the payment for ownership). During the auction or after no one receives their money back.

The new auction schema has exactly the same structure, but there is an additional condition  to make a bid -- a bidder must have on account more means than the current ownership has transferred to their account including the interest. After the bid is accepted, all money transferred to account of the previous ownership returns back.

The above example is incorrect from new auction point of view since 2200 < 3075.222937 (=72·1.00002<sup>113-1</sup> + 3000·1.00002<sup>113-62</sup>). If Y transferred more than 3076 then their bid would be accepted and X would get back 3072 uom.

Notice that the money are pay back only if the owner of an account loses the ownership of the name. If a user opens an account related to on going auction, transfers money but doesn't make a bid before the auction is over, then they don't receive the money back.