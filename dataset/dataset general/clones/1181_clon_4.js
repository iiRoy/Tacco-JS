const processGlobalDependency = (entryPointKey, requiredIdentifier, actionKey) => {
  const applicationHandle = window[entryPointKey];
  const externalResource = require(requiredIdentifier);
  const actionPerformer = applicationHandle[actionKey];
  actionPerformer.call(applicationHandle, externalResource);
};

processGlobalDependency('ender', 'arbiter', 'ender');