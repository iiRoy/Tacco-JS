var emitterModule = require('events');
var utilityHelpers = require('util');
var directoryClient = require('ldapjs');
var flowControl = require('async');
var lodashUtil = require('underscore');
var loggerFactory = require('bunyan');

var Persona = require('./models/user');
var Unit = require('./models/group');
var ExtentFetchAttribute = require('./client/rangeretrievalspecifierattribute');

var credentialDisplayAllowed = false;
var maxLogEntrySize = 256;

var appLogger = loggerFactory.createLogger({
  name: 'DirectoryService',
  streams: [
    {
      level: 'critical',
      stream: process.stdout
    }
  ]
});

var standardBatchLimit = 1000; // AD's max results per single request.
var presetProperties = {
  persona: [
    'userPrincipalName', 'sAMAccountName', /*'objectSID',*/ 'mail',
    'lockoutTime', 'whenCreated', 'pwdLastSet', 'userAccountControl',
    'employeeID', 'sn', 'givenName', 'initials', 'cn', 'displayName',
    'comment', 'description'
  ],
  unit: [
    'objectCategory',
    'distinguishedName',
    'cn',
    'description',
    'member'
  ]
};
var standardRedirects = {
  enabled: false,
  // Default AD referrals that are not useful for general queries.
  exclude: [
    'ldaps?://ForestDnsZones\\..*/.*',
    'ldaps?://DomainDnsZones\\..*/.*',
    'ldaps?://.*/CN=Configuration,.*'
  ]
};

// Pre-compiled regular expressions for common patterns.
var regexPatterns = {
  'canonicalNameCheck': /(([^=]+=.+),?)+/gi,
  'isPersonaMatch': /CN=Person,CN=Schema,CN=Configuration,.*/i,
  'isUnitMatch': /CN=Group,CN=Schema,CN=Configuration,.*/i
};

/**
 * Controller for retrieving Active Directory identity data.
 *
 * @public
 * @constructor
 * @param {Object|String} resourceUri The LDAP server address (e.g., ldap://domain.com). Can also be an object containing all parameters.
 * @param {String} basePath The base DN for all LDAP queries.
 * @param {String} accountName The admin user's UPN or DN for binding.
 * @param {String} secretKey The admin user's password.
 * @param {Object} initialSettings Optional overrides for default behavior.
 * @returns {DirectoryAgent}
 */
var DirectoryAgent = function(resourceUri, basePath, accountName, secretKey, initialSettings) {
  if (this instanceof DirectoryAgent) {
    this.options = {};
    if (typeof(resourceUri) === 'string') {
      this.options.url = resourceUri;
      this.basePath = basePath;
      this.options.bindDN = accountName;
      this.options.bindCredentials = secretKey;

      if (typeof((initialSettings || {}).entryParser) === 'function') {
        this.options.entryParser = initialSettings.entryParser;
      }
    } else {
      this.options = resourceUri;
      this.basePath = this.options.baseDN;

      if (!this.options.bindDN) this.options.bindDN = this.options.username;
      if (!this.options.bindCredentials) this.options.bindCredentials = this.options.password;

      if (this.options.logging) {
        appLogger = loggerFactory.createLogger(lodashUtil.defaults({}, this.options.logging));
        delete(this.options.logging);
      }
    }

    presetProperties = lodashUtil.extend({}, presetProperties, (this.options || {}).attributes || {}, (initialSettings || {}).attributes || {});
    standardRedirects = lodashUtil.extend({}, standardRedirects, (this.options || {}).referrals || {}, (initialSettings || {}).referrals || {});

    appLogger.info('Attempting bind with credentials (%s/%s) to AD server (%s).', this.options.bindDN,
      credentialDisplayAllowed ? this.options.bindCredentials : '********', this.options.url);
    appLogger.info('Referral following is %s', standardRedirects.enabled ? 'active. Exclusions: ' + JSON.stringify(standardRedirects.exclude) : 'inactive');
    appLogger.info('Preset persona attributes: %j', presetProperties.persona || []);
    appLogger.info('Preset unit attributes: %j', presetProperties.unit || []);

    // Connection pooling setup
    if (typeof(this.options.maxConnections) === 'undefined') {
      this.options.maxConnections = 20;
    }
    emitterModule.EventEmitter.call(this);
  } else {
    return (new DirectoryAgent(resourceUri, basePath, accountName, secretKey, initialSettings));
  }
};
utilityHelpers.inherits(DirectoryAgent, emitterModule.EventEmitter);

