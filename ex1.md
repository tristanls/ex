# ex1 language

Provides a `not` operator for Boolean type.

## Syntax Chart

| Sort   | Abstract Syntax | Concrete Syntax | Meaning
| ------ | --------------- | --------------- | -------
| Type τ | bool            | bool            | boolean
| Expr e | true            | true            | true
|        | false           | false           | false
|        | not(e)          | e.not()         | not

## Statics

### True

```
---------------
Γ ⊢ true : bool
```

### False

```
----------------
Γ ⊢ false : bool
```

### Not

```
  Γ ⊢ true : bool
--------------------- Not Introduction 1
Γ ⊢ not(false) : bool
```
```
  Γ ⊢ false : bool
-------------------- Not Introduction 2
Γ ⊢ not(true) : bool
```
```
  Γ ⊢ e : bool
---------------------- Not Introduction 3
Γ ⊢ not(not(e)) : bool
```
```
Γ ⊢ not(true) : bool
-------------------- Not Elimintation 1
  Γ ⊢ false : bool
```
```
Γ ⊢ not(false) : bool
--------------------- Not Elimination 2
   Γ ⊢ true : bool
```

#### Soundness

```
  Γ ⊢ true : bool
--------------------- Not Introduction 1
Γ ⊢ not(false) : bool
--------------------- Not Elimination 1
  Γ ⊢ true : bool
```
```
  Γ ⊢ false : bool
--------------------- Not Introduction 2
Γ ⊢ not(true) : bool
--------------------- Not Elimination 2
  Γ ⊢ false : bool
```
```
     Γ ⊢ true : bool
------------------------- Not Introduction 3
Γ ⊢ not(not(true)) : bool
------------------------- Not Elimination 1
  Γ ⊢ not(false) : bool
------------------------- Not Elimination 2
     Γ ⊢ true : bool
```
```
     Γ ⊢ false : bool
-------------------------- Not Introduction 3
Γ ⊢ not(not(false)) : bool
-------------------------- Not Elimination 2
  Γ ⊢ not(true) : bool
-------------------------- Not Elimination 1
     Γ ⊢ false : bool
```

## Dynamics

// TODO
