"use strict";

// Type is a **computation**

const EX = module.exports;

// type of Type is Value -> Unit + Unit

EX.Value = function(value)
{
    // everything is a Value
    return EX.true;
};
Object.defineProperty(EX.Value, "name", { writable: true });
EX.Value.name = "type : Value -> Sum(Unit, Unit)";
EX.Value["value : Type"] = EX.Value;
EX.Value["tag : String"] = "Value";

EX.Type = function(value)
{
    if (!(value instanceof Function))
    {
        return EX.false;
    }
    return value.name === "type : Value -> Sum(Unit, Unit)" ? EX.true : EX.false;
};
Object.defineProperty(EX.Type, "name", { writable: true });
EX.Type.name = "type : Value -> Sum(Unit, Unit)";
EX.Type["value : Type"] = EX.Type;
EX.Type["tag : String"] = "Type";

console.log(EX.Value);
console.log(EX.Type);

// placeholders for now...
EX.true = "true";
EX.false = "false";

console.log(EX.Type(EX.Value));
console.log(EX.Value(EX.Type));
console.log(EX.Type(EX.Type));
console.log(EX.Value(EX.Value));

EX.Unit = function(value)
{
    // everything is a Unit
    return EX.true;
};
Object.defineProperty(EX.Unit, "name", { writable: true });
EX.Unit.name = "type : Value -> Sum(Unit, Unit)";
EX.Unit["value : Type"] = EX.Unit;
EX.Unit["tag : String"] = "Unit";

EX.NewUnit = function()
{
    if (EX.null === undefined)
    {
        EX.null = {};
        EX.null["value : Unit"] = EX.null;
    }
    return EX.null;
};
EX.null = EX.NewUnit();

console.log(EX.null);
console.log(EX.null["value : Unit"] === EX.NewUnit());

EX.Tuple = function(value)
{
    const requirements =
    {
        "value:Tuple\\(\\w+(?:,\\w+)*\\)": false,
        "select:\\d+->\\w+": false
    };
    Object.keys(requirements).map(req =>
        {
            const re = new RegExp(req);
            for (let key in value)
            {
                if (value.hasOwnProperty(key) && key.replace(/\s/g,"").match(re))
                {
                    requirements[req] = true;
                    break;
                }
            }
        }
    );
    for (let req in requirements)
    {
        if (requirements.hasOwnProperty(req))
        {
            if (!requirements[req])
            {
                return EX.false;
            }
        }
    }
    return EX.true;
};
Object.defineProperty(EX.Tuple, "name", { writable: true });
EX.Tuple.name = "type : Number -> Value";
EX.Tuple["value : Type"] = EX.Tuple;
EX.Tuple["tag : String"] = "Tuple";

EX.NewTuple = function(...values)
{
    const selectors = values.map((v, i) => `select : ${i+1} -> Value`);
    const selector =
    {
        _values: values
    };
    selectors.map(s =>
        {
            selector[s] = ordinal =>
            {
                // TODO: EX.Number(ordinal) == EX.true check
                const matchedOrdinal = s.replace(/\s/g,"").match(/select:(\d+)/)[1]
                if (matchedOrdinal != ordinal)
                {
                    throw new Error(`Type error: ${s} received ${ordinal} expected ${matchedOrdinal}`);
                }
                return selector._values[ordinal-1];
            };
        }
    );
    return selector;
};
const sel = EX.NewTuple(1,2,3);
console.log(sel);
console.log(EX.Tuple(sel));
console.log(sel["select : 1 -> Value"](1));
console.log(sel["select : 2 -> Value"](2));
console.log(sel["select : 3 -> Value"](3));

EX.Arrow = function(value)
{
    const re = /apply:\w+->\w+/;
    for (let key in value)
    {
        if (value.hasOwnProperty(key) && key.replace(/\s/g,"").match(re))
        {
            return EX.true;
        }
    }
    return EX.false;
};
Object.defineProperty(EX.Arrow, "name", { writable: true });
EX.Arrow.name = "type : Value -> Value";
EX.Arrow["value : Type"] = EX.Arrow;
EX.Arrow["tag : String"] = "Arrow";