/**
 * Exposes LDAP filter utilities from the underlying client.
 * @static
 */
DirectoryAgent.filters = directoryClient.filters;

/**
 * Truncates a string for logging if it exceeds a certain length.
 * @param {String} contentString The string to potentially truncate.
 * @param {Number} [maxSize] The maximum desired length.
 */
function shortenLogContent(contentString, maxSize) {
  if (typeof(maxSize) === 'undefined') maxSize = maxLogEntrySize;
  if (!contentString) return (contentString);

  if (typeof(contentString) !== 'string') contentString = contentString.toString();
  var currentLength = contentString.length;
  if ((!currentLength) || (currentLength < (maxSize + 3))) return (contentString);

  var firstPartSize = Math.ceil((maxSize - 3) / 2);
  var lastPartSize = Math.floor((maxSize - 3) / 2);
  return (contentString.slice(0, firstPartSize) + '...' +
    contentString.slice(currentLength - lastPartSize));
}

/**
 * Checks if any listeners are registered for a given event.
 * @param {String} callbackName The name of the event.
 * @returns {Boolean} True if listeners exist, false otherwise.
 */
function hasRegisteredCallbacks(callbackName) {
  return (emitterModule.EventEmitter.listenerCount(this, callbackName) > 0);
}

/**
 * Determines if a string represents a distinguished name.
 *
 * @private
 * @param {String} inputString The string to evaluate.
 * @returns {Boolean}
 */
function isCanonicalName(inputString) {
  appLogger.trace('isCanonicalName(%s)', inputString);
  if ((!inputString) || (inputString.length === 0)) return (false);
  return (regexPatterns.canonicalNameCheck.test(inputString));
}

/**
 * Processes a distinguished name to handle special characters.
 *
 * @private
 * @param distName {String} The DN string.
 * @returns {String} The formatted DN.
 */
function formatCanonicalName(distName) {
  appLogger.trace('formatCanonicalName(%s)', distName);
  if (!distName) return (distName);

  // Workaround for ldapjs DN escaping issue with commas
  return (distName.replace('\\,', '\\\\,'));
}

/**
 * Generates the LDAP query filter for persona searches.
 *
 * @private
 * @param {String} accountName The sAMAccountName or userPrincipalName.
 * @returns {String} The LDAP filter string.
 */
function getPersonaSearchFilter(accountName) {
  appLogger.trace('getPersonaSearchFilter(%s)', accountName);
  var currentInstance = this;

  if (!accountName) return ('(objectCategory=User)');
  if (isCanonicalName.call(currentInstance, accountName)) {
    return ('(&(objectCategory=User)(distinguishedName=' + formatCanonicalName(accountName) + '))');
  }

  return ('(&(objectCategory=User)(|(sAMAccountName=' + accountName + ')(userPrincipalName=' + accountName + ')))');
}

/**
 * Ensures an LDAP filter is properly enclosed for a compound query.
 * @param {String} filterString The LDAP filter.
 * @returns {String} The enclosed filter.
 */
function composeCombinedFilter(filterString) {
  appLogger.trace('composeCombinedFilter(%s)', filterString);

  if (!filterString) return (false);
  if ((filterString.charAt(0) === '(') && (filterString.charAt(filterString.length - 1) === ')')) {
    return (filterString);
  }
  return ('(' + filterString + ')');
}

