const systemEvents = require('events');
const nodeUtils = require('util');
const directoryProtocol = require('ldapjs');
const asyncFlow = require('async');
const utilityKit = require('underscore');
const systemLogger = require('bunyan');

const UserProfile = require('./models/user');
const GroupEntity = require('./models/group');
const AttributeRangeProcessor = require('./client/rangeretrievalspecifierattribute');

let secureCredentialLogging = false;
let maxOutputDisplayLength = 256;

// Initialize the central logging facility for the directory service operations.
const serviceLog = systemLogger.createLogger({
  name: 'DirectoryServiceAgent',
  level: 'info', // Default to info, more verbose logging can be configured.
  streams: [
    {
      level: 'warn', // Only show warnings and errors to stdout by default.
      stream: process.stdout
    }
  ]
});

// Default page size for LDAP search results to handle large datasets.
const defaultSearchResultPageSize = 1000;
// Standard attributes to fetch for user and group objects.
const standardFetchAttributes = {
  user: [
    'userPrincipalName', 'sAMAccountName', 'mail',
    'lockoutTime', 'whenCreated', 'pwdLastSet', 'userAccountControl',
    'employeeID', 'sn', 'givenName', 'initials', 'cn', 'displayName',
    'comment', 'description', 'distinguishedName'
  ],
  group: [
    'objectCategory',
    'distinguishedName',
    'cn',
    'description',
    'member'
  ]
};
// Configuration for handling LDAP referrals (chasing references to other servers).
const referralHandlingSettings = {
  enabled: false, // Referrals are disabled by default for security/performance.
  // Regex patterns for referrals to ignore, typically internal AD partitions.
  exclusionPatterns: [
    'ldaps?://ForestDnsZones\\..*/.*',
    'ldaps?://DomainDnsZones\\..*/.*',
    'ldaps?://.*/CN=Configuration,.*'
  ]
};

// Pre-compiled regular expressions for frequent use in validation and parsing.
const regexCollection = {
  'isFullyQualifiedPath': /(([^=]+=.+),?)+/gi,
  'isUserSchemaObject': /CN=Person,CN=Schema,CN=Configuration,.*/i,
  'isGroupSchemaObject': /CN=Group,CN=Schema,CN=Configuration,.*/i
};

/**
 * Manages interactions with an Active Directory LDAP server for user and group data.
 *
 * @public
 * @constructor
 * @param {Object|String} connectionUrl The LDAP server URL (e.g., 'ldap://ad.example.com'). Can also be an object containing all configuration.
 * @param {String} baseSearchPath The root distinguished name for LDAP queries (e.g., 'dc=example,dc=com').
 * @param {String} bindUserIdentifier The username or DN for authenticating to AD (e.g., 'admin@example.com').
 * @param {String} bindUserSecret The password for the bind user.
 * @param {Object} defaultOptions Overrides for default settings like attributes or referral handling.
 * @returns {DirectoryServiceAgent} An instance of the directory service agent.
 */
