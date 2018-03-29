"use strict";

const EX = module.exports;

let _ordinal = -1;
function ordinal()
{
    return ++_ordinal;
};

function deepFreeze(obj)
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
    hasType(type)
    {
        for (let entry of Object.entries(type.prototype)
                                .filter(entry => entry[1] instanceof Function))
        {
            if (!(this[entry[0]] instanceof Function))
            {
                return EX.false;
            }
        }
        if (type.prototype.distinguished !== undefined)
        {
            if (this.distinguished !== type.prototype.distinguished)
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
        distinguished: ordinal(),
        constructor: function Void()
        {
            throw new Error("Void type has no instances");
        }
    }
));

EX.Unit = EX.Type(Object.assign({},
    EX.Type.prototype,
    {
        distinguished: ordinal(),
        constructor: function Unit()
        {
            if (!(this instanceof Unit))
            {
                return new Unit();
            }
            if (EX.null === undefined)
            {
                this._value = null;
                EX.null = deepFreeze(this);
            }
            return EX.null;
        }
    }
));
EX.null = EX.Unit();

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
                    EX.true = deepFreeze(this);
                }
                return EX.true;
            }
            else
            {
                if (EX.false === undefined)
                {
                    this._value = false;
                    EX.false = deepFreeze(this);
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
        EX.assert(EX.Type.hasType(EX.Type));
        EX.assert(EX.Type.hasType(EX.Value));
        EX.deny(EX.Type.hasType(EX.Void));
        EX.deny(EX.Type.hasType(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Type.hasType(EX.Boolean));

        EX.assert(EX.Type.equals(EX.Type));
        EX.deny(EX.Type.equals(EX.Value));
        EX.deny(EX.Type.equals(EX.Void));
        EX.deny(EX.Type.equals(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Type.equals(EX.Boolean));

        EX.assert(type.hasType(EX.Type));
        EX.assert(type.hasType(EX.Value));
        EX.deny(type.hasType(EX.Void));
        EX.deny(type.hasType(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(type.hasType(EX.Boolean));

        EX.assert(type.equals(type));
        EX.deny(type.equals(value));
        EX.deny(type.equals(EX.null));
        EX.deny(type.equals(EX.true));
        EX.deny(type.equals(EX.false));

        // Value
        EX.assert(EX.Value.hasType(EX.Type));
        EX.assert(EX.Value.hasType(EX.Value));
        EX.deny(EX.Value.hasType(EX.Void));
        EX.deny(EX.Value.hasType(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Value.hasType(EX.Boolean));

        EX.assert(EX.Value.equals(EX.Value));
        EX.deny(EX.Value.equals(EX.Type));
        EX.deny(EX.Value.equals(EX.Void));
        EX.deny(EX.Value.equals(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Value.equals(EX.Boolean));

        EX.assert(value.hasType(EX.Type));
        EX.assert(value.hasType(EX.Value));
        EX.deny(value.hasType(EX.Void));
        EX.deny(value.hasType(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(value.hasType(EX.Boolean));

        EX.assert(value.equals(value));
        EX.deny(value.equals(type));
        EX.deny(value.equals(EX.null));
        EX.deny(value.equals(EX.true));
        EX.deny(value.equals(EX.false));

        // Void
        EX.assert(EX.Void.hasType(EX.Type));
        EX.assert(EX.Void.hasType(EX.Value));
        EX.deny(EX.Void.hasType(EX.Void));
        EX.deny(EX.Void.hasType(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Void.hasType(EX.Boolean));

        EX.assert(EX.Void.equals(EX.Void));
        EX.deny(EX.Void.equals(EX.Type));
        EX.deny(EX.Void.equals(EX.Value));
        EX.deny(EX.Void.equals(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Void.equals(EX.Boolean));

        // Unit
        EX.assert(EX.Unit.hasType(EX.Type));
        EX.assert(EX.Unit.hasType(EX.Value));
        EX.deny(EX.Unit.hasType(EX.Void));
        EX.deny(EX.Unit.hasType(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Unit.hasType(EX.Boolean));

        EX.assert(EX.Unit.equals(EX.Unit));
        EX.deny(EX.Unit.equals(EX.Type));
        EX.deny(EX.Unit.equals(EX.Value));
        EX.deny(EX.Unit.equals(EX.Void));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Unit.equals(EX.Boolean));

        EX.assert(EX.null.hasType(EX.Type));
        EX.assert(EX.null.hasType(EX.Value));
        EX.assert(EX.null.hasType(EX.Unit));
        EX.deny(EX.null.hasType(EX.Void));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.null.hasType(EX.Boolean));

        EX.assert(EX.null.equals(EX.null));
        EX.deny(EX.null.equals(type));
        EX.deny(EX.null.equals(value));
        EX.deny(EX.null.equals(EX.true));
        EX.deny(EX.null.equals(EX.false));

        // Boolean
        EX.assert(EX.Boolean.hasType(EX.Type));
        EX.assert(EX.Boolean.hasType(EX.Value));
        EX.deny(EX.Boolean.hasType(EX.Void));
        EX.deny(EX.Boolean.hasType(EX.Unit));
        // TODO: Boolean type is currently indistinguishable
        // EX.deny(EX.Boolean.hasType(EX.Boolean));

        EX.assert(EX.Boolean.equals(EX.Boolean));
        EX.deny(EX.Boolean.equals(EX.Type));
        EX.deny(EX.Boolean.equals(EX.Value));
        EX.deny(EX.Boolean.equals(EX.Void));
        EX.deny(EX.Boolean.equals(EX.Unit));

        EX.assert(EX.true.hasType(EX.Type));
        EX.assert(EX.true.hasType(EX.Value));
        EX.assert(EX.true.hasType(EX.Boolean));
        EX.deny(EX.true.hasType(EX.Void));
        EX.deny(EX.true.hasType(EX.Unit));

        EX.assert(EX.true.equals(EX.true));
        EX.deny(EX.true.equals(type));
        EX.deny(EX.true.equals(value));
        EX.deny(EX.true.equals(EX.null));
        EX.deny(EX.true.equals(EX.false));

        EX.assert(EX.false.hasType(EX.Type));
        EX.assert(EX.false.hasType(EX.Value));
        EX.assert(EX.false.hasType(EX.Boolean));
        EX.deny(EX.false.hasType(EX.Void));
        EX.deny(EX.false.hasType(EX.Unit));

        EX.assert(EX.false.equals(EX.false));
        EX.deny(EX.false.equals(type));
        EX.deny(EX.false.equals(value));
        EX.deny(EX.false.equals(EX.null));
        EX.deny(EX.false.equals(EX.true));
    }
})();

deepFreeze(EX);