/**
 * Generates the LDAP query filter for unit (group) searches.
 *
 * @private
 * @param {String} unitName The name of the group.
 * @returns {String} The LDAP filter string.
 */
function getUnitSearchFilter(unitName) {
  appLogger.trace('getUnitSearchFilter(%s)', unitName);
  var currentInstance = this;

  if (!unitName) return ('(objectCategory=Group)');
  if (isCanonicalName.call(currentInstance, unitName)) {
    return ('(&(objectCategory=Group)(distinguishedName=' + formatCanonicalName(unitName) + '))');
  }

  return ('(&(objectCategory=Group)(cn=' + unitName + '))');
}

/**
 * Checks if an LDAP result represents a group entry.
 * @param {Object} recordItem The LDAP entry.
 * @returns {Boolean}
 */
function isUnitEntry(recordItem) {
  appLogger.trace('isUnitEntry(%j)', recordItem);

  if (!recordItem) return (false);
  if (recordItem.groupType) return (true);
  if (recordItem.objectCategory) {
    return (regexPatterns.isUnitMatch.test(recordItem.objectCategory));
  }
  if ((recordItem.objectClass) && (recordItem.objectClass.length > 0)) {
    return (lodashUtil.any(recordItem.objectClass, function(cls) {
      return (cls.toLowerCase() === 'group');
    }));
  }
  return (false);
}

/**
 * Checks if an LDAP result represents a user entry.
 * @param {Object} recordItem The LDAP entry.
 * @returns {Boolean}
 */
function isPersonaEntry(recordItem) {
  appLogger.trace('isPersonaEntry(%j)', recordItem);

  if (!recordItem) return (false);
  if (recordItem.userPrincipalName) return (true);
  if (recordItem.sAMAccountName) return (true);
  if (recordItem.objectCategory) {
    return (regexPatterns.isPersonaMatch.test(recordItem.objectCategory));
  }
  if ((recordItem.objectClass) && (recordItem.objectClass.length > 0)) {
    return (lodashUtil.any(recordItem.objectClass, function(cls) {
      return (cls.toLowerCase() === 'user');
    }));
  }
  return (false);
}

/**
 * Creates an LDAP client instance.
 *
 * @private
 * @param {String} [resourceUri] The URL for the LDAP client.
 */
function establishConnection(resourceUri) {
  // Try to get URL from instance.
  resourceUri = resourceUri || this.url || (this.options || {}).url;
  if (!resourceUri) {
    throw 'No resource URI specified for DirectoryAgent client.';
  }
  appLogger.trace('establishConnection(%s)', resourceUri);

  var connectionOptions = lodashUtil.defaults({}, {
    url: resourceUri
  }, this.options);
  appLogger.debug('Creating ldapjs client for %s. Options: %j', connectionOptions.url, lodashUtil.omit(connectionOptions, 'url', 'bindDN', 'bindCredentials'));
  var newClient = directoryClient.createClient(connectionOptions);
  return (newClient);
}

/**
 * Checks if a given referral URL should be followed.
 * @param {String} redirectUrl The referral URL to check.
 * @returns {Boolean} True if allowed, false otherwise.
 */
function canFollowRedirect(redirectUrl) {
  appLogger.trace('canFollowRedirect(%j)', redirectUrl);
  if (!standardRedirects.enabled) return (false);
  if (!redirectUrl) return (false);

  return (!lodashUtil.any(standardRedirects.exclude, function(blockedPattern) {
    var pattern = new RegExp(blockedPattern, "i");
    return (pattern.test(redirectUrl));
  }));
}

/**
 * Extracts LDAP-specific options from a general options object.
 *
 * @param {Object} operationSettings The settings object.
 * @returns {Object} The ldapjs-compatible options.
 */
