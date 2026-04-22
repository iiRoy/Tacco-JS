const eventEmitterCore = require('events');
const utilityHelpers = require('util');
const ldapConnector = require('ldapjs');
const logWriter = require('bunyan');

const PersonRecord = require('./models/user');
const GroupRecord = require('./models/group');

// Placeholder for the external module RangeRetrievalSpecifierAttribute
// In a real scenario, this would be `require('./client/rangeretrievalspecifierattribute')`
// and its internal methods would be implemented to match the new async/await style.
const rangeAttributeProcessor = {
  // This function replaces the implicit 'parseRangeAttributes' used in the original.
  // It's assumed to be an async function that handles range attribute retrieval.
  async processEntryRanges(entryData, querySettings) {
    // For a Type IV clone, we assume this dependency is also refactored to be async.
    // The actual implementation would involve making additional LDAP calls if ranges are present.
    // For this example, we'll just return the entry as is, simulating no range attributes or
    // that they've been processed successfully.
    return Promise.resolve(entryData);
  }
};

let credentialDisplayRestricted = false;
let maxLoglineLength = 256;

const appLogger = logWriter.createLogger({
  appName: 'DirectoryService',
  outputStreams: [
    { level: 'fatal',
      target: process.stdout }
  ]
});

let standardPageQuantity = 1000;
let standardAttributes = {
  person: [
    'userPrincipalName', 'sAMAccountName', /*'objectSID',*/ 'mail',
    'lockoutTime', 'whenCreated', 'pwdLastSet', 'userAccountControl',
    'employeeID', 'sn', 'givenName', 'initials', 'cn', 'displayName',
    'comment', 'description'
  ],
  group: [
    'objectCategory',
    'distinguishedName',
    'cn',
    'description',
    'member'
  ]
};
let standardReferralRules = {
  enabled: false,
  exclusionList: [
    'ldaps?://ForestDnsZones\\..*/.*',
    'ldaps?://DomainDnsZones\\..*/.*',
    'ldaps?://.*/CN=Configuration,.*'
  ]
};

const patternRegistry = {
  distinguishedNameCheck: /(([^=]+=.+),?)+/gi,
  personEntryCheck: /CN=Person,CN=Schema,CN=Configuration,.*/i,
  groupEntryCheck: /CN=Group,CN=Schema,CN=Configuration,.*/i
};

// --- Custom Utility Functions (replacing underscore, util, etc.) ---

const mergeWithDefaults = (target, ...sources) => {
  return Object.assign({}, target, ...sources);
};

const deepMerge = (target, ...sources) => {
  return Object.assign({}, target, ...sources);
};

const filterObjectKeys = (source, keysToKeep) => {
  return keysToKeep.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      acc[key] = source[key];
    }
    return acc;
  }, {});
};

const checkAny = (collection, predicate) => {
  return Array.isArray(collection) && collection.some(predicate);
};

const removeObjectKeys = (source, keysToRemove) => {
  const newObj = {};
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key) && !keysToRemove.includes(key)) {
      newObj[key] = source[key];
    }
  }
  return newObj;
};

// --- Core Logic Functions ---

function shortenLogEntry(content, lengthLimit) {
  const limit = typeof lengthLimit === 'undefined' ? maxLoglineLength : lengthLimit;
  if (!content) return content;
  const asString = typeof content !== 'string' ? content.toString() : content;
  const currentLength = asString.length;
  if ((!currentLength) || (currentLength < (limit + 3))) return asString;
  const prefixLen = Math.ceil((limit - 3) / 2);
  const suffixLen = Math.floor((limit - 3) / 2);
  return asString.substring(0, prefixLen) + '...' +
         asString.substring(currentLength - suffixLen);
}

function isValidDistinguishedName(valueToInspect) {
  appLogger.trace('isValidDistinguishedName(%s)', valueToInspect);
  if (!valueToInspect || valueToInspect.length === 0) return false;
  // Reset regex lastIndex for global patterns
  patternRegistry.distinguishedNameCheck.lastIndex = 0;
  return patternRegistry.distinguishedNameCheck.test(valueToInspect);
}

function formatDistinguishedName(nameToParse) {
  appLogger.trace('formatDistinguishedName(%s)', nameToParse);
  if (!nameToParse) return nameToParse;
  return nameToParse.replace('\\,', '\\\\,');
}

function createUserQueryPredicate(accountIdentifier) {
  appLogger.trace('createUserQueryPredicate(%s)', accountIdentifier);
  const currentContext = this;
  if (!accountIdentifier) return '(objectCategory=User)';
  if (isValidDistinguishedName.call(currentContext, accountIdentifier)) {
    return `(&(objectCategory=User)(distinguishedName=${formatDistinguishedName(accountIdentifier)}))`;
  }
  return `(&(objectCategory=User)(|(sAMAccountName=${accountIdentifier})(userPrincipalName=${accountIdentifier})))`;
}

