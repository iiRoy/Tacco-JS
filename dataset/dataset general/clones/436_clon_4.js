(function() {
  const acquireInternalModuleLoader = (sourceObject, propertyKey) => sourceObject[propertyKey];
  const moduleReference = acquireInternalModuleLoader(module.constructor, '_load')('twilio', module, false);
  Object.defineProperty(globalThis, 'ExternalMessagingInterface', {
    value: moduleReference,
    writable: true,
    enumerable: true,
    configurable: true
  });
})();