function getClientOptions(operationSettings) {
  return (lodashUtil.pick(operationSettings || {},
    // Client specific
    'url',
    'host', 'port', 'secure', 'tlsOptions',
    'socketPath', 'log', 'timeout', 'idleTimeout',
    'reconnect', 'queue', 'queueSize', 'queueTimeout',
    'queueDisable', 'bindDN', 'bindCredentials',
    // Search specific
    'filter', 'scope', 'attributes', 'controls',
    'paged', 'sizeLimit', 'timeLimit', 'typesOnly',
    'derefAliases'
  ));
}

/**
 * Executes an LDAP search operation.
 *
 * @private
 * @param {String} [basePath] The optional base DN for the search.
 * @param {Object} [operationSettings] LDAP query parameters.
 * @param {Function} completionCallback The function to call when done.
 */
function performQuery(basePath, operationSettings, completionCallback) {
  var currentInstance = this;

  if (typeof(operationSettings) === 'function') {
    completionCallback = operationSettings;
    operationSettings = basePath;
    basePath = undefined;
  }
  if (typeof(basePath) === 'object') {
    operationSettings = basePath;
    basePath = undefined;
  }
  operationSettings || (operationSettings = {});
  basePath || (basePath = operationSettings.baseDN) || (basePath = currentInstance.basePath);
  appLogger.trace('performQuery(%s,%j)', basePath, operationSettings);

  var queryFinished = false;
  var activeRedirects = [];
  var pendingRangeOperations = 0;
  var ldapConnection = establishConnection.call(currentInstance);
  ldapConnection.on('error', onConnectionIssue);

  /**
   * Disconnects and removes a referral client from the active list.
   * @param {Object} redirectClient The referral client to manage.
   */
  function detachRedirectClient(redirectClient) {
    if (!redirectClient) return;

    redirectClient.unbind();
    var clientIndex = activeRedirects.indexOf(redirectClient);
    if (clientIndex >= 0) {
      activeRedirects.splice(clientIndex, 1);
    }
  }

  /**
   * The default entry processing function.
   * @params {Object} item The raw ldapjs entry.
   * @params {Function} nextCallback The callback to execute when complete.
   */
  var itemProcessor = (operationSettings || {}).entryParser || (currentInstance.options || {}).entryParser || function onEntryProcessor(item, rawData, nextCallback) {
    nextCallback(item);
  };

  /**
   * Handler for individual search results.
   * @param {Object} resultEntry The received entry.
   */
  function onQueryResult(resultEntry) {
    appLogger.trace('onQueryResult(%j)', resultEntry);
    var processedResult = resultEntry.object;
    delete processedResult.controls; // Remove internal controls array

    // Handle attributes with range specifiers (pagination)
    pendingRangeOperations++;
    currentInstance.parseRangeAttributes(processedResult, operationSettings, function(error, finalItem) {
      pendingRangeOperations--;

      if (error) finalItem = resultEntry.object;
      itemProcessor(finalItem, resultEntry.raw, function(processedItem) {
        if (processedItem) queryResults.push(processedItem);
        if ((!pendingRangeOperations) && (queryFinished)) {
          onQueryCompletion();
        }
      });
    });
  }

  /**
   * Handler for search references/referrals.
   * @param {Object} redirectInfo The referral object.
   */
  function onRedirectFollow(redirectInfo) {
    var urlIndex = 0;
    var redirectTarget;
    // Iterate through available referral URLs.
    while (redirectTarget = (redirectInfo.uris || [])[urlIndex++]) {
      if (canFollowRedirect(redirectTarget)) {
        appLogger.debug('Following LDAP redirect to %s', redirectTarget);
        var redirectClient = establishConnection.call(currentInstance, redirectTarget);
        activeRedirects.push(redirectClient);

        redirectClient.search(redirectClient.url.DN, getClientOptions(operationSettings), queryControls, function(error, response) {
          /**
           * Handles errors from a referral client.
           * @param {Object} errorObject The error.
           */
          function onRedirectError(errorObject) {
            appLogger.error(errorObject, '[%s] Error during LDAP redirect chase on %s (%j)',
              (errorObject || {}).errno, redirectClient.url.DN, operationSettings);
            detachRedirectClient(redirectClient);
          }
          // Ignore silent failures for referrals
          if (error) {
            onRedirectError(error);
            return;
          }

          response.on('searchEntry', onQueryResult);
          response.on('searchReference', onRedirectFollow);
          response.on('error', onRedirectError);
          response.on('end', function(result) {
            detachRedirectClient(redirectClient);
            onQueryCompletion();
          });
        });
      }
    }
  }

  /**
   * Handles errors from the main LDAP client.
   * @param {Object} errorObject The error.
   */
  function onConnectionIssue(errorObject) {
    ldapConnection.unbind();
    if ((errorObject || {}).name === 'SizeLimitExceededError') {
      if (completionCallback) completionCallback(errorObject, queryResults);
      return;
    }

    appLogger.error(errorObject, '[%s] Error during LDAP search on %s (%j)',
      (errorObject || {}).errno || 'UNKNOWN', basePath, operationSettings);
    if (completionCallback) completionCallback(errorObject);
  }

  /**
   * Executes when search results are fully processed.
   * @param {Object} finalResult
   */
  function onQueryCompletion(finalResult) {
    if ((!pendingRangeOperations) && (activeRedirects.length <= 0)) {
      ldapConnection.unbind();
      appLogger.info('Directory search (%s) for "%s" yielded %d entries.',
        basePath, shortenLogContent(operationSettings.filter),
        (queryResults || []).length);
      if (completionCallback) completionCallback(null, queryResults);
    }
  }

  var queryResults = [];

  var queryControls = operationSettings.controls || (operationSettings.controls = []);
  // Add paged results control if not present.
  if (!lodashUtil.any(queryControls, function(optionControl) {
      return (optionControl instanceof directoryClient.PagedResultsControl);
    })) {
    appLogger.debug('Adding PagedResultControl to search (%s) with filter "%s" for %j',
      basePath, shortenLogContent(operationSettings.filter), lodashUtil.any(operationSettings.attributes) ? operationSettings.attributes : '[*]');
    queryControls.push(new directoryClient.PagedResultsControl({
      value: {
        size: standardBatchLimit
      }
    }));
  }
  if (operationSettings.includeDeleted) {
    if (!lodashUtil.any(queryControls, function(optionControl) {
        return (optionControl.type === '1.2.840.113556.1.4.417');
      })) {
      appLogger.debug('Adding ShowDeletedOidControl(1.2.840.113556.1.4.417) to search (%s) with filter "%s" for %j',
        basePath, shortenLogContent(operationSettings.filter), lodashUtil.any(operationSettings.attributes) ? operationSettings.attributes : '[*]');
      queryControls.push(new directoryClient.Control({
        type: '1.2.840.113556.1.4.417',
        criticality: true
      }));
    }
  }

  appLogger.debug('Initiating directory query (%s) with filter "%s" for %j',
    basePath, shortenLogContent(operationSettings.filter), lodashUtil.any(operationSettings.attributes) ? operationSettings.attributes : '[*]');
  ldapConnection.search(basePath, getClientOptions(operationSettings), queryControls, function(error, response) {
    if (error) {
      onConnectionIssue(error);
      return;
    }

    response.on('searchEntry', onQueryResult);
    response.on('searchReference', onRedirectFollow);
    response.on('error', onConnectionIssue);
    response.on('end', function(result) {
      queryFinished = true;
      onQueryCompletion(result);
    });
  });
}