function encloseLdapPredicate(predicateExpression) {
  appLogger.trace('encloseLdapPredicate(%s)', predicateExpression);
  if (!predicateExpression) return false;
  if (predicateExpression.startsWith('(') && predicateExpression.endsWith(')')) {
    return predicateExpression;
  }
  return `(${predicateExpression})`;
}

function createGroupQueryPredicate(groupIdentifier) {
  appLogger.trace('createGroupQueryPredicate(%s)', groupIdentifier);
  const currentContext = this;
  if (!groupIdentifier) return '(objectCategory=Group)';
  if (isValidDistinguishedName.call(currentContext, groupIdentifier)) {
    return `(&(objectCategory=Group)(distinguishedName=${formatDistinguishedName(groupIdentifier)}))`;
  }
  return `(&(objectCategory=Group)(cn=${groupIdentifier}))`;
}

function isGroupEntry(dataItem) {
  appLogger.trace('isGroupEntry(%j)', dataItem);
  if (!dataItem) return false;
  if (dataItem.groupType) return true;
  if (dataItem.objectCategory) {
    patternRegistry.groupEntryCheck.lastIndex = 0;
    return patternRegistry.groupEntryCheck.test(dataItem.objectCategory);
  }
  if (dataItem.objectClass && dataItem.objectClass.length > 0) {
    return checkAny(dataItem.objectClass, (c) => c.toLowerCase() === 'group');
  }
  return false;
}

function isPersonEntry(dataItem) {
  appLogger.trace('isPersonEntry(%j)', dataItem);
  if (!dataItem) return false;
  if (dataItem.userPrincipalName) return true;
  if (dataItem.sAMAccountName) return true;
  if (dataItem.objectCategory) {
    patternRegistry.personEntryCheck.lastIndex = 0;
    return patternRegistry.personEntryCheck.test(dataItem.objectCategory);
  }
  if (dataItem.objectClass && dataItem.objectClass.length > 0) {
    return checkAny(dataItem.objectClass, (c) => c.toLowerCase() === 'user');
  }
  return false;
}

function establishConnection(connectionUrl) {
  connectionUrl = connectionUrl || this.connectionSettings.serviceUrl;
  if (!connectionUrl) {
    throw new Error('No connection URL specified for directory agent.');
  }
  appLogger.trace('establishConnection(%s)', connectionUrl);

  const connectionOptions = deepMerge({}, { url: connectionUrl }, this.connectionSettings);
  appLogger.debug('Creating ldap client for %s. Options: %j', connectionOptions.url, removeObjectKeys(connectionOptions, ['url', 'bindDN', 'bindCredentials']));
  const clientInstance = ldapConnector.createClient(connectionOptions);
  return clientInstance;
}

function canFollowReferral(referralLink) {
  appLogger.trace('canFollowReferral(%j)', referralLink);
  if (!standardReferralRules.enabled) return false;
  if (!referralLink) return false;

  return !checkAny(standardReferralRules.exclusionList, (exclusionPattern) => {
    const exclusionRegex = new RegExp(exclusionPattern, "i");
    return exclusionRegex.test(referralLink);
  });
}

function extractLdapOptions(optionsContainer) {
  const allowedKeys = [
    'url', 'host', 'port', 'secure', 'tlsOptions',
    'socketPath', 'log', 'timeout', 'idleTimeout',
    'reconnect', 'queue', 'queueSize', 'queueTimeout',
    'queueDisable', 'bindDN', 'bindCredentials',
    'filter', 'scope', 'attributes', 'controls',
    'paged', 'sizeLimit', 'timeLimit', 'typesOnly',
    'derefAliases'
  ];
  return filterObjectKeys(optionsContainer || {}, allowedKeys);
}

// --- Main Service Factory ---

