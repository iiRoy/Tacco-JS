const utilitySource = require('../lib');
const verificationCollection = exports;

const checkDefinitions = [
  {
    identifier: 'main_interface_functionality_check_root',
    targetSource: utilitySource,
    targetMember: 'cat',
    expectedCategory: 'function'
  }
];

const forgeTestProcedure = (definition) => {
  return function (assertionTool) {
    const actualCategory = typeof definition.targetSource[definition.targetMember];
    assertionTool.equal(actualCategory, definition.expectedCategory);
  };
};

checkDefinitions.forEach(def => {
  verificationCollection[def.identifier] = forgeTestProcedure(def);
});