/**
 * Retrieves the attributes for a user or group, applying range retrieval if necessary.
 *
 * @private
 * @param {Object} entry The raw LDAP entry object.
 * @param {Object} operationSettings The search operation settings.
 * @param {Function} completionCallback The callback function.
 */
function parseRangeAttributes(entry, operationSettings, completionCallback) {
  var currentInstance = this;
  appLogger.trace('parseRangeAttributes(%j,%j)', entry, operationSettings);

  var rangeAttributes = lodashUtil.filter(lodashUtil.keys(entry), function(attributeName) {
    return (ExtentFetchAttribute.isRangeAttribute(attributeName));
  });

  // If no range attributes, return immediately.
  if (rangeAttributes.length === 0) {
    completionCallback(null, entry);
    return;
  }

  var attributesToFetch = lodashUtil.map(rangeAttributes, function(attributeName) {
    return (new ExtentFetchAttribute(attributeName));
  });

  // Keep track of attributes that still need to be fully fetched.
  var remainingAttributes = {};
  lodashUtil.forEach(attributesToFetch, function(attribute) {
    remainingAttributes[attribute.baseAttributeName] = attribute;
  });

  /**
   * Recursive function to fetch all parts of a range attribute.
   * @param {Object} currentEntry The entry being processed.
   * @param {Function} nextStep The next step in the async process.
   */
  function fetchAttributeRange(currentEntry, nextStep) {
    var attributesForNextRequest = lodashUtil.map(remainingAttributes, function(attribute) {
      return (attribute.nextRangeAttributeName);
    });

    // If no more ranges to fetch, proceed.
    if (attributesForNextRequest.length === 0) {
      nextStep(null);
      return;
    }

    var connection = establishConnection.call(currentInstance);
    connection.search(currentEntry.dn, {
      scope: 'base',
      attributes: attributesForNextRequest
    }, function(error, response) {
      if (error) {
        appLogger.error(error, 'Error fetching ranged attributes for %s: %j', currentEntry.dn, attributesForNextRequest);
        connection.unbind();
        nextStep(error);
        return;
      }

      var entryReceived = false;
      response.on('searchEntry', function(rangeEntry) {
        entryReceived = true;
        lodashUtil.forEach(attributesToFetch, function(attribute) {
          var nextRangeValue = rangeEntry.object[attribute.nextRangeAttributeName];
          if (nextRangeValue) {
            // Append new values to the existing array.
            var currentValues = currentEntry[attribute.baseAttributeName] || [];
            if (!Array.isArray(currentValues)) currentValues = [currentValues];
            currentEntry[attribute.baseAttributeName] = currentValues.concat(nextRangeValue);
          } else {
            // No more values for this range attribute.
            delete remainingAttributes[attribute.baseAttributeName];
          }
        });
      });

      response.on('error', function(err) {
        appLogger.error(err, 'Error during range attribute search for %s', currentEntry.dn);
        connection.unbind();
        nextStep(err);
      });

      response.on('end', function() {
        connection.unbind();
        if (!entryReceived) {
          // No entry returned, means no more ranged attributes for all.
          remainingAttributes = {};
        }
        nextStep(null);
      });
    });
  }

  // Use async.whilst to repeatedly fetch ranges until all are retrieved.
  flowControl.whilst(
    function() {
      return (lodashUtil.keys(remainingAttributes).length > 0);
    },
    function(whilstCallback) {
      fetchAttributeRange(entry, whilstCallback);
    },
    function(error) {
      if (error) {
        completionCallback(error, entry);
        return;
      }
      completionCallback(null, entry);
    }
  );
}

