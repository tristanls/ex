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
                return new Conjoiner();
            }
            ex.assert(ex.Boolean(Array.isArray(value)));
            this._value = value;
            ex.deepFreeze(this);
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
            this._form = form;
            this._subjects = subjects;
            this._value = this; // judgement value is itself
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
            this._value = this; // rule value is itself
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