const DirectoryServiceAgent = function(connectionUrl, baseSearchPath, bindUserIdentifier, bindUserSecret, defaultOptions) {
  // Enforce constructor usage with 'new' keyword.
  if (!(this instanceof DirectoryServiceAgent)) {
    return new DirectoryServiceAgent(connectionUrl, baseSearchPath, bindUserIdentifier, bindUserSecret, defaultOptions);
  }

  this.configOptions = {}; // Internal storage for all configuration parameters.

  // Parse constructor arguments, supporting both string and object-based configurations.
  if (typeof connectionUrl === 'string') {
    this.configOptions.serverUrl = connectionUrl;
    this.baseDnPath = baseSearchPath;
    this.configOptions.bindDn = bindUserIdentifier;
    this.configOptions.bindCredentials = bindUserSecret;

    // Apply custom entry parser if provided in defaults.
    if (typeof((defaultOptions || {}).entryTransformFn) === 'function') {
      this.configOptions.entryTransformFn = defaultOptions.entryTransformFn;
    }
  } else {
    // Object-based configuration
    this.configOptions = connectionUrl;
    this.baseDnPath = this.configOptions.baseDN;

    // Normalize bind credentials from 'username'/'password' to 'bindDN'/'bindCredentials'.
    if (!this.configOptions.bindDn) {
      this.configOptions.bindDn = this.configOptions.username;
    }
    if (!this.configOptions.bindCredentials) {
      this.configOptions.bindCredentials = this.configOptions.password;
    }

    // Configure logging if specified in the options.
    if (this.configOptions.loggingConfig) {
      serviceLog = systemLogger.createLogger(utilityKit.defaults({}, this.configOptions.loggingConfig));
      delete this.configOptions.loggingConfig; // Remove custom logging config from main options.
    }
  }

  // Merge default attributes with instance-specific and global overrides.
  standardFetchAttributes.user = utilityKit.extend([], standardFetchAttributes.user, (this.configOptions.attributes || {}).user || [], (defaultOptions || {}).attributes || {}.user || []);
  standardFetchAttributes.group = utilityKit.extend([], standardFetchAttributes.group, (this.configOptions.attributes || {}).group || [], (defaultOptions || {}).attributes || {}.group || []);

  // Merge referral handling settings.
  Object.assign(referralHandlingSettings,
    (this.configOptions.referrals || {}),
    (defaultOptions || {}).referrals
  );

  serviceLog.info('Initiating connection to directory service at %s using identity %s.',
    this.configOptions.serverUrl, this.configOptions.bindDn);
  serviceLog.debug('Referral processing is %s. Exclusions: %j',
    referralHandlingSettings.enabled ? 'active' : 'inactive', referralHandlingSettings.exclusionPatterns);
  serviceLog.debug('Default user attributes for retrieval: %j', standardFetchAttributes.user);
  serviceLog.debug('Default group attributes for retrieval: %j', standardFetchAttributes.group);

  // Enable connection pooling for better performance.
  // Note: This might be handled internally by newer ldapjs versions.
  if (this.configOptions.maxConnections === undefined) {
    this.configOptions.maxConnections = 20; // Default pool size.
  }

  // Initialize EventEmitter capabilities for the instance.
  systemEvents.EventEmitter.call(this);
};

// Inherit from EventEmitter to support custom events.
nodeUtils.inherits(DirectoryServiceAgent, systemEvents.EventEmitter);

/**
 * Exposes the ldapjs filter utilities.
 * @static
 */
DirectoryServiceAgent.filters = directoryProtocol.filters;

/**
 * Truncates a given string to a specified maximum length, adding an ellipsis in the middle.
 * Useful for logging sensitive or very long strings without revealing full content.
 * @param {String} inputString The string to potentially truncate.
 * @param {Number} [limitLength] The maximum desired length. Defaults to `maxOutputDisplayLength`.
 * @returns {String} The original or truncated string.
 */
function limitLogStringLength(inputString, limitLength) {
  const effectiveLimit = limitLength === undefined ? maxOutputDisplayLength : limitLength;

  if (!inputString) return inputString;
  const stringToProcess = typeof inputString !== 'string' ? String(inputString) : inputString;
  const currentLength = stringToProcess.length;

  // No truncation needed if shorter than or equal to limit + ellipsis.
  if (currentLength <= effectiveLimit + 3) return stringToProcess;

  const halfLength = Math.floor((effectiveLimit - 3) / 2);
  const start = stringToProcess.substring(0, halfLength);
  const end = stringToProcess.substring(currentLength - halfLength);

  return `${start}...${end}`;
}

/**
 * Checks if there are any active listeners for a specific event on this instance.
 * @param {String} eventName The name of the event to check.
 * @returns {Boolean} True if listeners exist, false otherwise.
 */
function hasRegisteredHandlers(eventName) {
  return systemEvents.EventEmitter.listenerCount(this, eventName) > 0;
}