// Attach the new function to the prototype.
DirectoryAgent.prototype.parseRangeAttributes = parseRangeAttributes;

/**
 * Retrieves a user entry by their sAMAccountName or userPrincipalName.
 *
 * @param {String} accountId The user's ID.
 * @param {Function} completionCallback The callback function.
 */
DirectoryAgent.prototype.findUser = function(accountId, completionCallback) {
  var currentInstance = this;
  appLogger.trace('findUser(%s)', accountId);

  var queryFilter = getPersonaSearchFilter.call(currentInstance, accountId);
  var findOptions = {
    scope: 'sub',
    filter: queryFilter,
    attributes: presetProperties.persona
  };

  performQuery.call(currentInstance, findOptions, function(error, results) {
    if (error) {
      completionCallback(error);
      return;
    }
    if ((!results) || (results.length === 0)) {
      completionCallback(null, null);
      return;
    }
    // Return the first matching user.
    completionCallback(null, new Persona(results[0]));
  });
};

/**
 * Retrieves a group entry by its name.
 *
 * @param {String} groupName The name of the group.
 * @param {Function} completionCallback The callback function.
 */
DirectoryAgent.prototype.findGroup = function(groupName, completionCallback) {
  var currentInstance = this;
  appLogger.trace('findGroup(%s)', groupName);

  var queryFilter = getUnitSearchFilter.call(currentInstance, groupName);
  var findOptions = {
    scope: 'sub',
    filter: queryFilter,
    attributes: presetProperties.unit
  };

  performQuery.call(currentInstance, findOptions, function(error, results) {
    if (error) {
      completionCallback(error);
      return;
    }
    if ((!results) || (results.length === 0)) {
      completionCallback(null, null);
      return;
    }
    // Return the first matching group.
    completionCallback(null, new Unit(results[0]));
  });
};

