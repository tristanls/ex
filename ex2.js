"use strict";

const ex = require("./ex.js");

const EX = module.exports;

EX.Collection = ex.Type(Object.assign({},
    ex.Type.prototype,
    {
        constructor: function Collection(type)
        {
            if (!(this instanceof Collection))
            {
                return new Collection(type);
            }
            ex.assert(type.inhabits(ex.Type));
            const prototype =
            {
                constructor: function Collection(values)
                {
                    if (!(this instanceof Collection))
                    {
                        return new Collection(values);
                    }
                    ex.assert(ex.boolFrom(Array.isArray(values)));
                    values.map((value => ex.assert(value.inhabits(type))));
                    this._value = values;
                },
                values()
                {
                    // TODO: need to return a sum, we can have an empty collection,
                    //       which should end up returning ex.null, we can have
                    //       a collection of one, which would be Product<type>,
                    //       or we have an unknown number of values, which would
                    //       return a Product of unknown number of types. This
                    //       seems to require that we be able to setup a relationship
                    //       of values result inhabits Product<type1,type2,type3> inhabits Product
                    const types = this._value.map(() => type);
                    const product = ex.Product(types);
                    return product(this._value);
                }
            };
            // TODO: Collection inhabitance implementation is unclear.
            //       Assuming instances of Collection(Boolean) should inhabit
            //       Collection(Value) type, how to do so with existing
            //       inhabits
            const constr = ex.Type(Object.assign({},
                ex.Type.prototype,
                prototype
            ));
            constr._value = [ EX.Collection, type ];
            return constr;
        },
        constructorCollection() {}
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
            ex.assert(subjects.inhabits(EX.Collection(ex.Type)));
            const product = subjects.values();
            console.log(product);
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
        constructor: function HypotheticalJudgment(hypotheses, conclusion)
        {
            if (!(this instanceof HypotheticalJudgment))
            {
                return new HypotheticalJudgment(hypotheses, conclusion);
            }
            ex.assert(hypotheses.inhabits(EX.Conjoiner));
            hypotheses._value.map(hypothesis => ex.assert(hypothesis.inhabits(EX.Judgment)));
            ex.assert(conclusion.inhabits(EX.Judgment));
            this._value =
            {
                conclusion,
                hypotheses
            };
            return EX.Judgment(this, hypotheses.join(conclusion));
        }
    }
));

EX.Rule = ex.Type(Object.assign({},
    ex.Type.prototype,
    {
        constructor: function Rule(premises, conclusion)
        {
            if (!(this instanceof Rule))
            {
                return new Rule(premises, conclusion);
            }
            ex.assert(premises.inhabits(EX.Conjoiner));
            premises._value.map(premise => ex.assert(premise.inhabits(EX.Judgment)));
            ex.assert(conclusion.inhabits(EX.Judgment));
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
            return EX.Judgment(EX.IsProposition, EX.Conjoiner([subject]));
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
            return EX.Judgment(EX.IsTrue, EX.Conjoiner([subject]));
        }
    }
));