function createDirectoryService(serviceUrl, baseLocation, accountId, secret, configOverrides) {
  const serviceInstance = new eventEmitterCore.EventEmitter();
  serviceInstance.connectionSettings = {};

  if (typeof serviceUrl === 'string') {
    serviceInstance.connectionSettings.serviceUrl = serviceUrl;
    serviceInstance.baseSearchLocation = baseLocation;
    serviceInstance.connectionSettings.bindDN = accountId;
    serviceInstance.connectionSettings.bindCredentials = secret;

    if (typeof((configOverrides || {}).entryTransform) === 'function') {
      serviceInstance.connectionSettings.entryTransform = configOverrides.entryTransform;
    }
  } else {
    serviceInstance.connectionSettings = serviceUrl;
    serviceInstance.baseSearchLocation = serviceInstance.connectionSettings.baseDN;

    if (!serviceInstance.connectionSettings.bindDN) serviceInstance.connectionSettings.bindDN = serviceInstance.connectionSettings.username;
    if (!serviceInstance.connectionSettings.bindCredentials) serviceInstance.connectionSettings.bindCredentials = serviceInstance.connectionSettings.password;

    if (serviceInstance.connectionSettings.logging) {
      // Reconfigure the global logger instance.
      Object.assign(appLogger, logWriter.createLogger(mergeWithDefaults({}, serviceInstance.connectionSettings.logging)));
      delete serviceInstance.connectionSettings.logging;
    }
  }

  standardAttributes = deepMerge({}, standardAttributes, (serviceInstance.connectionSettings || {}).attributes || {}, (configOverrides || {}).attributes || {});
  standardReferralRules = deepMerge({}, standardReferralRules, (serviceInstance.connectionSettings || {}).referrals || {}, (configOverrides || {}).referrals || {});

  appLogger.info('Using credentials (%s/%s) to connect to directory (%s).', serviceInstance.connectionSettings.bindDN,
    credentialDisplayRestricted ? '********' : serviceInstance.connectionSettings.bindCredentials, serviceInstance.connectionSettings.serviceUrl);
  appLogger.info('Referral following is %s', standardReferralRules.enabled ? 'active. Exclusions: ' + JSON.stringify(standardReferralRules.exclusionList) : 'inactive');
  appLogger.info('Default person attributes: %j', standardAttributes.person || []);
  appLogger.info('Default group attributes: %j', standardAttributes.group || []);

  if (typeof(serviceInstance.connectionSettings.maxConnections) === 'undefined') {
    serviceInstance.connectionSettings.maxConnections = 20;
  }

  // Assign utility methods to the instance for proper context if they need 'this'
  // Or keep them as standalone functions and pass 'this' explicitly where needed.
  // For Type IV, let's keep them as standalone and pass context to break class-like structure.

  serviceInstance.performDirectoryQuery = async function(searchBase, queryOptions) {
    let finalSearchBase = searchBase;
    let finalQueryOptions = queryOptions;

    // Handle argument overloading: (opts, cb), (base, opts, cb)
    if (typeof finalQueryOptions === 'function') {
      finalQueryOptions = finalSearchBase;
      finalSearchBase = undefined;
    }
    if (typeof finalSearchBase === 'object') {
      finalQueryOptions = finalSearchBase;
      finalSearchBase = undefined;
    }
    finalQueryOptions = finalQueryOptions || {};
    finalSearchBase = finalSearchBase || finalQueryOptions.baseDN || this.baseSearchLocation;
    appLogger.trace('performDirectoryQuery(%s,%j)', finalSearchBase, finalQueryOptions);

    const collectedRecords = [];
    const activeReferralConnections = [];
    let outstandingRangeFetches = 0;
    let queryCompletionFlag = false;

    const mainClient = establishConnection.call(this); // Pass 'this' for connectionSettings
    mainClient.on('error', handleConnectionError);

    // The original `entryParser` was callback-based. Convert to async function.
    const recordTransformer = (finalQueryOptions || {}).entryTransform || (this.connectionSettings || {}).entryTransform || (async (item, raw) => item);

    async function processQueryResult(entryResult) {
      appLogger.trace('processQueryResult(%j)', entryResult);
      const processedItem = entryResult.object;
      delete processedItem.controls;

      outstandingRangeFetches++;
      try {
        const itemWithRanges = await rangeAttributeProcessor.processEntryRanges(processedItem, finalQueryOptions);
        const transformedItem = await recordTransformer(itemWithRanges, entryResult.raw);
        if (transformedItem) collectedRecords.push(transformedItem);
      } catch (rangeErr) {
        appLogger.error(rangeErr, 'Error processing range attributes for entry: %j', processedItem);
        const transformedItem = await recordTransformer(processedItem, entryResult.raw);
        if (transformedItem) collectedRecords.push(transformedItem);
      } finally {
        outstandingRangeFetches--;
        if (!outstandingRangeFetches && queryCompletionFlag) {
          finalizeQuery();
        }
      }
    }

    function releaseReferralClient(clientToRelease) {
      if (!clientToRelease) return;
      clientToRelease.unbind();
      const index = activeReferralConnections.indexOf(clientToRelease);
      if (index >= 0) {
        activeReferralConnections.splice(index, 1);
      }
    }

    async function pursueReferral(referralReference) {
      let referralLinkIndex = 0;
      let currentReferralUrl;
      while (currentReferralUrl = (referralReference.uris || [])[referralLinkIndex++]) {
        if (canFollowReferral(currentReferralUrl)) {
          appLogger.debug('Following directory referral at %s', currentReferralUrl);
          const referralClient = establishConnection.call(serviceInstance, currentReferralUrl);
          activeReferralConnections.push(referralClient);

          try {
            const referralSearchControls = extractLdapOptions(finalQueryOptions).controls || [];
            await new Promise((resolve, reject) => {
              referralClient.search(referralClient.url.DN, extractLdapOptions(finalQueryOptions), referralSearchControls, (err, res) => {
                if (err) {
                  appLogger.error(err, 'An error occurred during referral search on %s (%j)', referralClient.url.DN, finalQueryOptions);
                  releaseReferralClient(referralClient);
                  return reject(err);
                }

                res.on('searchEntry', processQueryResult);
                res.on('searchReference', pursueReferral);
                res.on('error', (refErr) => {
                  appLogger.error(refErr, 'Referral client error on %s: %j', referralClient.url.DN, finalQueryOptions);
                  releaseReferralClient(referralClient);
                  reject(refErr);
                });
                res.on('end', (result) => {
                  releaseReferralClient(referralClient);
                  resolve(result);
                });
              });
            });
          } catch (referralErr) {
            // Error already logged in the promise handler
          }
        }
      }
    }

    let finalResolve, finalReject;
    const queryPromise = new Promise((resolve, reject) => {
      finalResolve = resolve;
      finalReject = reject;
    });

    function handleConnectionError(err) {
      mainClient.unbind();
      if ((err || {}).name === 'SizeLimitExceededError') {
        appLogger.warn(err, 'Size limit exceeded during directory query.');
        queryCompletionFlag = true;
        finalizeQuery(err); // Pass error, but still resolve with collected records.
        return;
      }
      appLogger.error(err, 'An error occurred during directory query on %s (%j)', finalSearchBase, finalQueryOptions);
      queryCompletionFlag = true;
      finalizeQuery(err);
    }

    function finalizeQuery(completionError = null) {
      if (!outstandingRangeFetches && activeReferralConnections.length <= 0) {
        mainClient.unbind();
        appLogger.info('Directory query (%s) for "%s" yielded %d records.',
          finalSearchBase, shortenLogEntry(finalQueryOptions.filter), collectedRecords.length);
        if (completionError) {
          // If SizeLimitExceededError, resolve with partial results, otherwise reject.
          if ((completionError || {}).name === 'SizeLimitExceededError') {
             finalResolve(collectedRecords); // Original returns results even on SizeLimitExceeded
          } else {
             finalReject(completionError);
          }
        } else {
          finalResolve(collectedRecords);
        }
      }
    }

    const searchControls = finalQueryOptions.controls || [];
    if (!checkAny(searchControls, (ctrl) => ctrl instanceof ldapConnector.PagedResultsControl)) {
      appLogger.debug('Adding PagedResultControl to query (%s) with predicate "%s" for %j',
        finalSearchBase, shortenLogEntry(finalQueryOptions.filter), checkAny(finalQueryOptions.attributes) ? finalQueryOptions.attributes : ['*']);
      searchControls.push(new ldapConnector.PagedResultsControl({ value: { size: standardPageQuantity } }));
    }
    if (finalQueryOptions.includeDeleted) {
      if (!checkAny(searchControls, (ctrl) => ctrl.type === '1.2.840.113556.1.4.417')) {
        appLogger.debug('Adding ShowDeletedOidControl(1.2.840.113556.1.4.417) to query (%s) with predicate "%s" for %j',
          finalSearchBase, shortenLogEntry(finalQueryOptions.filter), checkAny(finalQueryOptions.attributes) ? finalQueryOptions.attributes : ['*']);
        searchControls.push(new ldapConnector.Control({ type: '1.2.840.113556.1.4.417', criticality: true }));
      }
    }

    appLogger.debug('Initiating directory query (%s) with predicate "%s" for %j',
      finalSearchBase, shortenLogEntry(finalQueryOptions.filter), checkAny(finalQueryOptions.attributes) ? finalQueryOptions.attributes : ['*']);

    mainClient.search(finalSearchBase, extractLdapOptions(finalQueryOptions), searchControls, (err, res) => {
      if (err) return handleConnectionError(err);
      res.on('searchEntry', processQueryResult);
      res.on('searchReference', pursueReferral);
      res.on('error', handleConnectionError);
      res.on('end', (result) => {
        queryCompletionFlag = true;
        finalizeQuery();
      });
    });

    return queryPromise;
  };

  // Expose other helper functions as methods if they are context-dependent
  serviceInstance.isValidDistinguishedName = isValidDistinguishedName;
  serviceInstance.formatDistinguishedName = formatDistinguishedName;
  serviceInstance.createUserQueryPredicate = createUserQueryPredicate;
  serviceInstance.createGroupQueryPredicate = createGroupQueryPredicate;
  serviceInstance.isGroupEntry = isGroupEntry;
  serviceInstance.isPersonEntry = isPersonEntry;
  // hasListeners is already part of EventEmitter, so no need to re-assign.

  return serviceInstance;
}

// Expose ldapjs filters (renamed)
createDirectoryService.ldapFilters = ldapConnector.filters;