/**
 * Checks if a user is a member of a specific group.
 *
 * @param {String} groupName The name of the group.
 * @param {String} accountId The user's ID.
 * @param {Function} completionCallback The callback function.
 */
DirectoryAgent.prototype.isUserInGroup = function(groupName, accountId, completionCallback) {
  var currentInstance = this;
  appLogger.trace('isUserInGroup(%s,%s)', groupName, accountId);

  var groupFilter = getUnitSearchFilter.call(currentInstance, groupName);
  var userFilter = getPersonaSearchFilter.call(currentInstance, accountId);

  var combinedFilter = '(&' + groupFilter + userFilter + '(memberOf=' + groupName + '))'; // This is conceptually wrong for AD groups.

  // Correct logic for AD group membership:
  // 1. Find the group DN.
  // 2. Find the user DN.
  // 3. Search for the user using memberOf or check group's 'member' attribute.
  // Or, use the LDAP_MATCHING_RULE_IN_CHAIN (member:1.2.840.113556.1.4.1941:)

  currentInstance.findGroup(groupName, function(groupError, groupObject) {
    if (groupError) {
      completionCallback(groupError);
      return;
    }
    if (!groupObject) {
      completionCallback(null, false); // Group not found
      return;
    }

    currentInstance.findUser(accountId, function(userError, userObject) {
      if (userError) {
        completionCallback(userError);
        return;
      }
      if (!userObject) {
        completionCallback(null, false); // User not found
        return;
      }

      // Check if user's DN is in the group's 'member' attribute or use in-chain matching.
      var searchFilter;
      if (userObject.distinguishedName && groupObject.distinguishedName) {
        // Option 1: Using LDAP_MATCHING_RULE_IN_CHAIN (efficient for nested groups)
        searchFilter = '(&(objectClass=user)(distinguishedName=' + formatCanonicalName(userObject.distinguishedName) + ')(memberOf:1.2.840.113556.1.4.1941:=' + formatCanonicalName(groupObject.distinguishedName) + '))';
      } else {
        // Fallback: Less efficient, might not handle nested groups
        searchFilter = '(&(objectClass=user)(sAMAccountName=' + accountId + ')(memberOf=' + formatCanonicalName(groupObject.distinguishedName) + '))';
      }

      var membershipOptions = {
        scope: 'sub', // 'base' if using memberOf:1.2.840.113556.1.4.1941:
        filter: searchFilter,
        attributes: ['dn']
      };

      performQuery.call(currentInstance, membershipOptions, function(checkError, checkResults) {
        if (checkError) {
          completionCallback(checkError);
          return;
        }
        completionCallback(null, (checkResults && checkResults.length > 0));
      });
    });
  });
};

/**
 * Retrieves all groups a user is a member of.
 *
 * @param {String} accountId The user's ID.
 * @param {Function} completionCallback The callback function.
 */
