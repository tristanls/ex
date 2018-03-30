"use strict";

[
    "", "2"
]
.map(mod => require(`./ex${mod}.js`).selfTest() && console.log(`ex${mod}.js OK`));
