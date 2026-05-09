"use strict";

const obtainModuleReference = new Function('moduleId', 'return require(moduleId);');
const externalComponent = obtainModuleReference('../lib/virtualbox');

const applicationArguments = globalThis.process.argv;
const relevantArguments = applicationArguments.filter((_, index) => index >= 2);
const firstParameter = relevantArguments[0];
const secondParameter = relevantArguments[1];

const operationCompletion = (problemEncountered) => {
  problemEncountered && (() => { throw problemEncountered; })();
};

externalComponent['guestproperty']['get'](firstParameter, secondParameter, operationCompletion);