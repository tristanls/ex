"use strict";

const EX = module.exports;

EX.deepFreeze = function deepFreeze(obj)
{
    Object.getOwnPropertyNames(obj).map(name =>
        {
            const value = obj[name];
            if ((value !== null)
                && (typeof value === "object")
                && (!Object.isFrozen(value)))
            {
                deepFreeze(value);
            }
        }
    );
    return Object.freeze(obj);
};

EX.assert = function assert(predicate, message)
{
    if (predicate !== EX.true)
    {
        throw new Error(message);
    }
};

EX.deny = function deny(predicate, message)
{
    if (predicate !== EX.false)
    {
        throw new Error(message);
    }
};

const valuePrototype =
{
    constructor: function Value()
    {
        if (!(this instanceof Value))
        {
            return new Value();
        }
        this._value = this;
    },
    // TODO: maybe separate equals from equivalent?
    equals(that)
    {
        if (this === that)
        {
            return EX.true;
        }
        if (that.inhabits(this.constructor) === EX.false)
        {
            return EX.false;
        }
        if (this._value !== undefined && that._value !== undefined)
        {
            if (this._value === that._value)
            {
                return EX.true;
            }
            if (!this._value || !that._value)
            {
                // One of *._value is defined but falsy. If falsy value like 0,
                // false, "", or null does not triple equal the other value,
                // then it is not equal.
                return EX.false;
            }
            if (this._value.equals !== undefined)
            {
                // short circuit infinite recursion of circular self-reference
                if (this._value === this)
                {
                    if (this._value === that._value)
                    {
                        return EX.true;
                    }
                    else
                    {
                        return EX.false;
                    }
                }
                // this._value may be one of ex values
                const exEquals = this._value.equals(that._value);
                if (exEquals === EX.true)
                {
                    return EX.true;
                }
                else if (exEquals === EX.false)
                {
                    return EX.false;
                }
                // equals returned neither EX.true nor EX.false, could be some
                // other equals
            }
            if (Object.keys(this._value).length === Object.keys(that._value).length)
            {
                for (let entry of Object.entries(this._value))
                {
                    // short circuit infinite recursion of circular self-reference
                    if (this === entry[1])
                    {
                        if (entry[1] === that._value[entry[0]])
                        {
                            return EX.true;
                        }
                        else
                        {
                            return EX.false;
                        }
                    }
                    else if (entry[1].equals(that._value[entry[0]]) !== EX.true)
                    {
                        return EX.false;
                    }
                }
                return EX.true;
            }
        }
        return EX.false;
    }
};

const typePrototype =
{
    constructor: function Type(prototype)
    {
        if (!(this instanceof Type))
        {
            return new Type(prototype);
        }
        if (prototype === undefined)
        {
            this._value = this;
            return;
        }
        const newType = Object.assign({},
            valuePrototype,
            typePrototype,
            prototype
        );
        newType.constructor = Object.assign(newType.constructor,
            valuePrototype,
            typePrototype
        );
        newType.constructor.prototype = newType;
        return newType.constructor;
    },
    inhabits(type)
    {
        if (type === EX.Void)
        {
            return EX.false; // nothing inhabits Void type
        }

        // Current convention implies that an instance of any type inhabits
        // EX.Unit type. There are apparently A Lot™ of consequences of this
        // design which may not be readily apparent or intended. This note is
        // a bookmark acknowledging unexplored consequences.

        for (let entry of Object.entries(type.prototype)
                                .filter(entry => entry[1] instanceof Function))
        {

            // Currently working under the convention that if a prototype method
            // has the same name, it implies the same signature, i.e. argument
            // types are compatible and return type is compatible. If this
            // convention is violated, type inhabitance check needs to be updated.

            if (!(this[entry[0]] instanceof Function))
            {
                return EX.false;
            }
        }
        return EX.true;
    }
};

EX.Type = (function ()
{
    const self = Object.assign({},
        valuePrototype,
        typePrototype
    );
    self.constructor = Object.assign(self.constructor,
        valuePrototype,
        typePrototype
    );
    self.constructor.prototype = self;
    return self.constructor;
})();

EX.Value = EX.Type(valuePrototype);

EX.Void = EX.Type(Object.assign({},
    EX.Type.prototype,
    {
        constructor: function Void()
        {
            throw new Error("Void type has no inhabitants");
        }
    }
));