EX.selfTest = (function ()
{
    const newTypes =
    [
        EX.Collection, EX.Judgment, EX.HypotheticalJudgment, EX.Rule,
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

        // Collection instance

        //   inhabits only Type, Value, and Collection<Type>
        const collectionOfType = EX.Collection(ex.Type);
        const collection = collectionOfType([]);
        types.filter(type => [ ex.Type, ex.Value, collectionOfType ].includes(type))
            .map(type => ex.assert(collection.inhabits(type), type.name));
        types.filter(type => ![ ex.Type, ex.Value, collectionOfType ].includes(type))
            .map(type => ex.deny(collection.inhabits(type), type.name));

        //   does not equal any type
        types.map(type => ex.deny(collection.equals(type)));

        const collection2 = collectionOfType([ ex.Value(), ex.Value() ]);
        ex.deny(collection.equals(collection2));
        ex.assert(collection.equals(collection));
        ex.assert(collection2.equals(collection2));
        const collection3 = collectionOfType([ ex.Value(), ex.Value() ]);
        ex.deny(collection2.equals(collection3));

        // Judgment instance

        //   inhabits only Type, Value, and all Judgment types
        const judgment = EX.Judgment(ex.Value(), EX.Collection(ex.Type)([]));
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

        // HypotheticalJudgment instance

        //   inhabits only Type, Value, and all Judgment types
        const hypotheticalJudgment = EX.HypotheticalJudgment(
            EX.Conjoiner([]),
            EX.Judgment(ex.Value(), EX.Conjoiner([]))
        );
        types.filter(type =>
                [
                    ex.Type, ex.Value, EX.Judgment, EX.HypotheticalJudgment,
                    EX.IsProposition, EX.IsTrue
                ]
                .includes(type)
            )
            .map(type => ex.assert(hypotheticalJudgment.inhabits(type), type.name));
        types.filter(type =>
                ![
                    ex.Type, ex.Value, EX.Judgment, EX.HypotheticalJudgment,
                    EX.IsProposition, EX.IsTrue
                ]
                .includes(type)
            )
            .map(type => ex.deny(hypotheticalJudgment.inhabits(type), type.name));

        // does not equal any type
        types.map(type => ex.deny(hypotheticalJudgment.equals(type), type.name));

        const sameJudgment = EX.Judgment(ex.Value(), EX.Conjoiner([]));
        const hypotheticalJudgment2 = EX.HypotheticalJudgment(
            EX.Conjoiner([]),
            sameJudgment
        );
        ex.deny(hypotheticalJudgment.equals(hypotheticalJudgment2));
        const hypotheticalJudgment3 = EX.HypotheticalJudgment(
            EX.Conjoiner([]),
            sameJudgment
        );
        ex.assert(hypotheticalJudgment2.equals(hypotheticalJudgment3));

        // Rule instance

        //   inhabits only Type, Value, and Rule
        const rule = EX.Rule(
            EX.Conjoiner([]),
            EX.Judgment(ex.Value(), EX.Conjoiner([]))
        );
        types.filter(type => [ ex.Type, ex.Value, EX.Rule ].includes(type))
            .map(type => ex.assert(rule.inhabits(type), type.name));
        types.filter(type => ![ ex.Type, ex.Value, EX.Rule ].includes(type))
            .map(type => ex.deny(rule.inhabits(type), type.name));

        //   does not equal any type
        types.map(type => ex.deny(rule.equals(type), type.name));

        const sameJudgment2 = EX.Judgment(ex.Value(), EX.Conjoiner([]));
        const rule2 = EX.Rule(
            EX.Conjoiner([]),
            sameJudgment2
        );
        ex.deny(rule.equals(rule2));
        ex.assert(rule.equals(rule));
        const rule3 = EX.Rule(
            EX.Conjoiner([]),
            sameJudgment2
        );
        ex.assert(rule2.equals(rule3));

        // IsProposition instance

        //   inhabits only Type, Value, and Judgment types
        const prop = EX.IsProposition(ex.Value());
        types.filter(type =>
                [
                    ex.Type, ex.Value, EX.Judgment, EX.HypotheticalJudgment,
                    EX.IsProposition, EX.IsTrue
                ]
                .includes(type)
            )
            .map(type => ex.assert(prop.inhabits(type), type.name));
        types.filter(type =>
                ![
                    ex.Type, ex.Value, EX.Judgment, EX.HypotheticalJudgment,
                    EX.IsProposition, EX.IsTrue
                ]
                .includes(type)
            )
            .map(type => ex.deny(prop.inhabits(type), type.name));

        // does not equal any type
        types.map(type => ex.deny(prop.equals(type), type.name));

        const sameValue = ex.Value();
        const prop2 = EX.IsProposition(sameValue);
        ex.deny(prop.equals(prop2));
        const prop3 = EX.IsProposition(sameValue);
        ex.assert(prop2.equals(prop3));

        // IsTrue instance

        //   inhabits only Type, Value, and Judgment types
        const judg = EX.IsTrue(ex.Value());
        types.filter(type =>
                [
                    ex.Type, ex.Value, EX.Judgment, EX.HypotheticalJudgment,
                    EX.IsProposition, EX.IsTrue
                ]
                .includes(type)
            )
            .map(type => ex.assert(judg.inhabits(type), type.name));
        types.filter(type =>
                ![
                    ex.Type, ex.Value, EX.Judgment, EX.HypotheticalJudgment,
                    EX.IsProposition, EX.IsTrue
                ]
                .includes(type)
            )
            .map(type => ex.deny(judg.inhabits(type), type.name));

        // does not equal any type
        types.map(type => ex.deny(judg.equals(type), type.name));

        const sameValue2 = ex.Value();
        const judg2 = EX.IsTrue(sameValue2);
        ex.deny(judg.equals(judg2));
        const judg3 = EX.IsTrue(sameValue2);
        ex.assert(judg2.equals(judg3));

        return true;
    }
})();

ex.deepFreeze(EX);
