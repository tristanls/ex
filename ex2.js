"use strict";

const ex = require("./ex.js");

const EX = module.exports;

EX.Conjoiner = ex.Type(Object.assign({},
    ex.Type.prototype,
    {
        constructor: function Conjoiner(value)
        {
            if (!(this instanceof Conjoiner))
            {
                return new Conjoiner(value);
            }
            ex.assert(ex.Boolean(Array.isArray(value)));
            this._value = value;
        },
        join(value)
        {
            ex.assert(value.inhabits(ex.Value));
            return EX.Conjoiner(this._value.concat(value));
        }
    }
));

EX.Judgment = ex.Type(Object.assign({},
    ex.Type.prototype,
    {
        constructor: function Judgment(form, subjects)
        {
            if (!(this instanceof Judgment))
            {
                return new Judgment(form, subjects);
            }
            ex.assert(form.inhabits(ex.Type));
            ex.assert(subjects.inhabits(EX.Conjoiner));
            subjects._value.map(subject => ex.assert(subject.inhabits(ex.Type)));
            this._value =
            {
                form,
                subjects
            };
        },
        // TODO: get rid of accessors once there are distinguishable things
        //       to "do" with judgments
        form()
        {
            return this._value.form;
        },
        subjects()
        {
            return this._value.subjects;
        }
    }
));

EX.HypotheticalJudgment = ex.Type(Object.assign({},
    EX.Judgment.prototype,
    {
        constructor: function HypotheticalJudgment(conclusion, hypotheses)
        {
            if (!(this instanceof HypotheticalJudgment))
            {
                return new HypotheticalJudgment(conclusion, hypotheses);
            }
            ex.assert(conclusion.inhabits(EX.Judgment));
            ex.assert(hypotheses.inhabits(EX.Conjoiner));
            hypotheses._value.map(hypothesis => ex.assert(hypothesis.inhabits(EX.Judgment)));
            this._value =
            {
                conclusion,
                hypotheses,
                form: this,
                subjects: hypotheses.join(conclusion)
            };
        }
    }
));

EX.Rule = ex.Type(Object.assign({},
    ex.Type.prototype,
    {
        constructor: function Rule(conclusion, premises)
        {
            if (!(this instanceof Rule))
            {
                return new Rule(conclusion, premises);
            }
            ex.assert(conclusion.inhabits(EX.Judgment));
            ex.assert(premises.inhabits(EX.Conjoiner));
            premises._value.map(premise => ex.assert(premise.inhabits(EX.Judgment)));
            this._value =
            {
                conclusion,
                premises
            };
        },
        // TODO: get rid of accessors once there are distinguishable things
        //       to "do" with rules
        conclusion()
        {
            return this._value.conclusion;
        },
        premises()
        {
            return this._value.premises;
        }
    }
));

EX.selfTest = (function ()
{
    const conjoiner = EX.Conjoiner([]);
    return function selfTest()
    {
        // Conjoiner
        ex.assert(EX.Conjoiner.inhabits(ex.Type));
        ex.assert(EX.Conjoiner.inhabits(ex.Value));
        ex.deny(EX.Conjoiner.inhabits(EX.Conjoiner));
        ex.deny(EX.Conjoiner.inhabits(EX.Judgment));
        ex.deny(EX.Conjoiner.inhabits(EX.HypotheticalJudgment));
        ex.deny(EX.Conjoiner.inhabits(EX.Rule));

        ex.assert(EX.Conjoiner.equals(EX.Conjoiner));
        ex.deny(EX.Conjoiner.equals(EX.Judgment));
        ex.deny(EX.Conjoiner.equals(EX.HypotheticalJudgment));
        ex.deny(EX.Conjoiner.equals(EX.Rule));

        // Judgment
        ex.assert(EX.Judgment.inhabits(ex.Type));
        ex.assert(EX.Judgment.inhabits(ex.Value));
        ex.deny(EX.Judgment.inhabits(EX.Conjoiner));
        ex.deny(EX.Judgment.inhabits(EX.Judgment));
        ex.deny(EX.Judgment.inhabits(EX.HypotheticalJudgment));
        ex.deny(EX.Judgment.inhabits(EX.Rule));

        ex.deny(EX.Judgment.equals(EX.Conjoiner));
        ex.assert(EX.Judgment.equals(EX.Judgment));
        ex.deny(EX.Judgment.equals(EX.HypotheticalJudgment));
        ex.deny(EX.Judgment.equals(EX.Rule));

        // HypotheticalJudgment
        ex.assert(EX.HypotheticalJudgment.inhabits(ex.Type));
        ex.assert(EX.HypotheticalJudgment.inhabits(ex.Value));
        ex.deny(EX.HypotheticalJudgment.inhabits(EX.Conjoiner));
        ex.deny(EX.HypotheticalJudgment.inhabits(EX.Judgment));
        ex.deny(EX.HypotheticalJudgment.inhabits(EX.HypotheticalJudgment));
        ex.deny(EX.HypotheticalJudgment.inhabits(EX.Rule));

        ex.deny(EX.HypotheticalJudgment.equals(EX.Conjoiner));
        ex.deny(EX.HypotheticalJudgment.equals(EX.Judgment));
        ex.assert(EX.HypotheticalJudgment.equals(EX.HypotheticalJudgment));
        ex.deny(EX.HypotheticalJudgment.equals(EX.Rule));

        // Rule
        ex.assert(EX.Rule.inhabits(ex.Type));
        ex.assert(EX.Rule.inhabits(ex.Value));
        ex.deny(EX.Rule.inhabits(EX.Conjoiner));
        ex.deny(EX.Rule.inhabits(EX.Judgment));
        ex.deny(EX.Rule.inhabits(EX.HypotheticalJudgment));
        ex.deny(EX.Rule.inhabits(EX.Rule));

        ex.deny(EX.Rule.equals(EX.Conjoiner));
        ex.deny(EX.Rule.equals(EX.Judgment));
        ex.deny(EX.Rule.equals(EX.HypotheticalJudgment));
        ex.assert(EX.Rule.equals(EX.Rule));

        return true;
    }
})();

ex.deepFreeze(EX);
