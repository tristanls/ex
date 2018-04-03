ex
==
_from, of, out of, by, according to, on_

A type system implementation.

## Usage

`ex` offers some fundamental `Type` type for constructing other types. In order to construct a new type, one must specify two things for the type: inhabitance and equality.

Inhabitance is determined by the methods on the type constructor's prototype. For example, to determine if an object inhabits `Unit` type, via `this.inhabits(Unit)`, inhabitance check will pass if `this` implements all the methods found on `Unit.prototype`.

To specify inhabitance, one invokes the `EX.Type(prototype)` constructor with the prototype of the new type. For example, the implementation of Void type is:
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