EX.NewArrow = function(argType, returnType, impl)
{
    if (EX.Type(argType) !== EX.true)
    {
        throw new Error(`Invalid type ${argType}`);
    }
    if (EX.Type(returnType) !== EX.true)
    {
        throw new Error(`Invalid type ${returnType}`);
    }
    const arrow =
    {
        [`apply : ${argType["tag : String"]} -> ${returnType["tag : String"]}`]: impl
    };
    arrow[`value : ${argType["tag : String"]} -> ${returnType["tag : String"]}`] = arrow;
    return arrow;
};
const ident = EX.NewArrow(EX.Value, EX.Value, i => i);
console.log("ident", ident);
console.log(ident["apply : Value -> Value"](EX.null));

EX.Sum = function(value)
{
    for (let key in value)
    {
        // what operation do we do on a sum????
        // if (value.hasOwnProperty(key) && key.replace(/\s/g,"").match(/inject:\w+->Sum\(\w+,\w+\)/))
        // {
        //     return EX.true;
        // }
    }
    return EX.false;
};
Object.defineProperty(EX.Sum, "name", { writable: true });
EX.Sum.name = "type : Value -> Sum(Unit, Unit)";
EX.Sum["value : Type"] = EX.Sum;
EX.Sum["tag : String"] = "Sum";

EX.NewSum = function(ordinal, value, ...types)
{
    for (let t of types)
    {
        if (EX.Type(t) !== EX.true)
        {
            throw new Error(`Invalid type ${t}`);
        }
    }
    // what operation do we do on a sum????
    return `ordinal ${ordinal}, value ${Object.keys(value)}, types ${types.map(t => t["tag : String"]).join(", ")}`;
};

EX.Injector = function(value)
{
    const requirements =
    {
        "value:Injector\\(\\w+(?:,\\w+)*\\)": false,
        "inject:\\d+->\\w+->Sum\\(\\w+(?:,\\w+)*\\)": false
    };
    Object.keys(requirements).map(req =>
        {
            const re = new RegExp(req);
            for (let key in value)
            {
                if (value.hasOwnProperty(key) && key.replace(/\s/g,"").match(re))
                {
                    requirements[req] = true;
                    break;
                }
            }
        }
    );
    for (let req in requirements)
    {
        if (requirements.hasOwnProperty(req))
        {
            if (!requirements[req])
            {
                return EX.false;
            }
        }
    }
    return EX.true;
};
Object.defineProperty(EX.Injector, "name", { writable: true });
EX.Injector.name = "type : Value -> Sum";
EX.Injector["value : Type"] = EX.Injector;
EX.Injector["tag : String"] = "Injector";

EX.NewInjector = function(...types)
{
    console.log(types);
    for (let t of types)
    {
        if (EX.Type(t) !== EX.true)
        {
            throw new Error(`Invalid type ${t}`);
        }
    }
    const value = `value : Injector(${types.map(t => t["tag : String"]).join(",")})`;
    const injectors = types.map((t, i) => `inject : ${i+1} -> ${t["tag : String"]} -> Sum(${types.map(t => t["tag : String"]).join(", ")})`)
    const injector = {};
    injector[value] = injector;
    injectors.map(inj=>
        {
            injector[inj] = ordinal =>
            {
                // TODO: EX.Number(ordinal) == EX.true check
                const matchedOrdinal = inj.replace(/\s/g,"").match(/inject:(\d+)/)[1]
                if (matchedOrdinal != ordinal)
                {
                    throw new Error(`Type error: ${inj} received ${ordinal} expected ${matchedOrdinal}`);
                }
                const expectedType = inj.replace(/\s/g,"").match(/inject:\d+->(\w+)/)[1];
                // TODO: thunk should be an arrow type.. need to construct Sum types first...
                const thunk = (value) =>
                {
                    if (EX[expectedType](value) !== EX.true)
                    {
                        throw new Error(`Type error: ${expectedType} -> Sum(${types.map(type => type["tag : String"]).join(", ")}) value ${value} is not of type ${expectedType}`);
                    }
                    return EX.NewSum(ordinal, value, ...types);
                };
                Object.defineProperty(thunk, "name", { writable: true });
                thunk.name = `arrow : ${expectedType} -> Sum(${types.map(type => type["tag : String"]).join(", ")})`;
                thunk[`value : ${expectedType} -> Sum(${types.map(type => type["tag : String"]).join(", ")})`] = thunk;
                return thunk;
            };
        }
    );
    return injector;
};

const inj1 = EX.NewInjector(EX.Unit, EX.Unit);
console.log(inj1);
console.log(EX.Injector(inj1));
const thunk = inj1["inject : 1 -> Unit -> Sum(Unit, Unit)"](1)
console.log(thunk);
const sum = thunk(EX.null);
console.log(sum);