EX.Unit = EX.Type(Object.assign({},
    EX.Type.prototype,
    {
        constructor: function Unit()
        {
            if (!(this instanceof Unit))
            {
                return new Unit();
            }
            if (EX.null === undefined)
            {
                this._value = null;
                EX.null = EX.deepFreeze(this);
            }
            return EX.null;
        }
    }
));
EX.null = EX.Unit();

EX.Sum = EX.Type(Object.assign({},
    EX.Type.prototype,
    {
        constructor: function Sum(types)
        {
            if (!(this instanceof Sum))
            {
                return new Sum(types);
            }
            if (EX.Boolean !== undefined)
            {
                EX.assert(EX.boolFrom(Array.isArray(types)));
                EX.assert(EX.boolFrom(types.length > 0));
                types.map(type => EX.assert(type.inhabits(EX.Type)));
            }
            const maxOrdinal = types.length;
            const prototype =
            {
                constructor: function Injector(ordinal, value)
                {
                    if (!(this instanceof Injector))
                    {
                        return new Injector(ordinal, value);
                    }
                    if (EX.Boolean !== undefined)
                    {
                        ordinal = parseInt(ordinal);
                        EX.assert(EX.boolFrom(ordinal > 0 && ordinal <= maxOrdinal));
                        EX.assert(value.inhabits(types[ordinal - 1]));
                    }
                    this._value =
                    {
                        occupant: value,
                        ordinal:
                        {
                            // hack for equality until we have EX.Number
                            equals: that =>
                            {
                                if (that._value === ordinal)
                                {
                                    return EX.true;
                                }
                                else
                                {
                                    return EX.false;
                                }
                            },
                            _value: ordinal
                        }
                    };
                }
            };
            // Injector inhabitance is determined by what can be done to an
            // Injector, which is, inject specific value at specific ordinal.
            // Injection happens on instance construction, methods are here for
            // inhabitance determination.
            types.map((type, i) => prototype[`inject${i + 1}${type.name}`] = function () {});
            const injector = EX.Type(Object.assign({},
                EX.Type.prototype,
                prototype
            ));
            // Injector equivalence is determined by `that` being an Injector
            // which produces inhabitant of Sum with expected ordinal types.
            // This is encoded by prepending EX.Sum to list of types.
            injector._value = [ EX.Sum, ...types ];
            return injector;
        },
        constructorSum() {}
    }
));

const boolean = EX.Sum([EX.Unit, EX.Unit]);
EX.true = boolean(1, EX.null);
EX.false = boolean(2, EX.null);
EX.Boolean = boolean;
EX.boolFrom = value => value ? EX.true : EX.false;

EX.Option = EX.Sum([EX.Value, EX.Unit]);
EX.optionFrom = value => value !== undefined ? EX.Option(1, value)
                                             : EX.Option(2, EX.null);

EX.Product = EX.Type(Object.assign({},
    EX.Type.prototype,
    {
        constructor: function Product(types)
        {
            if (!(this instanceof Product))
            {
                return new Product(types);
            }
            EX.assert(EX.boolFrom(Array.isArray(types)));
            EX.assert(EX.boolFrom(types.length > 0));
            types.map(type => EX.assert(type.inhabits(EX.Type)));
            const prototype =
            {
                constructor: function Constructor(values)
                {
                    if (!(this instanceof Constructor))
                    {
                        return new Constructor(values);
                    }
                    EX.assert(EX.boolFrom(Array.isArray(values)));
                    EX.assert(EX.boolFrom(values.length === types.length));
                    values.map((value, i) => EX.assert(value.inhabits(types[i])));
                    this._value = values;
                }
            };
            // Product inhabitance is determined by what can be done to a Product,
            // which is, retrieve value at specified ordinal.
            types.map((type, i) => prototype[`ordinal${i + 1}${type.name}`] = function()
                {
                    return this._value[i];
                }
            );
            const constr = EX.Type(Object.assign({},
                EX.Type.prototype,
                prototype
            ));
            // Constructor equivalence is determined by `that` being a Constructor
            // which produces inhabitant of Product with expected ordinal types.
            // This is encoded by prepending EX.Product to list of types.
            constr._value = [ EX.Product, ...types ];
            return constr;
        },
        constructorProduct() {}
    }
));

EX.Pair = EX.Product([EX.Value, EX.Value]);

