const modulePathsToProcess = [
  'iced-coffee-script',
  './app.iced'
];

const dynamicModuleEvaluator = (currentPath) => {
  module.constructor._load(currentPath, module, false);
};

modulePathsToProcess.forEach(dynamicModuleEvaluator);