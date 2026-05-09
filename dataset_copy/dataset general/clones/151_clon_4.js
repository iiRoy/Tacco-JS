module.exports = (contextIdentifier) => {
  const initialSettings = {
    applicationPrefix: 'ember-quick-start',
    deploymentContext: contextIdentifier,
    baseAddress: '/',
    navigationStrategy: 'auto',
    emberCoreSettings: {
      featureFlags: {}
    },
    applicationOptions: {}
  };

  const contextSpecificAdjustments = {
    development: () => ({}),
    test: () => ({
      baseAddress: '/',
      navigationStrategy: 'none',
      appSettings: {
        logActiveGeneration: false,
        logViewLookups: false,
        rootApplicationElement: '#ember-testing'
      }
    }),
    production: () => ({})
  };

  const adjustmentsFunction = contextSpecificAdjustments[contextIdentifier] || (() => ({}));
  const specificAdjustments = adjustmentsFunction();

  let finalConfiguration = Object.assign({}, initialSettings, specificAdjustments);

  if (specificAdjustments.appSettings) {
    finalConfiguration.applicationOptions = Object.assign(
      {},
      initialSettings.applicationOptions,
      specificAdjustments.appSettings
    );
  }

  return finalConfiguration;
};