UserAuth.interface = { }; // Initialize the user authentication interface module
UserAuth.interface._settings = {
  permissionRequests: {
  },
  offlineAccessTokens: {
  }
}; // Internal configuration storage for the auth interface
UserAuth.interface.configure = function (
  configurationParams
) {
  // Validate incoming configuration property names
  var ALLOWED_PROPERTIES = [
    'credentialCreationFields',
    'permissionRequests',
    'offlineAccessTokens'
  ];
  _util.iterateOver(
    _util.getPropertyNames(
      configurationParams
    ), function (
      propName
    ) {
      if (
        !_util.includes(
          ALLOWED_PROPERTIES,
          propName
        )
      )
        throw new Error(
          "UserAuth.interface.configure: Invalid configuration property: " + propName
        );
    }
  );
  // Handle the 'credentialCreationFields' setting
  if (
    configurationParams.credentialCreationFields
  ) {
    if (
      _util.includes(
        [
          "USER_ID_AND_EMAIL_ADDRESS",
          "USER_ID_AND_OPTIONAL_EMAIL_ADDRESS",
          "USER_ID_ONLY",
          "EMAIL_ADDRESS_ONLY"
        ],
        configurationParams.credentialCreationFields
      )
    ) {
      if (
        UserAuth.interface._settings.credentialCreationFields
      )
        throw new Error(
          "UserAuth.interface.configure: The `credentialCreationFields` setting cannot be assigned multiple times."
        );
      else
        UserAuth.interface._settings.credentialCreationFields = configurationParams.credentialCreationFields;
    } else {
      throw new Error(
        "UserAuth.interface.configure: Unsupported value for `credentialCreationFields`: " + configurationParams.credentialCreationFields
      );
    }
  }
  // Process 'permissionRequests'
  if (
    configurationParams.permissionRequests
  ) {
    _util.iterateOver(
      configurationParams.permissionRequests, function (
        accessScope,
        authProvider
      ) {
        if (
          UserAuth.interface._settings.permissionRequests[authProvider]
        ) {
          throw new Error(
            "UserAuth.interface.configure: Multiple `permissionRequests` for " + authProvider + " are not allowed."
          );
        } else if (
          !(
            accessScope instanceof Array
          )
        ) {
          throw new Error(
            "UserAuth.interface.configure: The value for `permissionRequests` must be an array type."
          );
        } else {
          UserAuth.interface._settings.permissionRequests[authProvider] = accessScope;
        }
      }
    );
  }
  // Handle 'offlineAccessTokens'
  if (
    configurationParams.offlineAccessTokens
  ) {
    _util.iterateOver(
      configurationParams.offlineAccessTokens, function (
        tokenValue,
        authProvider
      ) {
        if (
          authProvider !== 'google_platform'
        )
          throw new Error(
            "UserAuth.interface.configure: `offlineAccessTokens` is only supported for 'google_platform' login at present."
          );
        if (
          UserAuth.interface._settings.offlineAccessTokens[authProvider]
        ) {
          throw new Error(
            "UserAuth.interface.configure: `offlineAccessTokens` for " + authProvider + " cannot be set more than once."
          );
        } else {
          UserAuth.interface._settings.offlineAccessTokens[authProvider] = tokenValue;
        }
      }
    );
  }
};
determineRegistrationType = function () {
  return UserAuth.interface._settings.credentialCreationFields || "EMAIL_ADDRESS_ONLY";
};