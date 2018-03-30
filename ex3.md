# ex3 language

Propositional Logic.

## Syntax Chart

| Sort       | Abstract Syntax | Concrete Syntax | Meaning
| ---------- | --------------- | --------------- | -----------
| Prop ϕ     | ⊤               | ⊤              | truth
|            | ⊥               | ⊥              | falsity
|            | ⋀(ϕ₁;ϕ₂)       | ϕ₁ ⋀ ϕ₂        | conjunction
|            | ⋁(ϕ₁;ϕ₂)       | ϕ₁ ⋁ ϕ₂        | disjunction
|            | ⟹(ϕ₁;ϕ₂)      | ϕ₁ ⟹ ϕ₂      | implication

## Statics

### Truth

```
----------- Truth Introduction
Γ ⊢ ⊤ true
```

_No elimination rule_

### Conjunction

```
Γ ⊢ ϕ₁ true     Γ ⊢ ϕ₂ true
----------------------------- Conjunction Introduction
      Γ ⊢ ϕ₁ ⋀ ϕ₂ true
```
```
Γ ⊢ ϕ₁ ⋀ ϕ₂ true
----------------- Conjunction Elimination 1
  Γ ⊢ ϕ₁ true
```
```
Γ ⊢ ϕ₁ ⋀ ϕ₂ true
----------------- Conjunction Elimination 2
  Γ ⊢ ϕ₂ true
```

### Implication

```
Γ,ϕ₁ true ⊢ ϕ₂ true
-------------------- Implication Introduction
Γ ⊢ ϕ₁ ⟹ ϕ₂ true
```
```
Γ ⊢ ϕ₁ ⟹ ϕ₂ true    Γ ⊢ ϕ₁ true
---------------------------------- Implication Elimination
            Γ ⊢ ϕ₂ true
```

### Falsehood

_No introduction rule_

```
Γ ⊢ ⊥ true
----------- Falsehood Elimination
Γ ⊢ ϕ true
```

### Disjunction

```
  Γ ⊢ ϕ₁ true
----------------- Disjunction Introduction 1
Γ ⊢ ϕ₁ ⋁ ϕ₂ true
```
```
  Γ ⊢ ϕ₂ true
----------------- Disjunction Introduction 2
Γ ⊢ ϕ₁ ⋁ ϕ₂ true
```
```
Γ ⊢ ϕ₁ ⋁ ϕ₂ true    Γ,ϕ₁ true ⊢ ϕ true  Γ,ϕ₂ true ⊢ ϕ true
------------------------------------------------------------- Disjunction Elimination
                          Γ ⊢ ϕ true
```

### Negation

Negation, `¬ϕ`, of a proposition, `ϕ`, may be defined as the implication `ϕ ⟹ ⊥`. This means that `¬ϕ true` if `ϕ true ⊢ ⊥ true`, which is to say that the truth of `ϕ` is _refutable_ in that we may derive a proof of falsehood from any purported proof of `ϕ`.

## Dynamics

// TODO