/**
 * Determines if a given string represents a Distinguished Name (DN).
 * @private
 * @param {String} value The string to evaluate.
 * @returns {Boolean} True if it looks like a DN, false otherwise.
 */
function isDistinguishedNameFormat(value) {
  serviceLog.trace('Checking for DN format: %s', value);
  if (!value || value.length === 0) return false;
  return regexCollection.isFullyQualifiedPath.test(value);
}

/**
 * Escapes special characters in a Distinguished Name for safe use in LDAP queries.
 * Specifically handles commas that are not properly escaped by `ldapjs` currently.
 * @private
 * @param {String} dnString The DN string to escape.
 * @returns {String} The escaped DN string.
 */
function sanitizeDistinguishedName(dnString) {
  serviceLog.trace('Sanitizing DN: %s', dnString);
  if (!dnString) return dnString;

  // Double escape commas that are already escaped, a known issue with ldapjs.
  return dnString.replace(/\\,/g, '\\\\,');
}

/**
 * Constructs an LDAP filter string for searching user objects.
 * @private
 * @param {String} userIdentifier The sAMAccountName, userPrincipalName, or DN of the user.
 * @returns {String} The LDAP filter string.
 */
function buildUserSearchFilter(userIdentifier) {
  serviceLog.trace('Building user search filter for: %s', userIdentifier);
  const currentInstance = this; // Capture 'this' for helper functions.

  if (!userIdentifier) return '(objectCategory=User)'; // Base filter for all users.

  // If the identifier is a DN, construct a specific DN-based filter.
  if (isDistinguishedNameFormat.call(currentInstance, userIdentifier)) {
    return `(&(objectCategory=User)(distinguishedName=${sanitizeDistinguishedName(userIdentifier)}))`;
  }

  // Otherwise, search by sAMAccountName or userPrincipalName.
  return `(&(objectCategory=User)(|(sAMAccountName=${userIdentifier})(userPrincipalName=${userIdentifier})))`;
}

/**
 * Ensures an LDAP filter string is properly wrapped in parentheses for compound queries.
 * @param {String} filterExpression The raw LDAP filter.
 * @returns {String} The normalized LDAP filter with enclosing parentheses.
 */
function normalizeLdapFilter(filterExpression) {
  serviceLog.trace('Normalizing LDAP filter: %s', filterExpression);

  if (!filterExpression) return ''; // Return empty string for falsy input.
  // Check if already wrapped.
  if (filterExpression.startsWith('(') && filterExpression.endsWith(')')) {
    return filterExpression;
  }
  return `(${filterExpression})`;
}

/**
 * Constructs an LDAP filter string for searching group objects.
 * @private
 * @param {String} groupName The name of the group or its DN.
 * @returns {String} The LDAP filter string.
 */
function buildGroupSearchFilter(groupName) {
  serviceLog.trace('Building group search filter for: %s', groupName);
  const currentInstance = this;

  if (!groupName) return '(objectCategory=Group)'; // Base filter for all groups.

  // If the identifier is a DN, construct a specific DN-based filter.
  if (isDistinguishedNameFormat.call(currentInstance, groupName)) {
    return `(&(objectCategory=Group)(distinguishedName=${sanitizeDistinguishedName(groupName)}))`;
  }

  // Otherwise, search by common name (cn).
  return `(&(objectCategory=Group)(cn=${groupName}))`;
}

/**
 * Determines if an LDAP entry object represents a group.
 * @param {Object} entryData The LDAP entry object.
 * @returns {Boolean} True if it's a group, false otherwise.
 */
function isGroupEntry(entryData) {
  serviceLog.trace('Checking if entry is a group: %j', entryData);

  if (!entryData) return false;
  // Check for groupType attribute, which is specific to groups.
  if (entryData.groupType !== undefined) return true;
  // Check objectCategory against known group schema.
  if (entryData.objectCategory) {
    return regexCollection.isGroupSchemaObject.test(entryData.objectCategory);
  }
  // Check objectClass array for 'group'.
  if (Array.isArray(entryData.objectClass) && entryData.objectClass.length > 0) {
    return entryData.objectClass.some(cls => cls.toLowerCase() === 'group');
  }
  return false;
}

