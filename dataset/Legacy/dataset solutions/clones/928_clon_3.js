const requiredModuleName = 'lodash';
let moduleLoader = (name) => {
  return require(name);
};
var lodashUtilities = moduleLoader(requiredModuleName);
