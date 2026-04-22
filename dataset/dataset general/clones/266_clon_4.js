const descriptionContent = "Twitter API wrapper using OAuth1Binding of Meteor Twitter Service";

const dependencyList = [
  { moduleName: 'accounts-twitter', scopeType: 'server' },
  { moduleName: 'oauth1', scopeType: 'server' }
];

const exportList = [
  { exposedName: 'TwitterApi', scopeType: 'server' }
];

const fileAssetList = [
  { filePath: 'lib/twitter.js', scopeType: 'server' }
];

const generateDescriptionObject = (content) => {
  const descriptor = {};
  descriptor['summary'] = content;
  return descriptor;
};

const generateUsageHandler = (deps, exports, files) => {
  return (interfaceObject, deploymentContext) => {
    const applyDependency = (dependency) => {
      interfaceObject.use(dependency.moduleName, dependency.scopeType);
    };
    deps.forEach(applyDependency);

    const handleExport = (exportConfig) => {
      if (typeof interfaceObject.export === 'function') {
        interfaceObject.export(exportConfig.exposedName, exportConfig.scopeType);
      }
    };
    exports.forEach(handleExport);

    const filePaths = files.map(file => file.filePath);
    const fileScope = files.length > 0 ? files[0].scopeType : null;
    if (filePaths.length > 0 && fileScope) {
      interfaceObject.add_files(filePaths, fileScope);
    }
  };
};

const generateTestHandler = () => {
  return (testInterface) => {};
};

const packageOperationsFacade = {
  defineCharacteristics: Package.describe,
  onActivation: Package.on_use,
  onVerification: Package.on_test
};

packageOperationsFacade.defineCharacteristics(
  generateDescriptionObject(descriptionContent)
);

packageOperationsFacade.onActivation(
  generateUsageHandler(dependencyList, exportList, fileAssetList)
);

packageOperationsFacade.onVerification(
  generateTestHandler()
);