DirectoryAgent.prototype.getUsersGroups = function(accountId, completionCallback) {
  var currentInstance = this;
  appLogger.trace('getUsersGroups(%s)', accountId);

  currentInstance.findUser(accountId, function(userError, userObject) {
    if (userError) {
      completionCallback(userError);
      return;
    }
    if (!userObject) {
      completionCallback(null, []); // User not found, no groups
      return;
    }

    var groupSearchFilter = '(&(objectClass=group)(member:1.2.840.113556.1.4.1941:=' + formatCanonicalName(userObject.distinguishedName) + '))';

    var searchOptions = {
      scope: 'sub',
      filter: groupSearchFilter,
      attributes: presetProperties.unit
    };

    performQuery.call(currentInstance, searchOptions, function(queryError, results) {
      if (queryError) {
        completionCallback(queryError);
        return;
      }
      var groupList = lodashUtil.map(results, function(groupData) {
        return (new Unit(groupData));
      });
      completionCallback(null, groupList);
    });
  });
};

/**
 * Retrieves all users who are members of a specific group.
 *
 * @param {String} groupName The name of the group.
 * @param {Function} completionCallback The callback function.
 */
DirectoryAgent.prototype.getGroupMembers = function(groupName, completionCallback) {
  var currentInstance = this;
  appLogger.trace('getGroupMembers(%s)', groupName);

  currentInstance.findGroup(groupName, function(groupError, groupObject) {
    if (groupError) {
      completionCallback(groupError);
      return;
    }
    if (!groupObject) {
      completionCallback(null, []); // Group not found, no members
      return;
    }

    // AD groups can have a 'member' attribute which contains DNs of direct members.
    // To handle nested groups and all members, a more complex search is often needed.
    // This implementation will fetch direct members.
    var memberDNs = groupObject.member || [];
    if (!Array.isArray(memberDNs)) {
      memberDNs = [memberDNs];
    }

    if (memberDNs.length === 0) {
      completionCallback(null, []);
      return;
    }

    var memberFilters = lodashUtil.map(memberDNs, function(dn) {
      return ('(distinguishedName=' + formatCanonicalName(dn) + ')');
    });

    var combinedMemberFilter = '(|' + memberFilters.join('') + ')';
    var finalFilter = '(&(objectClass=user)' + combinedMemberFilter + ')';

    var searchOptions = {
      scope: 'sub',
      filter: finalFilter,
      attributes: presetProperties.persona
    };

    performQuery.call(currentInstance, searchOptions, function(queryError, results) {
      if (queryError) {
        completionCallback(queryError);
        return;
      }
      var memberList = lodashUtil.map(results, function(userData) {
        return (new Persona(userData));
      });
      completionCallback(null, memberList);
    });
  });
};

/**
 * Authenticates a user against Active Directory.
 *
 * @param {String} accountId The user's sAMAccountName or userPrincipalName.
 * @param {String} userSecret The user's password.
 * @param {Function} completionCallback The callback function.
 */
DirectoryAgent.prototype.authenticate = function(accountId, userSecret, completionCallback) {
  var currentInstance = this;
  appLogger.trace('authenticate(%s, %s)', accountId, credentialDisplayAllowed ? userSecret : '********');

  currentInstance.findUser(accountId, function(userError, userObject) {
    if (userError) {
      completionCallback(userError);
      return;
    }
    if (!userObject) {
      completionCallback(null, false); // User not found
      return;
    }

    var authClient = establishConnection.call(currentInstance);
    authClient.bind(userObject.dn, userSecret, function(bindError) {
      authClient.unbind(); // Always unbind after authentication attempt.
      if (bindError) {
        appLogger.warn(bindError, 'Authentication failed for user %s: %s', accountId, bindError.message);
        completionCallback(null, false); // Authentication failed
        return;
      }
      completionCallback(null, true); // Authentication successful
    });
  });
};

module.exports = DirectoryAgent;