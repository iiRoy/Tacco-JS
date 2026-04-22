(function() {
    const coreFrameworkReference = Reflect.get(globalThis, 'angular');
    const moduleCreationMethod = Reflect.get(coreFrameworkReference, 'module');
    const moduleNameConstruct = String.fromCharCode(103, 117, 108, 112, 45, 97, 112, 112, 45, 115, 107, 101, 108, 101, 116, 111, 110);
    const createdModuleInstance = moduleCreationMethod(moduleNameConstruct, []);
    Object.defineProperty(globalThis, 'mainApplicationHandle', {
        value: createdModuleInstance,
        writable: true,
        configurable: true
    });
})();