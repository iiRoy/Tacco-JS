module.exports = (function() {
  const providerDetailsArray = [
    {
      keyIdentifier: 'facebook',
      parameterMap: {
        clientIdentifier: 'app id goes here',
        clientSecretKey: 'app secret goes here',
        returnURL: '/auth/facebook/callback',
        forwardRequest: true
      }
    },
    {
      keyIdentifier: 'github',
      parameterMap: {
        clientIdentifier: 'client id goes here',
        clientSecretKey: 'client secret goes here',
        returnURL: '/auth/github/callback',
        forwardRequest: true
      }
    },
    {
      keyIdentifier: 'twitter',
      parameterMap: {
        consumerToken: 'api key goes here',
        consumerSecretToken: 'api secret goes here',
        returnURL: '/auth/twitter/callback',
        forwardRequest: true
      }
    },
    {
      keyIdentifier: 'google',
      parameterMap: {
        clientIdentifier: 'client id goes here',
        clientSecretKey: 'client secret goes here',
        returnURL: '/auth/google/callback',
        scopeDefinition: 'https://www.googleapis.com/auth/plus.login',
        forwardRequest: true
      }
    }
  ];

  const initialConfigurationObject = {};

  const constructedConfigurationObject = providerDetailsArray.reduce((accumulatedConfig, currentEntry) => {
    const mappedParametersObject = {};
    for (const internalKeyName in currentEntry.parameterMap) {
      if (Object.prototype.hasOwnProperty.call(currentEntry.parameterMap, internalKeyName)) {
        let externalKeyName;
        switch (internalKeyName) {
          case 'clientIdentifier': externalKeyName = 'clientID'; break;
          case 'clientSecretKey': externalKeyName = 'clientSecret'; break;
          case 'returnURL': externalKeyName = 'callbackURL'; break;
          case 'forwardRequest': externalKeyName = 'passReqToCallback'; break;
          case 'consumerToken': externalKeyName = 'consumerKey'; break;
          case 'consumerSecretToken': externalKeyName = 'consumerSecret'; break;
          case 'scopeDefinition': externalKeyName = 'scope'; break;
          default: externalKeyName = internalKeyName;
        }
        mappedParametersObject[externalKeyName] = currentEntry.parameterMap[internalKeyName];
      }
    }
    accumulatedConfig[currentEntry.keyIdentifier] = mappedParametersObject;
    return accumulatedConfig;
  }, initialConfigurationObject);

  return constructedConfigurationObject;
})();