/**
 * Determines if an LDAP entry object represents a user.
 * @param {Object} entryData The LDAP entry object.
 * @returns {Boolean} True if it's a user, false otherwise.
 */
function isUserEntry(entryData) {
  serviceLog.trace('Checking if entry is a user: %j', entryData);

  if (!entryData) return false;
  // Check for common user-specific attributes.
  if (entryData.userPrincipalName || entryData.sAMAccountName) return true;
  // Check objectCategory against known user schema.
  if (entryData.objectCategory) {
    return regexCollection.isUserSchemaObject.test(entryData.objectCategory);
  }
  // Check objectClass array for 'user'.
  if (Array.isArray(entryData.objectClass) && entryData.objectClass.length > 0) {
    return entryData.objectClass.some(cls => cls.toLowerCase() === 'user');
  }
  return false;
}

/**
 * Creates and configures an LDAP client instance.
 * @private
 * @param {String} [overrideUrl] An optional URL to use for this client, overriding the instance's default.
 * @returns {directoryProtocol.Client} An LDAP client instance.
 * @throws {Error} If no URL is specified for the client.
 */
function createLdapConnection(overrideUrl) {
  const currentUrl = overrideUrl || this.configOptions.serverUrl;
  if (!currentUrl) {
    throw new Error('No LDAP server URL provided for client creation.');
  }
  serviceLog.trace('Creating LDAP client for: %s', currentUrl);

  // Merge client-specific options with instance defaults.
  const clientConfig = utilityKit.defaults({}, { url: currentUrl }, this.configOptions);
  serviceLog.debug('LDAP client config for %s: %j (excluding credentials)', clientConfig.url,
    utilityKit.omit(clientConfig, 'url', 'bindDn', 'bindCredentials'));

  return directoryProtocol.createClient(clientConfig);
}

/**
 * Checks if a given referral URL is allowed to be followed based on global settings.
 * @param {String} referralUrl The URL of the referral.
 * @returns {Boolean} True if the referral should be followed, false otherwise.
 */
function shouldFollowReferral(referralUrl) {
  serviceLog.trace('Evaluating referral: %j', referralUrl);
  if (!referralHandlingSettings.enabled || !referralUrl) return false;

  // Check if the referral URL matches any of the exclusion patterns.
  return !referralHandlingSettings.exclusionPatterns.some(pattern => {
    const exclusionRegex = new RegExp(pattern, "i");
    return exclusionRegex.test(referralUrl);
  });
}

/**
 * Extracts LDAP-specific options from a generic options object.
 * @param {Object} allOptions The options object to parse.
 * @returns {Object} An object containing only ldapjs client and search options.
 */
function extractLdapjsOptions(allOptions) {
  return utilityKit.pick(allOptions || {},
    // Client configuration properties
    'url', 'host', 'port', 'secure', 'tlsOptions', 'socketPath', 'log',
    'timeout', 'idleTimeout', 'reconnect', 'queue', 'queueSize', 'queueTimeout',
    'queueDisable', 'bindDN', 'bindCredentials',
    // Search operation properties
    'filter', 'scope', 'attributes', 'controls', 'paged', 'sizeLimit',
    'timeLimit', 'typesOnly', 'derefAliases'
  );
}

/**
 * Executes an LDAP search operation.
 *
 * @private
 * @param {String} [searchBaseDn] The optional base DN for the search. If not provided, uses instance's base DN.
 * @param {Object} [searchOptions] LDAP query parameters (e.g., { scope: 'sub', filter: '(objectClass=*)', attributes: ['cn'] }).
 * @param {Function} completionCallback The callback function: `(err, resultsArray)`.
 */
