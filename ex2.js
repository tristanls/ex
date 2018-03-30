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
        equals(that)
        {
            if (this === that)
            {
                return ex.true;
            }
            if (that.inhabits(EX.Conjoiner) === ex.false)
            {
                return ex.false;
            }
            if (this._value.length === that._value.length)
            {
                for (let i = 0; i < that._value.length; i++)
                {
                    if (this._value[i].equals(that._value[i]) === ex.false)
                    {
                        return ex.false;
                    }
                }
                return ex.true;
            }
            return ex.false;
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
        equals(that)
        {
            if (this === that)
            {
                return ex.true;
            }
            if (that.inhabits(EX.Judgment) === ex.false)
            {
                return ex.false;
            }
            for (let entry of Object.entries(this._value))
            {
                if (entry[1].equals(that._value[entry[0]]) === ex.false)
                {
                    return ex.false;
                }
            }
            return ex.true;
        },
        // TODO: get rid of accessors once there are distinguishable things
        //       to "do" with judgments
        form()
        {
            return this._form;
        },
        subjects()
        {
            return this._subjects;
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
        },
        equals(that)
        {
            if (this === that)
            {
                return ex.true;
            }
            if (that.inhabits(EX.HypotheticalJudgment) === ex.false)
            {
                return ex.false;
            }
            for (let entry of Object.entries(this._value))
            {
                if (entry[1].equals(that._value[entry[0]]) === ex.false)
                {
                    return ex.false;
                }
            }
            return ex.true;
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
            this._conclusion = conclusion;
            this._premises = premises;
        },
        equals(that)
        {
            if (this === that)
            {
                return ex.true;
            }
            if (that.inhabits(EX.Rule) === ex.false)
            {
                return ex.false;
            }
            for (let entry of Object.entries(this._value))
            {
                if (entry[1].equals(that._value[entry[0]]) === ex.false)
                {
                    return ex.false;
                }
            }
            return ex.true;
        },
        // TODO: get rid of accessors once there are distinguishable things
        //       to "do" with rules
        conclusion()
        {
            return this._conclusion;
        },
        premises()
        {
            return this._premises;
        }
    }
));