EX.Arrow = EX.Type(Object.assign({},
    EX.Type.prototype,
    {
        constructor: function Arrow(domain, codomain)
        {
            if (!(this instanceof Arrow))
            {
                return new Arrow(domain, codomain);
            }
            EX.assert(EX.boolFrom(domain.inhabits(EX.Type)));
            EX.assert(EX.boolFrom(codomain.inhabits(EX.Type)));
            const prototype =
            {
                constructor: function Constructor(map)
                {
                    if (!(this instanceof Constructor))
                    {
                        return new Constructor(map);
                    }
                    // As an implementation choice, we encode the map as a
                    // JavaScript function instead of enumerating all the
                    // mappings between domain and codomain.
                    EX.assert(EX.boolFrom(map instanceof Function));
                    this._value = map;
                },
                apply(args)
                {
                    EX.assert(EX.boolFrom(args.inhabits(domain)));
                    const result = this._value.call({}, args);
                    EX.assert(EX.boolFrom(result.inhabits(codomain)));
                    return result;
                }
            };
            const func = EX.Type(Object.assign({},
                EX.Type.prototype,
                prototype
            ));
            // Constructor equivalence is determined by `that` being a Constructor
            // which produces inhabitant of Arrow with expected domain and
            // codomain types. This is encoded by prepending EX.Arrow to list of
            // domain and codomain types.
            func._value = [ EX.Arrow, domain, codomain ];
            return func;
        },
        constructorArrow() {}
    }
));

