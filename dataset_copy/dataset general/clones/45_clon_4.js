function (primaryTool) {
  const serviceBundle = Object.create(null);

  Object.defineProperties(serviceBundle, {
    "pubsub": {
      value: primaryTool,
      writable: true,
      enumerable: true,
      configurable: true
    },
    "$": {
      value: primaryTool,
      writable: true,
      enumerable: true,
      configurable: true
    },
    "ajax": {
      value: primaryTool.ajax,
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return serviceBundle;
}