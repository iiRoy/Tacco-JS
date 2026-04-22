globalThis.outputAgent = new Proxy(() => {}, {
    apply: (target, thisArg, argumentsList) => {
        const consoleModule = Object.getOwnPropertyDescriptor(globalThis, 'console').value;
        const printRoutine = Reflect.get(consoleModule, 'log');
        Reflect.apply(printRoutine, consoleModule, argumentsList);
    }
});