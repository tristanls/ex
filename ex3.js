"use strict";

const ex = require("./ex.js");
const ex2 = require("./ex2.js");

const EX = module.exports;

EX.Truth = ex.Type(Object.assign({},
    ex2.IsProposition.prototype,
    {
        constructor: function Truth()
        {
            if (!(this instanceof Truth))
            {
                return new Truth();
            }
            if (EX.truth === undefined)
            {
                EX.truth = ex2.IsProposition(ex.deepFreeze(this));
            }
            return EX.truth;
        }
    }
));
EX.truth = EX.Truth();
EX["⊤"] = EX.truth;

EX.Falsity = ex.Type(Object.assign({},
    ex2.IsProposition.prototype,
    {
        constructor: function Falsity()
        {
            if (!(this instanceof Falsity))
            {
                return new Falsity();
            }
            if (EX.falsity === undefined)
            {
                EX.falsity = ex2.IsProposition(ex.deepFreeze(this));
            }
            return EX.falsity;
        }
    }
));
EX.falsity = EX.Falsity();
EX["⊥"] = EX.falsity;

console.log(EX.truth);
console.log(EX.falsity);
console.log(EX.truth.equals(EX.falsity));
console.log(EX.truth.equals(EX.truth));

EX.Conjunction = ex.Type(Object.assign({},
    ex2.IsProposition.prototype,
    {
        constructor: function Conjunction(left, right)
        {
            if (!(this instanceof Conjunction))
            {
                return new Conjunction(left, right);
            }
            ex.assert(left.inhabits(ex2.IsProposition));
            ex.assert(right.inhabits(ex2.IsProposition));
            this._left = left;
            this._right = right;
            return ex2.IsProposition(ex.deepFreeze(this));
        }
    }
));
EX["⋀"] = EX.Conjunction;

EX.Disjunction = ex.Type(Object.assign({},
    ex2.IsProposition.prototype,
    {
        constructor: function Disjunction(left, right)
        {
            if (!(this instanceof Disjunction))
            {
                return new Disjunction(left, right);
            }
            ex.assert(left.inhabits(ex2.IsProposition));
            ex.assert(right.inhabits(ex2.IsProposition));
            this._left = left;
            this._right = right;
            return ex2.IsProposition(ex.deepFreeze(this));
        }
    }
));
EX["⋁"] = EX.Disjunction;

EX.Implication = ex.Type(Object.assign({},
    ex2.IsProposition.prototype,
    {
        constructor: function Implication(conclusion, premise)
        {
            if (!(this instanceof Implication))
            {
                return new Implication(conclusion, premise);
            }
            ex.assert(conclusion.inhabits(ex2.IsProposition));
            ex.assert(premise.inhabits(ex2.IsProposition));
            this._conclusion = conclusion;
            this._premise = premise;
            return ex2.IsProposition(ex.deepFreeze(this));
        }
    }
));
EX["⟹"] = EX.Implication;

/*
```
----------- Truth Introduction
Γ ⊢ ⊤ true
```
*/
const truthIntroduction = ex2.Rule(
    ex2.Conjoiner([]),
    ex2.HypotheticalJudgment(
        ex2.Conjoiner([]), // no Γ implementation yet
        ex2.IsTrue(EX.truth)
    )
);
console.log(truthIntroduction);
console.log(truthIntroduction.equals(truthIntroduction));
console.log(truthIntroduction.equals(ex.true));

/*
```
Γ ⊢ ϕ₁ true     Γ ⊢ ϕ₂ true
----------------------------- Conjunction Introduction
      Γ ⊢ ϕ₁ ⋀ ϕ₂ true
```
*/
const prop1 = ex2.IsProposition(ex.Type());
const prop2 = ex2.IsProposition(ex.Type());
const conjunctionIntroduction = ex2.Rule(
    ex2.Conjoiner(
        [
            ex2.HypotheticalJudgment(
                ex2.Conjoiner([]), // no Γ implementation yet
                ex2.IsTrue(prop1)
            ),
            ex2.HypotheticalJudgment(
                ex2.Conjoiner([]), // no Γ implementation yet
                ex2.IsTrue(prop2)
            )
        ]
    ),
    ex2.HypotheticalJudgment(
        ex2.Conjoiner([]), // no Γ implementation yet
        ex2.IsTrue(EX["⋀"](prop1, prop2))
    )
);
console.log(conjunctionIntroduction);
