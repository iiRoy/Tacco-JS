"use strict";

module.exports = new Proxy(function _silentOperation() {}, {
    apply: function(operationTarget, callingContext, inputArguments) {
        // This trap executes no logic and returns undefined,
        // functionally equivalent to an empty function.
    }
});