EX.selfTest = (function ()
{
    const type = EX.Type();
    const value = EX.Value();
    return function selfTest()
    {
        // Type
        EX.assert(EX.Type.inhabits(EX.Type));
        EX.assert(EX.Type.inhabits(EX.Value));
        EX.deny(EX.Type.inhabits(EX.Void));
        EX.assert(EX.Type.inhabits(EX.Unit));
        EX.deny(EX.Type.inhabits(EX.Boolean));
        EX.deny(EX.Type.inhabits(EX.Sum));
        EX.deny(EX.Type.inhabits(EX.Product));

        EX.assert(EX.Type.equals(EX.Type));
        EX.deny(EX.Type.equals(EX.Value));
        EX.deny(EX.Type.equals(EX.Void));
        EX.deny(EX.Type.equals(EX.Unit));
        EX.deny(EX.Type.equals(EX.Boolean));
        EX.deny(EX.Type.equals(EX.Sum));
        EX.deny(EX.Type.equals(EX.Product));

        EX.assert(type.inhabits(EX.Type));
        EX.assert(type.inhabits(EX.Value));
        EX.deny(type.inhabits(EX.Void));
        EX.assert(type.inhabits(EX.Unit));
        EX.deny(type.inhabits(EX.Boolean));
        EX.deny(type.inhabits(EX.Sum));
        EX.deny(type.inhabits(EX.Product));

        EX.assert(type.equals(type));
        EX.deny(type.equals(value));
        EX.deny(type.equals(EX.null));
        EX.deny(type.equals(EX.true));
        EX.deny(type.equals(EX.false));

        // Value
        EX.assert(EX.Value.inhabits(EX.Type));
        EX.assert(EX.Value.inhabits(EX.Value));
        EX.deny(EX.Value.inhabits(EX.Void));
        EX.assert(EX.Value.inhabits(EX.Unit));
        EX.deny(EX.Value.inhabits(EX.Boolean));
        EX.deny(EX.Value.inhabits(EX.Sum));
        EX.deny(EX.Value.inhabits(EX.Product));

        EX.assert(EX.Value.equals(EX.Value));
        EX.deny(EX.Value.equals(EX.Type));
        EX.deny(EX.Value.equals(EX.Void));
        EX.deny(EX.Value.equals(EX.Unit));
        EX.deny(EX.Value.equals(EX.Boolean));
        EX.deny(EX.Value.equals(EX.Sum));
        EX.deny(EX.Value.equals(EX.Product));

        EX.assert(value.inhabits(EX.Type));
        EX.assert(value.inhabits(EX.Value));
        EX.deny(value.inhabits(EX.Void));
        EX.assert(value.inhabits(EX.Unit));
        EX.deny(value.inhabits(EX.Boolean));
        EX.deny(value.inhabits(EX.Sum));
        EX.deny(value.inhabits(EX.Product));

        EX.assert(value.equals(value));
        EX.deny(value.equals(type));
        EX.deny(value.equals(EX.null));
        EX.deny(value.equals(EX.true));
        EX.deny(value.equals(EX.false));

        // Void
        EX.assert(EX.Void.inhabits(EX.Type));
        EX.assert(EX.Void.inhabits(EX.Value));
        EX.deny(EX.Void.inhabits(EX.Void));
        EX.assert(EX.Void.inhabits(EX.Unit));
        EX.deny(EX.Void.inhabits(EX.Boolean));
        EX.deny(EX.Void.inhabits(EX.Sum));
        EX.deny(EX.Void.inhabits(EX.Product));

        EX.assert(EX.Void.equals(EX.Void));
        EX.deny(EX.Void.equals(EX.Type));
        EX.deny(EX.Void.equals(EX.Value));
        EX.deny(EX.Void.equals(EX.Unit));
        EX.deny(EX.Void.equals(EX.Boolean));
        EX.deny(EX.Void.equals(EX.Sum));
        EX.deny(EX.Void.equals(EX.Product));

        // Unit
        EX.assert(EX.Unit.inhabits(EX.Type));
        EX.assert(EX.Unit.inhabits(EX.Value));
        EX.deny(EX.Unit.inhabits(EX.Void));
        EX.assert(EX.Unit.inhabits(EX.Unit));
        EX.deny(EX.Unit.inhabits(EX.Boolean));
        EX.deny(EX.Unit.inhabits(EX.Sum));
        EX.deny(EX.Unit.inhabits(EX.Product));

        EX.assert(EX.Unit.equals(EX.Unit));
        EX.deny(EX.Unit.equals(EX.Type));
        EX.deny(EX.Unit.equals(EX.Value));
        EX.deny(EX.Unit.equals(EX.Void));
        EX.deny(EX.Unit.equals(EX.Boolean));
        EX.deny(EX.Unit.equals(EX.Sum));
        EX.deny(EX.Unit.equals(EX.Product));

        EX.assert(EX.null.inhabits(EX.Type));
        EX.assert(EX.null.inhabits(EX.Value));
        EX.assert(EX.null.inhabits(EX.Unit));
        EX.deny(EX.null.inhabits(EX.Void));
        EX.deny(EX.null.inhabits(EX.Boolean));
        EX.deny(EX.null.inhabits(EX.Sum));
        EX.deny(EX.null.inhabits(EX.Product));

        EX.assert(EX.null.equals(EX.null));
        EX.deny(EX.null.equals(type));
        EX.deny(EX.null.equals(value));
        EX.deny(EX.null.equals(EX.true));
        EX.deny(EX.null.equals(EX.false));

        // Sum
        EX.assert(EX.Sum.inhabits(EX.Type));
        EX.assert(EX.Sum.inhabits(EX.Value));
        EX.deny(EX.Sum.inhabits(EX.Void));
        EX.assert(EX.Sum.inhabits(EX.Unit));
        EX.deny(EX.Sum.inhabits(EX.Boolean));
        EX.deny(EX.Sum.inhabits(EX.Sum));
        EX.deny(EX.Sum.inhabits(EX.Product));

        const MyType = EX.Sum([EX.Unit, EX.Unit, EX.Unit]);
        const MyType2 = EX.Sum([MyType, MyType]);
        const myInst = MyType(3, EX.null);
        EX.assert(myInst.inhabits(MyType));
        EX.deny(myInst.inhabits(MyType2));
        const myInst2 = MyType2(1, myInst);
        EX.assert(myInst2.inhabits(MyType2));
        EX.deny(myInst2.inhabits(MyType));

        // Boolean from Sum
        const Boolean = EX.Sum([EX.Unit, EX.Unit]);
        EX.assert(Boolean.inhabits(EX.Type));
        EX.assert(Boolean.inhabits(EX.Value));
        EX.deny(Boolean.inhabits(EX.Sum));
        EX.deny(Boolean.inhabits(EX.Sum([EX.Unit, EX.Unit])));
        EX.deny(Boolean.inhabits(EX.Void));
        EX.assert(Boolean.inhabits(EX.Unit));

        EX.assert(Boolean.equals(EX.Sum([EX.Unit, EX.Unit])));
        EX.assert(Boolean.equals(EX.Boolean));
        EX.deny(Boolean.equals(EX.Sum([EX.Unit, EX.Value])));

        const _true = Boolean(1, EX.null);
        EX.assert(_true.inhabits(EX.Type));
        EX.assert(_true.inhabits(EX.Value));
        EX.deny(_true.inhabits(EX.Void));
        EX.assert(_true.inhabits(EX.Unit));
        EX.assert(_true.inhabits(EX.Sum([EX.Unit, EX.Unit])));
        EX.deny(_true.inhabits(EX.Product([EX.Unit, EX.Unit])));
        EX.assert(_true.inhabits(Boolean));

        const _false = Boolean(2, EX.null);
        EX.assert(_false.inhabits(EX.Type));
        EX.assert(_false.inhabits(EX.Value));
        EX.deny(_false.inhabits(EX.Void));
        EX.assert(_false.inhabits(EX.Unit));
        EX.assert(_false.inhabits(EX.Sum([EX.Unit, EX.Unit])));
        EX.deny(_false.inhabits(EX.Product([EX.Unit, EX.Unit])));
        EX.assert(_false.inhabits(Boolean));

        EX.assert(_true.equals(_true));
        EX.deny(_true.equals(type));
        EX.deny(_true.equals(value));
        EX.deny(_true.equals(EX.null));
        EX.deny(_true.equals(_false));

        EX.assert(_false.equals(_false));
        EX.deny(_false.equals(type));
        EX.deny(_false.equals(value));
        EX.deny(_false.equals(EX.null));
        EX.deny(_false.equals(_true));

        // Option
        EX.assert(EX.Option.inhabits(EX.Type));
        EX.assert(EX.Option.inhabits(EX.Value));
        EX.deny(EX.Option.inhabits(EX.Sum));
        EX.deny(EX.Option.inhabits(EX.Void));
        EX.assert(EX.Option.inhabits(EX.Unit));

        EX.assert(EX.Option.equals(EX.Sum([EX.Value, EX.Unit])));

        const hasValue = EX.Option(1, EX.Value());
        EX.assert(hasValue.inhabits(EX.Type));
        EX.assert(hasValue.inhabits(EX.Value));
        EX.deny(hasValue.inhabits(EX.Void));
        EX.assert(hasValue.inhabits(EX.Unit));
        EX.assert(hasValue.inhabits(EX.Sum([EX.Value, EX.Unit])));
        EX.assert(hasValue.inhabits(EX.Option));

        const noValue = EX.Option(2, EX.null);
        EX.assert(noValue.inhabits(EX.Type));
        EX.assert(noValue.inhabits(EX.Value));
        EX.deny(noValue.inhabits(EX.Void));
        EX.assert(noValue.inhabits(EX.Unit));
        EX.assert(noValue.inhabits(EX.Sum([EX.Value, EX.Unit])));
        EX.assert(noValue.inhabits(EX.Option));

        EX.assert(hasValue.equals(hasValue));
        EX.assert(noValue.equals(noValue));
        EX.deny(hasValue.equals(noValue));
        EX.deny(noValue.equals(hasValue));
        EX.deny(hasValue.equals(EX.Option(1, EX.Value())));

        // Product
        EX.assert(EX.Product.inhabits(EX.Type));
        EX.assert(EX.Product.inhabits(EX.Value));
        EX.deny(EX.Product.inhabits(EX.Void));
        EX.assert(EX.Product.inhabits(EX.Unit));
        EX.deny(EX.Product.inhabits(EX.Boolean));
        EX.deny(EX.Product.inhabits(EX.Sum));
        EX.deny(EX.Product.inhabits(EX.Product));

        const MyProd = EX.Product([EX.Unit, EX.Unit, EX.Unit]);
        EX.assert(MyProd.inhabits(EX.Type));
        EX.assert(MyProd.inhabits(EX.Value));
        EX.assert(MyProd.inhabits(EX.Unit));
        EX.deny(MyProd.inhabits(EX.Void));
        const myProd = MyProd([EX.null, EX.null, EX.null]);
        const myProd2 = MyProd([EX.null, EX.null, EX.null]);
        EX.assert(myProd.equals(myProd));
        EX.assert(myProd.equals(myProd2));

        // Pair from Product
        EX.assert(EX.Pair.inhabits(EX.Type));
        EX.assert(EX.Pair.inhabits(EX.Value));
        EX.deny(EX.Pair.inhabits(EX.Product));
        EX.deny(EX.Pair.inhabits(EX.Product([EX.Value, EX.Value])));
        EX.deny(EX.Pair.inhabits(EX.Void));
        EX.assert(EX.Pair.inhabits(EX.Unit));

        EX.assert(EX.Pair.equals(EX.Product([EX.Value, EX.Value])));
        EX.deny(EX.Pair.equals(EX.Product([EX.Value, EX.Unit])));

        const val1 = EX.Value();
        const pair = EX.Pair([val1, EX.Value()]);
        EX.assert(pair.inhabits(EX.Product([EX.Value, EX.Value])));
        EX.deny(pair.inhabits(EX.Sum([EX.Value, EX.Value])));
        const pair2 = EX.Pair([EX.Value(), EX.Value()]);
        EX.assert(pair.equals(pair));
        EX.assert(pair2.equals(pair2));
        EX.deny(pair.equals(pair2));
        const pair3 = EX.Pair([EX.null, EX.null]);
        const pair4 = EX.Pair([EX.null, EX.null]);
        EX.assert(pair3.equals(pair4));
        EX.deny(pair.equals(pair3));
        EX.assert(pair3.ordinal1Value().equals(EX.null));
        EX.assert(pair3.ordinal2Value().equals(EX.null));
        EX.assert(pair.ordinal1Value().equals(val1));

        // Boolean
        EX.assert(EX.Boolean.inhabits(EX.Type));
        EX.assert(EX.Boolean.inhabits(EX.Value));
        EX.deny(EX.Boolean.inhabits(EX.Void));
        EX.assert(EX.Boolean.inhabits(EX.Unit));
        EX.deny(EX.Boolean.inhabits(EX.Boolean));

        EX.assert(EX.Boolean.equals(EX.Boolean));
        EX.deny(EX.Boolean.equals(EX.Type));
        EX.deny(EX.Boolean.equals(EX.Value));
        EX.deny(EX.Boolean.equals(EX.Void));
        EX.deny(EX.Boolean.equals(EX.Unit));

        EX.assert(EX.true.inhabits(EX.Type));
        EX.assert(EX.true.inhabits(EX.Value));
        EX.assert(EX.true.inhabits(EX.Boolean));
        EX.deny(EX.true.inhabits(EX.Void));
        EX.assert(EX.true.inhabits(EX.Unit));

        EX.assert(EX.true.equals(EX.true));
        EX.deny(EX.true.equals(type));
        EX.deny(EX.true.equals(value));
        EX.deny(EX.true.equals(EX.null));
        EX.deny(EX.true.equals(EX.false));

        EX.assert(EX.false.inhabits(EX.Type));
        EX.assert(EX.false.inhabits(EX.Value));
        EX.assert(EX.false.inhabits(EX.Boolean));
        EX.deny(EX.false.inhabits(EX.Void));
        EX.assert(EX.false.inhabits(EX.Unit));

        EX.assert(EX.false.equals(EX.false));
        EX.deny(EX.false.equals(type));
        EX.deny(EX.false.equals(value));
        EX.deny(EX.false.equals(EX.null));
        EX.deny(EX.false.equals(EX.true));

        // Arrow
        EX.assert(EX.Arrow.inhabits(EX.Type));
        EX.assert(EX.Arrow.inhabits(EX.Value));
        EX.deny(EX.Arrow.inhabits(EX.Void));
        EX.assert(EX.Arrow.inhabits(EX.Unit));
        EX.deny(EX.Arrow.inhabits(EX.Boolean));
        EX.deny(EX.Arrow.inhabits(EX.Sum));
        EX.deny(EX.Arrow.inhabits(EX.Product));
        EX.deny(EX.Arrow.inhabits(EX.Arrow));

        const Tick = EX.Arrow(EX.Unit, EX.Unit);
        EX.assert(Tick.inhabits(EX.Type));
        EX.assert(Tick.inhabits(EX.Value));
        EX.assert(Tick.inhabits(EX.Unit));
        EX.deny(Tick.inhabits(EX.Void));
        const tick = Tick(() => EX.null);
        EX.assert(tick.inhabits(EX.Type));
        EX.assert(tick.inhabits(EX.Value));
        EX.assert(tick.inhabits(EX.Unit));
        EX.assert(tick.inhabits(EX.Arrow(EX.Unit, EX.Unit)));
        const result = tick.apply(EX.null);
        EX.assert(result.inhabits(EX.Unit));
        EX.assert(result.equals(EX.null));

        // Resolved problems
        EX.deny(EX.Sum([EX.Unit]).equals(EX.Product([EX.Unit])));
        EX.deny(EX.Product([EX.Unit]).equals(EX.Sum([EX.Unit])));
        EX.deny(EX.Sum.inhabits(EX.Product));
        EX.deny(EX.Sum([EX.Unit]).inhabits(EX.Product));
        EX.deny(EX.Product.inhabits(EX.Sum));
        EX.deny(EX.Product([EX.Unit]).inhabits(EX.Sum));
        EX.deny(EX.Boolean.inhabits(EX.Boolean));

        return true;
    }
})();

EX.deepFreeze(EX);
