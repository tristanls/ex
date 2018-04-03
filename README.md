ex
==
_from, of, out of, by, according to, on_

A type system implementation.

## What is a type system?

Something, something, computer programming...

What I find interesting about types is that they enable me to think in terms of patterns as opposed to in terms of specific examples. A type system, allows me to express something in terms of patterns, and the patterns can be arbitrarily abstract. Ironically, let's look at some examples of patterns, i.e. types.

### Unit type

A Unit type can be thought of as a pattern of "something". It conveys the notion that "something" exists. There is an instance of "something".

It may help to think in terms of receiving an email in your inbox, but that you only saw the number of new messages increase by one. You haven't read the email. You know nothing about it. You just know that you have another email in your inbox. That's like Unit type. It conveys that "something" (some email) exists.

I tend to think of Unit type as a "signal". If you imagine a light switch, a "signal" is not whether or not the light is on or off. A "signal" would be the flipping of the switch, the flip itself. Imagine you can't see the light, you just hear the switch flipping. *flip* *flip* *flip*... three signals, three Unit types.

Ok, that might still be fairly abstract. Let's contrast this with something more familiar, but let's name it something really weird, like, the Sum type.

### Sum type

A Sum type can be thought of as "exclusive or" pattern. In other words, it can be this "something", or that other "something", but not both. For example, consider the notions of True and False. We say that something can be True or False but not both.

In fact, True or False (but not both) is of the type Sum with the shape of Unit + Unit. "Unit + Unit" means that the Sum type has space for two Units, but the fact that it's exlusive or, means that it will only accept one Unit. True is defined by putting "something" (of type Unit) into the first space of Unit + Unit. False is defined by putting "something" (of type Unit) into the second space of Unit + Unit. What if you want to put "something" into both? You can't, because by definition, we say that you can only put "something" into one of the spaces. Why is True putting "something" into the first space and not the second? The answer is that that's the convention that most people who use Sum types use. You can use any convention you want, but it may be more difficult to understand what you're communicating.

Remembering that Sum type describes a pattern of "exclusive or" helps me to remember how it works.

Going back to our light switch example, and to illustrate the difference between Sum and Unit, imagine that we now can tell whether the light is on or off. We can represent the pattern of knowing whether the light is on or off by Sum type with the shape Unit + Unit. If light is on, we will put "something" into the first space. If light is off, we will put "something" into the second space. It can't be both on and off. All we need to put into one of the spaces is of Unit type, a "signal". Remember that it is not the "signal" that tells us the light is on. The space the "signal" is in is what tells us whether the light is on or off (first space means light on, second space means light off). The nature of the "signal" itself is immaterial, we only care that "something" is in the space.

Why is it called "Sum" (as in "summation") type? The name comes from how one would calculate the number of unique things that one can represent using a Sum type. For example, the Sum type Unit + Unit, can represent only one plus one, that is, two things. This is why it's used for representing True and False, as those are exactly two things. If, for some reason, we wanted to represent four things, for example: Spring, Summer, Fall, Winter, I could use a Sum type of Unit + Unit + Unit + Unit. One plus one plus one plus one is four. And a season can (for our illustration purposes here) be either Spring, or Summer, or Fall, or Winter, but not more than one of those.

### Product type

A Product type can be thought of as "and" pattern. In other words, it can be this "something" and that other "something" together.

A Product type that has two "somethings" would be Unit x Unit. "Unit x Unit" means that the Product type has space for two Units ("Unit x Unit x Unit" would mean that the Product type has space for three Units). For example, a weekend is Saturday and Sunday. We can represent Saturday by putting "something" into the first space and Sunday by putting "something" into the second space. Now, this is a somewhat not useful example of a Product. Let's come up with a better example.

Remember our Sum type of Unit + Unit where we defined True and False? Let's name that particular Sum type shape of Unit + Unit a Boolean type (it's named after George Boole). Now that we have our Boolean type (which represents the notions of True and False), let's define a more useful Product of the shape Boolean x Boolean. "Boolean x Boolean" means that the Product type has space for two Booleans. We'll still think about the weekend, but this time, the first space will represent whether we are working on Saturday, and the second space will represent whether we are working on Sunday. So, if I'm working on Saturday and Sunday, I would represent that as True x True. If I'm working on Saturday, but not working on Sunday, I would represent that as True x False. Not working on Saturday, but working Sunday would be False x True. And, lastly, not working all weekend would be False x False.

