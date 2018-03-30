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

EX.IsProposition = ex.Type(Object.assign({},
    EX.Judgment.prototype,
    {
        constructor: function IsProposition(subject)
        {
            if (!(this instanceof IsProposition))
            {
                return new IsProposition(subject);
            }
            ex.assert(subject.inhabits(ex.Value));
            return EX.Judgment(this, EX.Conjoiner([subject]));
        }
    }
));

EX.IsTrue = ex.Type(Object.assign({},
    EX.Judgment.prototype,
    {
        constructor: function IsTrue(subject)
        {
            if (!(this instanceof IsTrue))
            {
                return new IsTrue(subject);
            }
            ex.assert(subject.inhabits(ex.Value));
            return EX.Judgment(this, EX.Conjoiner([subject]));
        }
    }
));

EX.selfTest = (function ()
{
    const newTypes =
    [
        EX.Conjoiner, EX.Judgment, EX.HypotheticalJudgment, EX.Rule,
        EX.IsProposition, EX.IsTrue
    ];
    const types =
    [
        ex.Type, ex.Value,
    ]
    .concat(newTypes);

    return function selfTest()
    {
        newTypes.map(testType =>
            {
                // Every type inhabits only Type and Value
                types.filter(type => [ ex.Type, ex.Value ].includes(type))
                    .map(type => ex.assert(testType.inhabits(type), type.name));
                types.filter(type => ![ ex.Type, ex.Value ].includes(type))
                    .map(type => ex.deny(testType.inhabits(type), type.name));

                // Every type is only equal to itself
                ex.assert(testType.equals(testType));
                types.filter(type => type !== testType)
                    .map(type => ex.deny(testType.equals(type), type.name));
            }
        );

        // Conjoiner instance

        //   inhabits only Type, Value, and Conjoiner
        const conjoiner = EX.Conjoiner([]);
        types.filter(type => [ ex.Type, ex.Value, EX.Conjoiner ].includes(type))
            .map(type => ex.assert(conjoiner.inhabits(type), type.name));
        types.filter(type => ![ ex.Type, ex.Value, EX.Conjoiner ].includes(type))
            .map(type => ex.deny(conjoiner.inhabits(type), type.name));

        //   does not equal any type
        types.map(type => ex.deny(conjoiner.equals(type)));

        const conjoiner2 = EX.Conjoiner([ ex.Value(), ex.Value() ]);
        ex.deny(conjoiner.equals(conjoiner2));
        ex.assert(conjoiner.equals(conjoiner));
        ex.assert(conjoiner2.equals(conjoiner2));

        // Judgment instance

        //   inhabits only Type, Value, and all Judgment types
        const judgment = EX.Judgment(ex.Value(), EX.Conjoiner([]));
        types.filter(type =>
                [
                    ex.Type, ex.Value, EX.Judgment, EX.HypotheticalJudgment,
                    EX.IsProposition, EX.IsTrue
                ]
                .includes(type)
            )
            .map(type => ex.assert(judgment.inhabits(type), type.name));
        types.filter(type =>
                ![
                    ex.Type, ex.Value, EX.Judgment, EX.HypotheticalJudgment,
                    EX.IsProposition, EX.IsTrue
                ]
                .includes(type)
            )
            .map(type => ex.deny(judgment.inhabits(type), type.name));

        //   does not equal any type
        types.map(type => ex.deny(judgment.equals(type), type.name));

        const judgment2 = EX.Judgment(ex.Value(), EX.Conjoiner([]));
        ex.deny(judgment.equals(judgment2));
        ex.assert(judgment.equals(judgment));

        return true;
    }
})();

ex.deepFreeze(EX);
