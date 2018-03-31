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
    },
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
                    if (entry[1].equals(that._value[entry[0]]) !== EX.true)
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
            EX.assert(EX.Boolean(Array.isArray(types)));
            EX.assert(EX.Boolean(types.length > 0));
            types.map(type => EX.assert(type.inhabits(EX.Type)));
            const maxOrdinal = types.length;
            const prototype =
            {
                constructor: function Injector(ordinal, value)
                {
                    if (!(this instanceof Injector))
                    {
                        return new Injector(ordinal, value);
                    }
                    ordinal = parseInt(ordinal);
                    EX.assert(EX.Boolean(ordinal > 0 && ordinal <= maxOrdinal));
                    EX.assert(value.inhabits(types[ordinal - 1]));
                    this._value =
                    {
                        occupant: value,
                        ordinal:
                        {
                            // hack for equality until we have EX.Number
                            equals: that => that._value === ordinal,
                            _value: ordinal
                        }
                    }
                }
            };
            types.map((type, i) => prototype[`ordinal${i + 1}${type.name}`] = function () {});
            const injector = EX.Type(Object.assign({},
                EX.Type.prototype,
                prototype
            ));
            injector._value = types;
            return injector;
        }
    }
));

EX.Product = EX.Type(Object.assign({},
    EX.Type.prototype,
    {
        constructor: function Product(types)
        {
            if (!(this instanceof Product))
            {
                return new Product(types);
            }
            EX.assert(EX.Boolean(Array.isArray(types)));
            EX.assert(EX.Boolean(types.length > 0));
            types.map(type => EX.assert(type.inhabits(EX.Type)));
            const prototype =
            {
                constructor: function Constructor(values)
                {
                    if (!(this instanceof Constructor))
                    {
                        return new Constructor(values);
                    }
                    EX.assert(EX.Boolean(Array.isArray(values)));
                    EX.assert(EX.Boolean(values.length === types.length));
                    values.map((value, i) => EX.assert(value.inhabits(types[i])));
                    this._value = values;
                }
            };
            types.map((type, i) => prototype[`ordinal${i + 1}${type.name}`] = function()
                {
                    return this._value[i];
                }
            );
            const constr = EX.Type(Object.assign({},
                EX.Type.prototype,
                prototype
            ));
            constr._value = types;
            return constr;
        }
    }
));

