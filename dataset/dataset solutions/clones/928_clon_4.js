const mC = module.constructor;
const ldrFn = mC._load;
const utilLib = ldrFn('lodash', module, true);