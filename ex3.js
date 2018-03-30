"use strict";

const ex = require("./ex.js");
const ex2 = require("./ex2.js");

const EX = module.exports;

EX.IsProposition = ex.Type(Object.assign({},
    ex2.Judgment.prototype,
    {
        constructor: function IsProposition(subject)
        {
            if (!(this instanceof IsProposition))
            {
                return new IsProposition(subject);
            }
            ex.assert(subject.inhabits(ex.Value));
            return ex2.Judgment(this, ex2.Conjoiner([subject]));
        }
    }
));

EX.IsTrue = ex.Type(Object.assign({},
    ex2.Judgment.prototype,
    {
        constructor: function IsTrue(subject)
        {
            if (!(this instanceof IsTrue))
            {
                return new IsTrue(subject);
            }
            ex.assert(subject.inhabits(ex.Value));
            return ex2.Judgment(this, ex2.Conjoiner([subject]));
        }
    }
));

EX.Truth = ex.Type(Object.assign({},
    EX.IsProposition.prototype,
    {
        constructor: function Truth()
        {
            if (!(this instanceof Truth))
            {
                return new Truth();
            }
            if (EX.truth === undefined)
            {
                EX.truth = EX.IsProposition(ex.deepFreeze(this));
            }
            return EX.truth;
        }
    }
));
EX.truth = EX.Truth();
EX["⊤"] = EX.truth;

EX.Falsity = ex.Type(Object.assign({},
    EX.IsProposition.prototype,
    {
        constructor: function Falsity()
        {
            if (!(this instanceof Falsity))
            {
                return new Falsity();
            }
            if (EX.falsity === undefined)
            {
                EX.falsity = EX.IsProposition(ex.deepFreeze(this));
            }
            return EX.falsity;
        }
    }
));
EX.falsity = EX.Falsity();
EX["⊥"] = EX.falsity;

EX.Conjunction = ex.Type(Object.assign({},
    EX.IsProposition.prototype,
    {
        constructor: function Conjunction(left, right)
        {
            if (!(this instanceof Conjunction))
            {
                return new Conjunction(left, right);
            }
            ex.assert(left.inhabits(EX.IsProposition));
            ex.assert(right.inhabits(EX.IsProposition));
            this._left = left;
            this._right = right;
            return EX.IsProposition(ex.deepFreeze(this));
        }
    }
));
EX["⋀"] = EX.Conjunction;

EX.Disjunction = ex.Type(Object.assign({},
    EX.IsProposition.prototype,
    {
        constructor: function Disjunction(left, right)
        {
            if (!(this instanceof Disjunction))
            {
                return new Disjunction(left, right);
            }
            ex.assert(left.inhabits(EX.IsProposition));
            ex.assert(right.inhabits(EX.IsProposition));
            this._left = left;
            this._right = right;
            return EX.IsProposition(ex.deepFreeze(this));
        }
    }
));
EX["⋁"] = EX.Disjunction;

EX.Implication = ex.Type(Object.assign({},
    EX.IsProposition.prototype,
    {
        constructor: function Implication(conclusion, premise)
        {
            if (!(this instanceof Implication))
            {
                return new Implication(conclusion, premise);
            }
            ex.assert(conclusion.inhabits(EX.IsProposition));
            ex.assert(premise.inhabits(EX.IsProposition));
            this._conclusion = conclusion;
            this._premise = premise;
            return EX.IsProposition(ex.deepFreeze(this));
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
    ex2.HypotheticalJudgment(
        EX.IsTrue(EX.truth),
        ex2.Conjoiner([]) // no Γ implementation yet
    ),
    ex2.Conjoiner([])
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
const prop1 = EX.IsProposition(ex.Type());
const prop2 = EX.IsProposition(ex.Type());
const conjunctionIntroduction = ex2.Rule(
    ex2.HypotheticalJudgment(
        EX.IsTrue(EX["⋀"](prop1, prop2)),
        ex2.Conjoiner([]) // no Γ implementation yet
    ),
    ex2.Conjoiner(
        [
            ex2.HypotheticalJudgment(
                EX.IsTrue(prop1),
                ex2.Conjoiner([]) // no Γ implementation yet
            ),
            ex2.HypotheticalJudgment(
                EX.IsTrue(prop2),
                ex2.Conjoiner([]) // no Γ implementation yet
            )
        ]
    )
);
console.log(conjunctionIntroduction);
