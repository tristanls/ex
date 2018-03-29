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
}

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
            if (!(this instanceof Void))
            {
                return new Void();
            }
            if (EX.void === undefined)
            {
                EX.void = deepFreeze(this);
            }
            return EX.void;
        }
    }
));
EX.void = EX.Void();

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
            if (EX.unit === undefined)
            {
                this._value = null;
                EX.unit = deepFreeze(this);
            }
            return EX.unit;
        }
    }
));
EX.unit = EX.Unit();

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
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.Type.hasType(EX.Void).not());
        // EX.assert(EX.Type.hasType(EX.Unit).not());
        // EX.assert(EX.Type.hasType(EX.Boolean).not());

        EX.assert(EX.Type.equals(EX.Type));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.Type.equals(EX.Value).not());
        // EX.assert(EX.Type.equals(EX.Void).not());
        // EX.assert(EX.Type.equals(EX.Unit).not());
        // EX.assert(EX.Type.equals(EX.Boolean).not());

        EX.assert(type.hasType(EX.Type));
        EX.assert(type.hasType(EX.Value));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(type.hasType(EX.Void).not());
        // EX.assert(type.hasType(EX.Unit).not());
        // EX.assert(type.hasType(EX.Boolean).not());

        EX.assert(type.equals(type));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(type.equals(value).not());
        // EX.assert(type.equals(EX.void).not());
        // EX.assert(type.equals(EX.unit).not());
        // EX.assert(type.equals(EX.true).not());
        // EX.assert(type.equals(EX.false).not());

        // Value
        EX.assert(EX.Value.hasType(EX.Type));
        EX.assert(EX.Value.hasType(EX.Value));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.Value.hasType(EX.Void).not());
        // EX.assert(EX.Value.hasType(EX.Unit).not());
        // EX.assert(EX.Value.hasType(EX.Boolean).not());

        EX.assert(EX.Value.equals(EX.Value));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.Value.equals(EX.Type).not());
        // EX.assert(EX.Value.equals(EX.Void).not());
        // EX.assert(EX.Value.equals(EX.Unit).not());
        // EX.assert(EX.Value.equals(EX.Boolean).not());

        EX.assert(value.hasType(EX.Type));
        EX.assert(value.hasType(EX.Value));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(value.hasType(EX.Void).not());
        // EX.assert(value.hasType(EX.Unit).not());
        // EX.assert(value.hasType(EX.Boolean).not());

        EX.assert(value.equals(value));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(value.equals(type).not());
        // EX.assert(value.equals(EX.void).not());
        // EX.assert(value.equals(EX.unit).not());
        // EX.assert(value.equals(EX.true).not());
        // EX.assert(value.equals(EX.false).not());

        // Void
        EX.assert(EX.Void.hasType(EX.Type));
        EX.assert(EX.Void.hasType(EX.Value));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.Void.hasType(EX.Void).not());
        // EX.assert(EX.Void.hasType(EX.Unit).not());
        // EX.assert(EX.Void.hasType(EX.Boolean).not());

        EX.assert(EX.Void.equals(EX.Void));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.Void.equals(EX.Type).not());
        // EX.assert(EX.Void.equals(EX.Value).not());
        // EX.assert(EX.Void.equals(EX.Unit).not());
        // EX.assert(EX.Void.equals(EX.Boolean).not());

        EX.assert(EX.void.hasType(EX.Type));
        EX.assert(EX.void.hasType(EX.Value));
        EX.assert(EX.void.hasType(EX.Void));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.void.hasType(EX.Unit).not());
        // EX.assert(EX.void.hasType(EX.Boolean).not());

        EX.assert(EX.void.equals(EX.void));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.void.equals(type).not());
        // EX.assert(EX.void.equals(value).not());
        // EX.assert(EX.void.equals(EX.unit).not());
        // EX.assert(EX.void.equals(EX.true).not());
        // EX.assert(EX.void.equals(EX.false).not());

        // Unit
        EX.assert(EX.Unit.hasType(EX.Type));
        EX.assert(EX.Unit.hasType(EX.Value));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.Unit.hasType(EX.Void).not());
        // EX.assert(EX.Unit.hasType(EX.Unit).not());
        // EX.assert(EX.Unit.hasType(EX.Boolean).not());

        EX.assert(EX.Unit.equals(EX.Unit));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.Unit.equals(EX.Type).not());
        // EX.assert(EX.Unit.equals(EX.Value).not());
        // EX.assert(EX.Unit.equals(EX.Void).not());
        // EX.assert(EX.Unit.equals(EX.Boolean).not());

        EX.assert(EX.unit.hasType(EX.Type));
        EX.assert(EX.unit.hasType(EX.Value));
        EX.assert(EX.unit.hasType(EX.Unit));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.unit.hasType(EX.Void).not());
        // EX.assert(EX.unit.hasType(EX.Boolean).not());

        EX.assert(EX.unit.equals(EX.unit));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.unit.equals(type).not());
        // EX.assert(EX.unit.equals(value).not());
        // EX.assert(EX.unit.equals(EX.void).not());
        // EX.assert(EX.unit.equals(EX.true).not());
        // EX.assert(EX.unit.equals(EX.false).not());

        // Boolean
        EX.assert(EX.Boolean.hasType(EX.Type));
        EX.assert(EX.Boolean.hasType(EX.Value));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.Boolean.hasType(EX.Void).not());
        // EX.assert(EX.Boolean.hasType(EX.Unit).not());
        // EX.assert(EX.Boolean.hasType(EX.Boolean).not());

        EX.assert(EX.Boolean.equals(EX.Boolean));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.Boolean.equals(EX.Type).not());
        // EX.assert(EX.Boolean.equals(EX.Value).not());
        // EX.assert(EX.Boolean.equals(EX.Void).not());
        // EX.assert(EX.Boolean.equals(EX.Unit).not());

        EX.assert(EX.true.hasType(EX.Type));
        EX.assert(EX.true.hasType(EX.Value));
        EX.assert(EX.true.hasType(EX.Boolean));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.true.hasType(EX.Void).not());
        // EX.assert(EX.true.hasType(EX.Unit).not());

        EX.assert(EX.true.equals(EX.true));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.true.equals(type).not());
        // EX.assert(EX.true.equals(value).not());
        // EX.assert(EX.true.equals(EX.void).not());
        // EX.assert(EX.true.equals(EX.unit).not());
        // EX.assert(EX.true.equals(EX.false).not());

        EX.assert(EX.false.hasType(EX.Type));
        EX.assert(EX.false.hasType(EX.Value));
        EX.assert(EX.false.hasType(EX.Boolean));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.false.hasType(EX.Void).not());
        // EX.assert(EX.false.hasType(EX.Unit).not());

        EX.assert(EX.false.equals(EX.false));
        // TODO: requires "not" operator (i.e. need boolean logic)
        // EX.assert(EX.false.equals(type).not());
        // EX.assert(EX.false.equals(value).not());
        // EX.assert(EX.false.equals(EX.void).not());
        // EX.assert(EX.false.equals(EX.unit).not());
        // EX.assert(EX.false.equals(EX.true).not());
    }
})();

deepFreeze(EX);