Why is it called "Product" (as in "multiplication") type? That's because to calculate the number of unique things that one can represent using a Product type, we multiply the number of things that can be in the first space by the number of things that can be in the second space and so on. Notice, in our weekend representation of Unit + Unit, we could only put one thing in each space (Saturday and Sunday), so the number of things we could represent was one times one is one, the weekend. However, once we could put two things into each space, as in our example of whether we are working on the weekend, we could put two things into first space (True, False), and two things into second space (True, False). Two times two is four, and the Product type of Boolean x Boolean could represent four different work schedules over the weekend.

### Void type

A Void type can be thought of as a "nothing" pattern. This pattern is either obvious to people, or very difficult to understand.

In the email inbox example, a Void type means that an email hasn't arrived. You received no signal, "nothing" happened, no change at all.

In the light switch example, a Void type means that you can't see if the light is on or off, and you can't hear the flipping of the switch. It's not that you will eventually hear or see something, but not yet. It's that you will never hear or see anything. "Nothing" will happen. Void is the absence of any signal.

We now have some understanding of other types that can help us understand the nature of Void type. Imagine I have a Sum type with the shape of Void + Unit. "Void + Unit" means that the Sum type has *only one space*, and it is only the second space. There is no first space in Void + Unit type. How many things can you represent using Void + Unit type? It isn't zero plus one, but just one. If it was zero plus one, that would mean that you could put zero things into the first space, but *there is no first space*. There is only second space, into which you can put one thing. Void type isn't the same thing as zero. To see this, consider a Product type of Void x Unit. How many things can you represent using Void x Unit type? It is not zero times one, which would be zero. You can represent one thing, because you can put "something" into the second space. The first space doesn't exist, it is of type Void.

### Value type

A Value type can be thought of as a pattern in contrast to the Unit type pattern. Where Unit type was a "something" pattern, Value type is "this particular thing" pattern.

In the email inbox example, again, by contrast, where Unit type would be a signal that some new email arrived and we only care about the signal. Value type would be saying that a particular email arrived, and while we care that email arrived, we also care about the value, the particular contents of that particular email.

Another way of phrasing this, is that for a Unit type we only care about the signal. In the sentence "This thing exists", what we focus on in Unit type is *exists*. For Value type, we focus on the entire sentence *this thing exists*, because we are trying to express the pattern that particular thing not only exists, but that it is a particular thing.

For example, think of the boolean True. Looking at True through the lens of "this particular thing", we care that it is True, and that it is not False. The value of True is True.

### Type type

Time to get weird.

Type type expresses the pattern of "a pattern" :D. We covered multiple examples of Type type. Unit is of type Type. Sum is of type Type. Product is of type Type.

There is an important concept to highlight. Earlier, we defined True and False as being of the type Boolean. What's worth highlighting is that Boolean is of type Type, but True is of type Boolean.

Also, notice that the type Type is of type Type. This is because the pattern of "a pattern" fits the pattern of being "a pattern".

### Everything is a Value

Weirder...

Recall that when we talked about the Value type, we were expressing the pattern of "this particular thing". If we have the type Boolean, and we have a particular boolean, say True, then the particular boolean True is of type Boolean, but it is also of type Value. This is because the boolean True fits the pattern of "booleans" and it fits the pattern of "particular thing". "Fitting a pattern" is referred to as "inhabiting a type". So, the boolean True inhabits the type Boolean and it inhabits the type Value. This is because it "fits the pattern of booleans" and it "fits the pattern of particular thing".

### Types are Values and Values are Types

Meta-weird...

Types are Values. This is because Type type (a pattern of "a pattern") fits the pattern of being "a particular thing". The type Type inhabits the type Value.

Values are Types. This is because Value type (a pattern of "a particular thing") fits the pattern of being "a pattern". The type Value inhabits the type Type.

### Everything is a Unit

Notice that the Unit type is the pattern of "something". This means that everything that exists fits the pattern of being "something", therefore everything that exists inhabits the type Unit.

It is worth highlighting the interplay of Void type and Unit type. The Void type itself inhabits type Type, inhabits type Value, and inhabits type Unit, because the pattern of "nothing" fits the pattern of being "a pattern" (Type), fits the pattern of being "a particular thing" (Value), and fits the pattern of being "something" (Unit). However, notice that there is nothing that can inhabit the type Void. This is because to fit the pattern of "nothing", there can be nothing there. If there was something there, it wouldn't be nothing.