EX.Boolean = EX.Type(Object.assign({},
    EX.Type.prototype,
    {
        constructor: function Boolean(value)
        {
            if (!(this instanceof Boolean))
            {
                return new Boolean(value);
            }
            if (value)
            {
                if (EX.true === undefined)
                {
                    this._value = true;
                    EX.true = EX.deepFreeze(this);
                }
                return EX.true;
            }
            else
            {
                if (EX.false === undefined)
                {
                    this._value = false;
                    EX.false = EX.deepFreeze(this);
                }
                return EX.false;
            }
        }
    }
));
EX.true = EX.Boolean(true);
EX.false = EX.Boolean(false);

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
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Type.inhabits(EX.Boolean));

        EX.assert(EX.Type.equals(EX.Type));
        EX.deny(EX.Type.equals(EX.Value));
        EX.deny(EX.Type.equals(EX.Void));
        EX.deny(EX.Type.equals(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Type.equals(EX.Boolean));

        EX.assert(type.inhabits(EX.Type));
        EX.assert(type.inhabits(EX.Value));
        EX.deny(type.inhabits(EX.Void));
        EX.assert(type.inhabits(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(type.inhabits(EX.Boolean));

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
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Value.inhabits(EX.Boolean));

        EX.assert(EX.Value.equals(EX.Value));
        EX.deny(EX.Value.equals(EX.Type));
        EX.deny(EX.Value.equals(EX.Void));
        EX.deny(EX.Value.equals(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Value.equals(EX.Boolean));

        EX.assert(value.inhabits(EX.Type));
        EX.assert(value.inhabits(EX.Value));
        EX.deny(value.inhabits(EX.Void));
        EX.assert(value.inhabits(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(value.inhabits(EX.Boolean));

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
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Void.inhabits(EX.Boolean));

        EX.assert(EX.Void.equals(EX.Void));
        EX.deny(EX.Void.equals(EX.Type));
        EX.deny(EX.Void.equals(EX.Value));
        EX.deny(EX.Void.equals(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Void.equals(EX.Boolean));

        // Unit
        EX.assert(EX.Unit.inhabits(EX.Type));
        EX.assert(EX.Unit.inhabits(EX.Value));
        EX.deny(EX.Unit.inhabits(EX.Void));
        EX.assert(EX.Unit.inhabits(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Unit.inhabits(EX.Boolean));

        EX.assert(EX.Unit.equals(EX.Unit));
        EX.deny(EX.Unit.equals(EX.Type));
        EX.deny(EX.Unit.equals(EX.Value));
        EX.deny(EX.Unit.equals(EX.Void));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Unit.equals(EX.Boolean));

        EX.assert(EX.null.inhabits(EX.Type));
        EX.assert(EX.null.inhabits(EX.Value));
        EX.assert(EX.null.inhabits(EX.Unit));
        EX.deny(EX.null.inhabits(EX.Void));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.null.inhabits(EX.Boolean));

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
        EX.assert(Boolean.inhabits(EX.Sum));
        EX.deny(Boolean.inhabits(EX.Void));
        EX.assert(Boolean.inhabits(EX.Unit));

        EX.assert(Boolean.equals(EX.Sum([EX.Unit, EX.Unit])));
        EX.deny(Boolean.equals(EX.Sum([EX.Unit, EX.Value])));

        const _true = Boolean(1, EX.null);
        EX.assert(_true.inhabits(EX.Type));
        EX.assert(_true.inhabits(EX.Value));
        EX.deny(_true.inhabits(EX.Void));
        EX.assert(_true.inhabits(EX.Unit));
        EX.assert(_true.inhabits(EX.Sum([EX.Unit, EX.Unit])));
        EX.assert(_true.inhabits(Boolean));

        const _false = Boolean(2, EX.null);
        EX.assert(_false.inhabits(EX.Type));
        EX.assert(_false.inhabits(EX.Value));
        EX.deny(_false.inhabits(EX.Void));
        EX.assert(_false.inhabits(EX.Unit));
        EX.assert(_false.inhabits(EX.Sum([EX.Unit, EX.Unit])));
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

        // Option from Sum
        const Option = EX.Sum([EX.Value, EX.Unit]);
        EX.assert(Option.inhabits(EX.Type));
        EX.assert(Option.inhabits(EX.Value));
        EX.assert(Option.inhabits(EX.Sum));
        EX.deny(Option.inhabits(EX.Void));
        EX.assert(Option.inhabits(EX.Unit));

        EX.assert(Option.equals(EX.Sum([EX.Value, EX.Unit])));

        const hasValue = Option(1, EX.Value());
        EX.assert(hasValue.inhabits(EX.Type));
        EX.assert(hasValue.inhabits(EX.Value));
        EX.deny(hasValue.inhabits(EX.Void));
        EX.assert(hasValue.inhabits(EX.Unit));
        EX.assert(hasValue.inhabits(EX.Sum([EX.Value, EX.Unit])));
        EX.assert(hasValue.inhabits(Option));

        const noValue = Option(2, EX.null);
        EX.assert(noValue.inhabits(EX.Type));
        EX.assert(noValue.inhabits(EX.Value));
        EX.deny(noValue.inhabits(EX.Void));
        EX.assert(noValue.inhabits(EX.Unit));
        EX.assert(noValue.inhabits(EX.Sum([EX.Value, EX.Unit])));
        EX.assert(noValue.inhabits(Option));

        EX.assert(hasValue.equals(hasValue));
        EX.assert(noValue.equals(noValue));
        EX.deny(hasValue.equals(noValue));
        EX.deny(noValue.equals(hasValue));
        EX.deny(hasValue.equals(Option(1, EX.Value())));

        // Product
        EX.assert(EX.Product.inhabits(EX.Type));
        EX.assert(EX.Product.inhabits(EX.Value));
        EX.deny(EX.Product.inhabits(EX.Void));
        EX.assert(EX.Product.inhabits(EX.Unit));

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
        const Pair = EX.Product([EX.Value, EX.Value]);
        EX.assert(Pair.inhabits(EX.Type));
        EX.assert(Pair.inhabits(EX.Value));
        EX.assert(Pair.inhabits(EX.Product));
        EX.deny(Pair.inhabits(EX.Void));
        EX.assert(Pair.inhabits(EX.Unit));

        EX.assert(Pair.equals(EX.Product([EX.Value, EX.Value])));
        EX.deny(Pair.equals(EX.Product([EX.Value, EX.Unit])));

        const val1 = EX.Value();
        const pair = Pair([val1, EX.Value()]);
        const pair2 = Pair([EX.Value(), EX.Value()]);
        EX.assert(pair.equals(pair));
        EX.assert(pair2.equals(pair2));
        EX.deny(pair.equals(pair2));
        const pair3 = Pair([EX.null, EX.null]);
        const pair4 = Pair([EX.null, EX.null]);
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
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Boolean.inhabits(EX.Boolean));

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

        // TODO: Problems to resolve

        // Boolean type is indistinguishible
        EX.assert(EX.Boolean.inhabits(EX.Boolean));

        // Sum and Product constructors are indistinguishable
        EX.assert(EX.Sum.inhabits(EX.Product));
        EX.assert(EX.Sum([EX.Unit]).inhabits(EX.Product));
        EX.assert(EX.Sum([EX.Unit]).equals(EX.Product([EX.Unit])));
        EX.assert(EX.Product.inhabits(EX.Sum));
        EX.assert(EX.Product([EX.Unit]).inhabits(EX.Sum));
        EX.assert(EX.Product([EX.Unit]).equals(EX.Sum([EX.Unit])));

        return true;
    }
})();

EX.deepFreeze(EX);
