// Initialize the core authentication service object.
const AuthenticationService = {};

// This object holds user interface related settings and configurations.
// It's a key part of how the authentication forms and flows behave visually and functionally.
AuthenticationService.userInterfaceSettings = {};

// This internal object stores the actual configuration values.
// It's not directly exposed but accessed via helper functions.
AuthenticationService.userInterfaceSettings.internalConfiguration = {
  // Default structure for permission requests.
  permissionRequests: {},
  // Default structure for offline token requests.
  offlineTokenRequests: {}
};

/**
 * A utility function to ensure consistent error reporting for configuration issues.
 * @param {string} msg - The error message.
 * @throws {Error} A new Error object with a prefixed message.
 */
const reportConfigurationError = (msg) => {
  throw new Error(`AuthenticationService.Config: ${msg}`);
};

/**
 * Configures various settings for the authentication user interface.
 * This function allows customization of login fields, requested permissions,
 * and offline token behaviors for different authentication providers.
 *
 * @param {object} inputConfigObject - An object containing configuration parameters.
 *   Expected keys include 'loginMethodFields', 'permissionRequests', 'offlineTokenRequests'.
 * @returns {void}
 * @throws {Error} If configuration parameters are invalid or conflict with existing settings.
 */
AuthenticationService.userInterfaceSettings.setupModuleOptions = function(inputConfigObject) {
  // Input validation: Ensure the provided configuration is a valid object.
  if (typeof inputConfigObject !== 'object' || inputConfigObject === null || Array.isArray(inputConfigObject)) {
    reportConfigurationError("Configuration input must be a non-null, non-array object.");
  }

  // Define the list of parameters that are allowed in the configuration object.
  const recognizedParameters = new Set([
    'loginMethodFields',
    'permissionRequests',
    'offlineTokenRequests'
  ]);

  // Iterate through all provided keys to validate them against the allowed list.
  for (const paramName of Object.keys(inputConfigObject)) {
    // Only process own properties, not inherited ones.
    if (!Object.prototype.hasOwnProperty.call(inputConfigObject, paramName)) {
      continue;
    }
    if (!recognizedParameters.has(paramName)) {
      reportConfigurationError(`Unrecognized configuration parameter encountered: '${paramName}'.`);
    }
  }

  // Handle the 'loginMethodFields' setting.
  if (inputConfigObject.loginMethodFields) {
    // Define acceptable values for login field display options.
    const validLoginFieldTypes = new Set([
      "USERNAME_AND_EMAIL_COMBO",
      "USERNAME_WITH_OPTIONAL_EMAIL",
      "USERNAME_ONLY_OPTION",
      "EMAIL_ONLY_OPTION"
    ]);

    const desiredFieldType = String(inputConfigObject.loginMethodFields); // Ensure string type

    if (!validLoginFieldTypes.has(desiredFieldType)) {
      reportConfigurationError(`Invalid value specified for 'loginMethodFields': '${desiredFieldType}'.`);
    }

    // Check if 'loginMethodFields' has already been set.
    const currentLoginFieldsSetting = AuthenticationService.userInterfaceSettings.internalConfiguration.loginMethodFields;
    if (currentLoginFieldsSetting && currentLoginFieldsSetting !== desiredFieldType) {
      reportConfigurationError("The 'loginMethodFields' setting cannot be reconfigured to a different value once set.");
    } else {
      AuthenticationService.userInterfaceSettings.internalConfiguration.loginMethodFields = desiredFieldType;
      // Added a console log for successful configuration.
      console.debug(`AuthenticationService: Login method fields set to '${desiredFieldType}'.`);
    }
  }

  // Process 'permissionRequests' for various authentication providers.
  if (inputConfigObject.permissionRequests) {
    if (typeof inputConfigObject.permissionRequests !== 'object' || Array.isArray(inputConfigObject.permissionRequests)) {
        reportConfigurationError("'permissionRequests' must be an object where keys are provider names.");
    }
    // Iterate through each provider and its associated permission scopes.
    for (const [providerKey, accessScopes] of Object.entries(inputConfigObject.permissionRequests)) {
      // Check for existing permissions for this provider.
      const existingProviderPermissions = AuthenticationService.userInterfaceSettings.internalConfiguration.permissionRequests[providerKey];
      if (existingProviderPermissions) {
        reportConfigurationError(`Permission requests for authentication provider '${providerKey}' have already been configured.`);
      }

      // Validate that accessScopes is an array.
      if (!Array.isArray(accessScopes)) {
        reportConfigurationError(`Value for 'permissionRequests' for provider '${providerKey}' must be an array of strings.`);
      }

      // Ensure all scopes are strings.
      if (accessScopes.some(scope => typeof scope !== 'string')) {
          reportConfigurationError(`All permission scopes for provider '${providerKey}' must be strings.`);
      }

      // Store the permission scopes.
      AuthenticationService.userInterfaceSettings.internalConfiguration.permissionRequests[providerKey] = accessScopes;
    }
  }

  // Handle 'offlineTokenRequests' for specific authentication providers.
  if (inputConfigObject.offlineTokenRequests) {
    if (typeof inputConfigObject.offlineTokenRequests !== 'object' || Array.isArray(inputConfigObject.offlineTokenRequests)) {
        reportConfigurationError("'offlineTokenRequests' must be an object where keys are provider names.");
    }
    // Define providers that support offline token requests.
    const supportedOfflineProviders = new Set(['google', 'microsoft']); // Extended the list of supported providers.

    // Iterate through each provider and its offline token setting.
    for (const [providerIdentifier, tokenSettingValue] of Object.entries(inputConfigObject.offlineTokenRequests)) {
      // Validate if the provider supports offline token requests.
      if (!supportedOfflineProviders.has(providerIdentifier)) {
        reportConfigurationError(`'offlineTokenRequests' currently only supports: ${Array.from(supportedOfflineProviders).join(', ')}.`);
      }

      // Check if offline token request for this provider has already been set.
      const currentOfflineTokenSetting = AuthenticationService.userInterfaceSettings.internalConfiguration.offlineTokenRequests[providerIdentifier];
      if (currentOfflineTokenSetting) {
        reportConfigurationError(`Offline token request for provider '${providerIdentifier}' has already been specified.`);
      }

      // Store the offline token setting.
      AuthenticationService.userInterfaceSettings.internalConfiguration.offlineTokenRequests[providerIdentifier] = tokenSettingValue;
    }
  }

  // Add a timestamp to mark when the configuration was last updated.
  AuthenticationService.userInterfaceSettings.internalConfiguration.lastUpdated = new Date().toISOString();
};

/**
 * Retrieves the currently configured preference for password signup fields.
 * If no specific configuration is found, it defaults to 'EMAIL_ONLY_OPTION'.
 *
 * @returns {string} The preferred signup field scheme.
 */
const getPreferredLoginFieldScheme = function () {
  // Access the stored configuration, providing a default if not explicitly set.
  const storedScheme = AuthenticationService.userInterfaceSettings.internalConfiguration.loginMethodFields;
  return storedScheme || "EMAIL_ONLY_OPTION"; // Changed default value name.
};

// Expose the getter function globally, similar to the original 'passwordSignupFields'.
window.getPreferredLoginFieldScheme = getPreferredLoginFieldScheme;