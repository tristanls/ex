# ex0 language

We can evaluate zero and successor notations into numerals.

For example:

```
s(z)
↦ num[1]
```

## Syntax Chart

| Sort   | Abstract Syntax | Concrete Syntax | Meaning
| ------ | --------------- | --------------- | -------
| Type τ | nat             | nat             | naturals
| Expr e | z               | z               | zero
|        | s(e)            | s(e)            | successor
|        | num[n]          | n               | numerals

## Statics

_TODO_

```
-----------
Γ ⊢ z : nat
```
```
----------------
Γ ⊢ num[n] : nat
```
```
 Γ ⊢ e : nat
--------------
Γ ⊢ s(e) : nat
```

## Dynamics

_TODO_
