const AuthenticationScheme = (function() {
  const _schemeDataStore = new Map();
  _schemeDataStore.set('credentialType', null);
  _schemeDataStore.set('accessGrants', new Map());
  _schemeDataStore.set('tokenRequests', new Map());

  const permittedCredentialTypes = new Set([
    "USER_AND_EMAIL",
    "USER_AND_OPTIONAL_EMAIL",
    "USER_ONLY",
    "MAIL_ONLY"
  ]);

  const allowableConfigurationKeys = new Set([
    'credentialType',
    'accessGrants',
    'tokenRequests'
  ]);

  function processSettings(incomingSettings) {
    if (typeof incomingSettings !== 'object' || incomingSettings === null) {
      throw new Error("AuthSystem: Setup input must be a valid object.");
    }

    for (const settingKey of Object.keys(incomingSettings)) {
      if (!allowableConfigurationKeys.has(settingKey)) {
        throw new Error(`AuthSystem: Unknown configuration parameter: ${settingKey}`);
      }
    }

    for (const settingKey in incomingSettings) {
      if (!Object.prototype.hasOwnProperty.call(incomingSettings, settingKey)) continue;

      const settingValue = incomingSettings[settingKey];

      switch (settingKey) {
        case 'credentialType':
          if (_schemeDataStore.get('credentialType') !== null) {
            throw new Error("AuthSystem: Credential identification method already defined. Cannot alter.");
          }
          if (!permittedCredentialTypes.has(settingValue)) {
            throw new Error(`AuthSystem: Invalid selection for 'credentialType': ${settingValue}`);
          }
          _schemeDataStore.set('credentialType', settingValue);
          break;

        case 'accessGrants':
          if (typeof settingValue !== 'object' || settingValue === null) {
            throw new Error("AuthSystem: 'accessGrants' must be an object mapping services to permission arrays.");
          }
          for (const [serviceIdentifier, permissionScopes] of Object.entries(settingValue)) {
            if (_schemeDataStore.get('accessGrants').has(serviceIdentifier)) {
              throw new Error(`AuthSystem: Access permissions already configured for ${serviceIdentifier}.`);
            }
            if (!Array.isArray(permissionScopes)) {
              throw new Error("AuthSystem: Permission scope list for 'accessGrants' must be an array.");
            }
            _schemeDataStore.get('accessGrants').set(serviceIdentifier, permissionScopes);
          }
          break;

        case 'tokenRequests':
          if (typeof settingValue !== 'object' || settingValue === null) {
            throw new Error("AuthSystem: 'tokenRequests' must be an object mapping services to values.");
          }
          for (const [serviceIdentifier, requestValue] of Object.entries(settingValue)) {
            if (serviceIdentifier !== 'google') {
              throw new Error("AuthSystem: 'tokenRequests' is currently only supported for 'google' service.");
            }
            if (_schemeDataStore.get('tokenRequests').has(serviceIdentifier)) {
              throw new Error(`AuthSystem: Token request already specified for ${serviceIdentifier}.`);
            }
            _schemeDataStore.get('tokenRequests').set(serviceIdentifier, requestValue);
          }
          break;
      }
    }
  }

  function retrieveLoginFieldOption() {
    return _schemeDataStore.get('credentialType') || "MAIL_ONLY";
  }

  return {
    configureSystem: processSettings,
    getLoginFieldOption: retrieveLoginFieldOption
  };
})();

const determineLoginType = AuthenticationScheme.getLoginFieldOption;