function executeLdapSearch(searchBaseDn, searchOptions, completionCallback) {
  const currentAgent = this; // Reference to the DirectoryServiceAgent instance.

  // Normalize arguments for flexible function signature (baseDN optional).
  if (typeof searchOptions === 'function') {
    completionCallback = searchOptions;
    searchOptions = searchBaseDn;
    searchBaseDn = undefined;
  }
  if (typeof searchBaseDn === 'object') {
    searchOptions = searchBaseDn;
    searchBaseDn = undefined;
  }

  // Ensure searchOptions is an object and set the base DN.
  searchOptions = searchOptions || {};
  searchBaseDn = searchBaseDn || searchOptions.baseDN || currentAgent.baseDnPath;
  serviceLog.trace('Initiating LDAP search with base DN: %s, options: %j', searchBaseDn, searchOptions);

  let searchCompletionFlag = false;
  const activeReferralClients = [];
  let pendingRangeAttributeProcesses = 0;
  const primaryLdapClient = createLdapConnection.call(currentAgent);
  primaryLdapClient.on('error', handlePrimaryClientError);

  const searchResultEntries = [];

  /**
   * Disposes of a referral client and removes it from the active list.
   * @param {directoryProtocol.Client} clientToRemove The referral client to unbind and remove.
   */
  function removeReferralClient(clientToRemove) {
    if (!clientToRemove) return;
    clientToRemove.unbind();
    const clientIndex = activeReferralClients.indexOf(clientToRemove);
    if (clientIndex !== -1) {
      activeReferralClients.splice(clientIndex, 1);
    }
  }

  /**
   * Default or custom function to transform/parse each LDAP entry.
   * @param {Object} entryItem The raw LDAP entry object.
   * @param {Object} rawEntry The original raw ldapjs entry object.
   * @param {Function} transformDoneCallback Callback to signal completion of transformation.
   */
  const entryTransformer = (searchOptions.entryTransformFn || currentAgent.configOptions.entryTransformFn || function defaultEntryParser(item, raw, cb) {
    cb(item); // By default, just pass the item through.
  });

  /**
   * Handler for individual search entries received from the LDAP server.
   * @param {directoryProtocol.SearchEntry} searchEntry The received entry.
   */
  function onSingleSearchEntry(searchEntry) {
    serviceLog.trace('Received search entry: %j', searchEntry);
    const processedObject = searchEntry.object;
    delete processedObject.controls; // Clean up internal controls array.

    // Handle range retrieval attributes, which may require additional queries.
    pendingRangeAttributeProcesses++;
    AttributeRangeProcessor.processAttributes(currentAgent, processedObject, searchOptions, (err, transformedItem) => {
      pendingRangeAttributeProcesses--;

      const finalItem = err ? searchEntry.object : transformedItem; // Use original if transformation fails.
      entryTransformer(finalItem, searchEntry.raw, item => {
        if (item) searchResultEntries.push(item);
        // If all range attributes are processed and primary search is done, finalize.
        if (!pendingRangeAttributeProcesses && searchCompletionFlag) {
          onSearchOperationEnded();
        }
      });
    });
  }

  /**
   * Handler for LDAP search references (referrals). Initiates new searches on referred servers.
   * @param {directoryProtocol.SearchReference} searchReference The received referral.
   */
  function onSearchReferral(searchReference) {
    let uriIndex = 0;
    let referralTargetUri;
    // Iterate through all URIs provided in the referral.
    while ((referralTargetUri = (searchReference.uris || [])[uriIndex++])) {
      if (shouldFollowReferral(referralTargetUri)) {
        serviceLog.debug('Following LDAP referral to: %s', referralTargetUri);
        const referralClient = createLdapConnection.call(currentAgent, referralTargetUri);
        activeReferralClients.push(referralClient);

        referralClient.search(referralClient.url.DN, extractLdapjsOptions(searchOptions), (err, referralResponse) => {
          /**
           * Error handler for a specific referral client.
           * @param {Error} referralError The error encountered.
           */
          function onReferralClientError(referralError) {
            serviceLog.error(referralError, 'Error chasing referral on %s (%j). Error: %s',
              referralClient.url.DN, searchOptions, referralError.message);
            removeReferralClient(referralClient);
          }

          // If the referral search itself fails, log and clean up, but don't stop the main search.
          if (err) {
            onReferralClientError(err);
            return;
          }

          referralResponse.on('searchEntry', onSingleSearchEntry);
          referralResponse.on('searchReference', onSearchReferral);
          referralResponse.on('error', onReferralClientError);
          referralResponse.on('end', () => {
            removeReferralClient(referralClient);
            onSearchOperationEnded(); // Check if all searches (primary + referrals) are done.
          });
        });
      }
    }
  }

  /**
   * Central error handler for the primary LDAP client.
   * @param {Error} clientError The error object.
   */
  function handlePrimaryClientError(clientError) {
    primaryLdapClient.unbind();
    // Special handling for SizeLimitExceededError: return partial results if available.
    if (clientError && clientError.name === 'SizeLimitExceededError') {
      if (completionCallback) completionCallback(clientError, searchResultEntries);
      return;
    }

    serviceLog.error(clientError, 'An error occurred during LDAP search on %s (%j). Error: %s',
      searchBaseDn, searchOptions, clientError ? clientError.message : 'Unknown error');
    if (completionCallback) completionCallback(clientError);
  }

  /**
   * Callback executed when a search operation (primary or referral) completes.
   * Checks if all pending operations are finished before calling the final callback.
   */
  function onSearchOperationEnded() {
    // Only finalize if no pending range attribute processing and no active referral clients.
    if (!pendingRangeAttributeProcesses && activeReferralClients.length === 0) {
      primaryLdapClient.unbind(); // Disconnect the primary client.
      serviceLog.info('LDAP search on %s for filter "%s" completed, found %d entries.',
        searchBaseDn, limitLogStringLength(searchOptions.filter), searchResultEntries.length);
      if (completionCallback) completionCallback(null, searchResultEntries);
    }
  }

  // Prepare search controls.
  const searchControls = searchOptions.controls || (searchOptions.controls = []);

  // Add PagedResultsControl if not already present, enabling pagination.
  if (!searchControls.some(ctrl => ctrl instanceof directoryProtocol.PagedResultsControl)) {
    serviceLog.debug('Adding PagedResultsControl to search on %s with filter "%s" for attributes %j',
      searchBaseDn, limitLogStringLength(searchOptions.filter), searchOptions.attributes || ['*']);
    searchControls.push(new directoryProtocol.PagedResultsControl({ value: { size: defaultSearchResultPageSize } }));
  }

  // Add ShowDeletedOidControl if `includeDeleted` option is true.
  if (searchOptions.includeDeleted) {
    const showDeletedOid = '1.2.840.113556.1.4.417';
    if (!searchControls.some(ctrl => ctrl.type === showDeletedOid)) {
      serviceLog.debug('Adding ShowDeletedOidControl (%s) to search on %s with filter "%s" for attributes %j',
        showDeletedOid, searchBaseDn, limitLogStringLength(searchOptions.filter), searchOptions.attributes || ['*']);
      searchControls.push(new directoryProtocol.Control({ type: showDeletedOid, criticality: true }));
    }
  }

  serviceLog.debug('Executing directory query on %s with filter "%s" for attributes %j',
    searchBaseDn, limitLogStringLength(searchOptions.filter), searchOptions.attributes || ['*']);

  // Perform the actual LDAP search.
  primaryLdapClient.search(searchBaseDn, extractLdapjsOptions(searchOptions), (err, primaryResponse) => {
    if (err) {
      handlePrimaryClientError(err);
      return;
    }

    primaryResponse.on('searchEntry', onSingleSearchEntry);
    primaryResponse.on('searchReference', onSearchReferral);
    primaryResponse.on('error', handlePrimaryClientError);
    primaryResponse.on('end', () => {
      searchCompletionFlag = true; // Mark primary search as completed.
      onSearchOperationEnded(); // Check if all operations (including referrals/ranges) are done.
    });
  });
}