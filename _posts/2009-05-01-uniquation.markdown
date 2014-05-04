---
layout: post
title: Uniquation
tags: ["pet"]
desc: "A math search engine"
---

<h1>Uniquation</h1>

[Uniquation](http://http://uniquation.com) is a math expression search engine. I decided to create it when I noticed that there wasn't any tool to find an information on the Web about a particular math concept.

Suppose you are a researcher who has just built a model `f(x+1) = r f(x) (1-f(x))` for his domain. Now you have two options: either to explore the model or to find if this model was explored before. Of course you want to stand on the shoulders of giants, so you choose the second option. You go to Google and... become upset, because <a href="https://www.google.com/search?q=f(x%2B1)+%3D+r+f(x)+(1-f(x))">the SERP is garbage</a>. One may argue that you should have searched for "logistic map" instead. Well, it is true, but how one would find the name to google if they only have the expression?

Here is where Uniquation shines. You can take a look on <a href="http://uniquation.com/en/solutions.aspx?query=f%28x%2B1%29+%3D+r+f%28x%29+%281-f%28x%29%29">its SERP</a> to the same request. Almost all links lead to the pages where the expression is associated with the name -- logistic map. So after you find the name you can continue your research with Google.

Exploring a model isn't the only use case for Uniquation. It is highly possible that a web page with an equation contains a solution too, so if you search for the equation you can find a solution. Moreover if a page contains an expression then Uniquation can find the page by a part of the expression. So if you're looking for `\cos (a+b)` you will find `\cos (a+b) = \cos a \cos b - \sin a \sin b`.

<h2>Aha! Moment</h2>

The most complicated part about the project was to invent an algorithm to normalize expressions. It matters because the same concept in math may have several forms: `x^2+a=0` or `0=a+x^2` or even `y^2+x=0`. So I had to take into account commutativity and alpha equivalence (same formula but different variables). It is a hard problem and when I started working on the project I didn't know how to handle it, so when I came to a solution I had very strong aha!&nbsp;moment.

<h2>WolframAlpha</h2>

[WolframAlpha](http://www.wolframalpha.com) was released when I was implementing Uniquation. First I was frightened, because a company behind it, Wolfram Research, has a lot of experience with symbolic manipulations and could have created a great math search engine. But they focused on computation rather then on search. For example if we enter <a href="http://www.wolframalpha.com/input/?i=%5Ccos+%28a%2Bb%29"><code>\cos (a+b)</code></a> they apply a lot of formulae to it including the one above, but if we enter [the logistic map expression](http://www.wolframalpha.com/input/?i=f%28x%2B1%29+%3D+r+f%28x%29+%281-f%28x%29%29) they just try to expand it and don't provide any hint what it is, despite they know what [logistic map](http://www.wolframalpha.com/input/?i=logistic+map&dataset=&equal=Submit) is.

Beside that, WolframAlpha computes the result based on an internal database. But *inside* is by all means smaller that *outside* and always will be. So a solution based on outside data always will be more comprehensive.

<h2>Fail</h2>

This project was a part of my thesis. After I graduated I had to abandon it because I didn't know how to make money with it and I didn't have spare time to evolve it. Nevertheless I don't think that to opensource it now is a good idea because I'm sure that in the current state of the project I will fail to build a community. 

To make a prototype fast I used very marginal technologies. In the university my language of choice was C#, so I targeted the .Net platform, but since a linux hosting is cheaper I switched to Mono, later I switched from C# to Nemerle. <span class="remark">Nemerle to C# is what Scala is to Java but with more powerful macro system and far less popular.</span> I did it because Nemerle has IMHO the best tool to make parsers -- Nemerle.PEG.

Now I believe that it is almost impossible to find people who are interested in development of Uniquation and who are also ready to learn Nemerle. I don't leave a hope to port Uniquation to a more mainstream technology and to opensource it.

<h2>Future</h2>

If I manage to revive Uniquation I would start a new project on top of it -- GaloisWiki. It is a math wiki-style encyclopedia made to improve Uniquation's [CAS](http://en.wikipedia.org/wiki/Computer_algebra_system) abilities. Now Uniquation can find a math expression only if it was indexed before or it is a part of an indexed expression. It sucks because if a user searches for a specialized expression and a generic expression was added to the index they get nothing. For instance, if there is an article about [Quadratic equation](http://en.wikipedia.org/wiki/Quadratic_equation) with a solution to `ax^2+bx+c=0` in generic form then Uniquation wouldn't find it by a specialized request like `3x^2-17x+10=0`. I have an idea how it can be changed.

Imagine we have an article about the generic quadratic equation with a machine readable snippet like:

{% highlight json %}
{
    equation: "ax^2+bx+c=0",
    solution: "x = (-b +- sqrt(b*b - 4ac)) / 2a",
    coefficients: ["a", "b", "c"],
    conditions: ["a in R", "b in R", "c in R", "b*b-4ac>=0"]
}
{% endhighlight %}

During the indexation all constants are replaced with free variables and additional conditions are added.

{% highlight json %}
{
    equation: "ax^d+bx+c=e",
    solution: "x = (-b +- sqrt(b*b - 4ac)) / 2a",
    coefficients: ["a", "b", "c"],
    conditions: ["a in R", "b in R", "c in R", "b*b-4ac>=0", "d=2", "e=0"]
}
{% endhighlight %}

Then the structure is pushed to the index. Let us switch to a user request, e.g., `3x^2-17x+10=0`. First, we convert it to the following structure.

{% highlight json %}
{
    request: "ay^d+by+c=e",
    conditions: ["a=3", "d=2", "b=-17", "c=10", "e=0"]
}
{% endhighlight %}

Then 

- the search proceeds and the engine returns a list of structures that match the request
- an algorithm removes structures which conditions conflict with the request
- an algorithm puts the request's constants into the generic form

So the user gets a specialized solution that matches their request.

{% highlight json %}
{
    equation: "3x^2-17x+10=0",
    solution: "x = (17 +- sqrt(17*17 - 4*3*10)) / 2*3"
}
{% endhighlight %}

I think you've just got the idea of GaloisWiki: it is a computer algebra system based on a wiki database which looks like a math encyclopedia.