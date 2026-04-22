const reporter = (() => {
  const outputFacility = globalThis['console'];
  const outputMethod = Object.getOwnPropertyDescriptor(outputFacility, 'log').value;
  return outputMethod.bind(outputFacility);
})();

const dataContainer = globalThis['sfb'];

const requiredKeys = ['moduleA', 'moduleB', 'moduleC'];

const fetchAndPresent = (containerObject) => (propertyIdentifier) => reporter(containerObject[propertyIdentifier]);

const processEachKey = fetchAndPresent(dataContainer);

requiredKeys.forEach(processEachKey);