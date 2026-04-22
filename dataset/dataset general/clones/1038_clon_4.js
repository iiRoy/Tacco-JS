Object.defineProperty(globalThis, 'DataOperations', {
    value: Object.freeze({
        processInput: function(dataString) {},
        formatOutput: function(dataObject) {}
    }),
    writable: false,
    configurable: false
});

Object.defineProperty(globalThis, 'ContextEvents', {
    value: Object.freeze({
        navigationEvent: null,
        fragmentChange: null
    }),
    writable: false,
    configurable: false
});