ex
==
_from, of, out of, by, according to, on_

A type system implementation.

## Usage

`ex` offers a built-in `Type` type for constructing other types. In order to construct a new type, one must specify two things for the type: inhabitance and equality.

Inhabitance is determined by the methods on the type constructor's prototype. For example, to determine if an object inhabits `Unit` type, via `this.inhabits(Unit)`, inhabitance check will pass if `this` implements all the methods found on `Unit.prototype`. The `this.inhabits(that)` method is inherited from the prototype of `Type` type.

To specify inhabitance, one invokes the `Type(prototype)` constructor with the prototype of the new type. For example, the implementation of Void type is:
```javascript
EX.Void = EX.Type(Object.assign({},
    EX.Type.prototype,
    {
        constructor: function Void()
        {
            throw new Error("Void type has no inhabitants");
        }
    }
));
```
An implementation of Unit type could be:
```javascript
EX.Unit = EX.Type(Object.assign({},
    EX.Type.prototype,
    {
        constructor: function Unit()
        {
            if (!(this instanceof Unit))
            {
                return new Unit();
            }
            this._value = null;
        }
    }
));
```

Equality is determined by the property `this._value`. An object `this` is equal to another (`that`) if it is precisely the same object (`this === that`), or if `that` inhabits `this.constructor` type, and `this_value` object recursively equals `that._value` object.

To specify desired equality, one configures the value of `this._value` within the `prototype.constructor` method of the prototype provided to the `Type(prototype)` constructor on new type creation. The `this.equals(that)` method is inherited from the prototype of `Value` type.
