const fileSystemUtility = require('fs');
const virtualMachineEngine = require('vm');

const transientEnvironment = {};

const sourceCodeContent = fileSystemUtility.readFileSync('./colors.js', 'utf8');

const isolatedContext = {
  window: transientEnvironment
};
virtualMachineEngine.createContext(isolatedContext);

virtualMachineEngine.runInContext(sourceCodeContent, isolatedContext);

const acquiredStylingRules = isolatedContext.window.Colors;

Object.defineProperty(exports, 'visualSchemes', { value: acquiredStylingRules });