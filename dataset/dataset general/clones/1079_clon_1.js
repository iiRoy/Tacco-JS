/*
 *  This file contains the core logic for the ActiveDirectory agent.
 *  It handles initialization, configuration, and fundamental LDAP operations.
 */
var events = require('events'); // Core Node.js event emitter module
var util = require('util'); // Node.js utility module for inheritance
var ldap = require('ldapjs'); // The ldapjs client library for LDAP communication
var async = require('async'); // Asynchronous control flow library (though not heavily used in this snippet)
var _ = require('underscore'); // Utility belt library for JavaScript
var bunyan = require('bunyan'); // A JSON logging library

// --- Models and Client Components ---
var User = require('./models/user');
var Group = require('./models/group');
var RangeRetrievalSpecifierAttribute = require('./client/rangeretrievalspecifierattribute'); // Specific client-side attribute handling

// --- Configuration Flags and Constants ---
var isPasswordLoggingEnabled = false; // Flag to control sensitive password logging. Default is false for security.
var maxOutputLength = 256; // Maximum length for log output strings before truncation occurs.

// --- Logger Initialization ---
var log = bunyan.createLogger(
    {
        name: 'ActiveDirectory', // Logger name
        streams: [
            {
                level: 'fatal', // Only log messages of 'fatal' level or higher to stdout
                stream: process.stdout
            }
        ]
    }
);

/*
 * Default settings for LDAP operations.
 * These can be overridden during ActiveDirectory agent instantiation.
 */
var defaultPageSize = 1000; // AD's default maximum return size per single LDAP call.
// This constant specifies the maximum number of entries Active Directory will return in a single paged result.
var defaultAttributes = {
    user: [ // Default attributes to retrieve for user objects
        'userPrincipalName',
        'sAMAccountName',
        // 'objectSID', // objectSID is commented out, possibly due to specific usage or compatibility
        'mail',
        'lockoutTime',
        'whenCreated',
        'pwdLastSet',
        'userAccountControl',
        'employeeID',
        'sn', // Surname
        'givenName', // Given Name
        'initials',
        'cn', // Common Name
        'displayName',
        'comment',
        'description'
    ],
    group: [ // Default attributes to retrieve for group objects
        'objectCategory',
        'distinguishedName',
        'cn',
        'description',
        'member'
    ]
};
var defaultReferrals = {
    enabled: false, // By default, referral chasing is disabled.
    // Active Directory often returns default referrals that are not useful or can cause issues.
    // These regular expressions are used to exclude such known problematic referrals.
    exclude: [
        'ldaps?://ForestDnsZones\\..*/.*', // Exclude Forest DNS Zones referrals
        'ldaps?://DomainDnsZones\\..*/.*', // Exclude Domain DNS Zones referrals
        'ldaps?://.*/CN=Configuration,.*' // Exclude Configuration partition referrals
    ]
};

// Regular expressions are precompiled for performance in frequently used checks.
var re = {
    'isDistinguishedName': /(([^=]+=.+),?)+/gi, // Regex to determine if a string is a distinguished name (DN)
    'isUserResult': /CN=Person,CN=Schema,CN=Configuration,.*/i, // Regex to identify a user object category
    'isGroupResult': /CN=Group,CN=Schema,CN=Configuration,.*/i // Regex to identify a group object category
};

/**
 * Agent for retrieving ActiveDirectory user & group information.
 * This constructor initializes the ActiveDirectory client instance.
 *
 * @public
 * @constructor
 * @param {Object|String} url The URL of the LDAP server (e.g., ldap://domain.com).
 *                            This parameter can also be an object containing all configuration options.
 *                            Example object:
 *                            {
 *                                url: 'ldap://domain.com',
 *                                baseDN: 'dc=domain,dc=com',
 *                                username: 'admin@domain.com',
 *                                password: 'supersecret',
 *                                referrals: { enabled: true },
 *                                attributes: { user: [ 'attr1' ], group: [ 'attr2' ] }
 *                            }
 *                            The 'attributes' and 'referrals' properties are optional and used for overriding defaults.
 * @param {String} baseDN The default base container for all LDAP queries (e.g., dc=domain,dc=com).
 * @param {String} username The administrative username or DN for binding (e.g., 'admin@domain.com' or 'CN=Admin,CN=Users,DC=domain,DC=com').
 * @param {String} password The administrative password for the specified user.
 * @param {Object} defaults Optional object to specify default options to be overridden.
 *                          Example: { attributes: { user: [ 'new_attr' ], group: [ 'new_group_attr' ] } }
 * @returns {ActiveDirectory} An instance of the ActiveDirectory agent.
 */
var ActiveDirectory = function(url, baseDN, username, password, defaults) {

    // Ensure 'this' refers to an instance of ActiveDirectory
    if (this instanceof ActiveDirectory) {

        this.opts = {}; // Initialize options object for the instance

        // Handle different constructor signatures (string URL or options object)
        if (typeof(url) === 'string') {
            this.opts.url = url;
            this.baseDN = baseDN;
            this.opts.bindDN = username;
            this.opts.bindCredentials = password;

            // Check if a custom entry parser function is provided in defaults
            if (typeof((defaults || {}).entryParser) === 'function') {
                this.opts.entryParser = defaults.entryParser;
            }
        } else {
            // If 'url' is an object, it contains all options
            this.opts = url;
            this.baseDN = this.opts.baseDN;

            // Populate bindDN and bindCredentials from username/password if not explicitly set
            if (!this.opts.bindDN) this.opts.bindDN = this.opts.username;
            if (!this.opts.bindCredentials) this.opts.bindCredentials = this.opts.password;

            // Configure bunyan logger if logging options are provided
            if (this.opts.logging) {
                log = bunyan.createLogger(_.defaults({}, this.opts.logging));
                delete(this.opts.logging); // Remove logging options from main opts to avoid conflicts
            }
        }

        // Merge default attributes and referral settings with instance-specific overrides
        defaultAttributes = _.extend(
            {},
            defaultAttributes,
            (this.opts || {}).attributes || {},
            (defaults || {}).attributes || {}
        );
        defaultReferrals = _.extend(
            {},
            defaultReferrals,
            (this.opts || {}).referrals || {},
            (defaults || {}).referrals || {}
        );

        // Log initialization details for debugging and auditing
        log.info(
            'Using username/password (%s/%s) to bind to ActiveDirectory (%s).',
            this.opts.bindDN,
            isPasswordLoggingEnabled ? this.opts.bindCredentials : '********', // Mask password if logging is disabled
            this.opts.url
        );
        log.info(
            'Referrals are %s',
            defaultReferrals.enabled ? 'enabled. Exclusions: ' + JSON.stringify(defaultReferrals.exclude) : 'disabled'
        );
        log.info('Default user attributes: %j', defaultAttributes.user || []);
        log.info('Default group attributes: %j', defaultAttributes.group || []);

        // Enable connection pooling for ldapjs client.
        // This is a temporary measure and might be removed in future ldapjs versions.
        if (typeof(this.opts.maxConnections) === 'undefined') {
            this.opts.maxConnections = 20; // Default to 20 connections in the pool
        }

        // Initialize EventEmitter capabilities for this instance
        events.EventEmitter.call(this);

    } else {
        // If 'new' keyword was not used, instantiate and return a new object
        return (new ActiveDirectory(url, baseDN, username, password, defaults));
    }
};
// Inherit from EventEmitter to allow custom events
util.inherits(ActiveDirectory, events.EventEmitter);

/**
 * Expose ldapjs filters directly through the ActiveDirectory class.
 * This provides convenient access to LDAP filter constructors without needing to import ldapjs directly.
 * @static
 */
ActiveDirectory.filters = ldap.filters;

/**
 * Truncates a given string for logging purposes if its length exceeds a specified maximum.
 * Appends '...' in the middle if truncation occurs.
 * @param {String} output The string value to potentially truncate.
 * @param {Number} [maxLength] The maximum allowed length for the output string.
 *                             If not provided, `maxOutputLength` global variable is used.
 * @returns {String} The original or truncated string.
 */
function truncateLogOutput(output, maxLength) {
    if (typeof(maxLength) === 'undefined') {
        maxLength = maxOutputLength; // Use global default if not specified
    }
    if (!output) return (output); // Return null/undefined as is

    if (typeof(output) !== 'string') output = output.toString(); // Convert non-string outputs to string
    var length = output.length;
    if ((!length) || (length < (maxLength + 3))) return (output); // No truncation needed if short enough

    // Calculate prefix and suffix lengths for truncation
    var prefix = Math.ceil((maxLength - 3) / 2);
    var suffix = Math.floor((maxLength - 3) / 2);

    // Perform truncation and return
    return (output.slice(0, prefix) + '...' +
        output.slice(length - suffix));
}

/**
 * Checks if there are any listeners registered for a specific event on this EventEmitter instance.
 * @param {String} event The name of the event to check for listeners.
 * @returns {Boolean} `true` if listeners exist, `false` otherwise.
 */
function hasEvents(event) {
    // Utilize EventEmitter's static method to count listeners
    return (events.EventEmitter.listenerCount(this, event) > 0);
}

/**
 * Determines if a given string value represents a distinguished name (DN).
 * This function uses a regular expression to perform the check.
 *
 * @private
 * @param {String} value The string to be evaluated.
 * @returns {Boolean} `true` if the value is a distinguished name, `false` otherwise.
 */
function isDistinguishedName(value) {
    log.trace('isDistinguishedName(%s)', value); // Log the input value for tracing
    if ((!value) || (value.length === 0)) return (false); // Empty or null values are not DNs
    // Test against the precompiled regular expression for DN format
    return (re.isDistinguishedName.test(value));
}

/**
 * Parses a distinguished name (DN) string to escape problematic characters.
 * Specifically, it handles a known ldapjs bug with unescaped commas.
 *
 * @private
 * @param {String} dn The distinguished name string to parse and escape.
 * @returns {String} The escaped distinguished name string.
 */
function parseDistinguishedName(dn) {
    log.trace('parseDistinguishedName(%s)', dn); // Trace function call with DN
    if (!dn) return (dn); // Return null/undefined as is

    // Workaround for an ldapjs bug: escape unescaped commas
    // Note: This regex specifically targets a backslash followed by a comma,
    // and replaces it with two backslashes followed by a comma.
    return (dn.replace('\\,', '\\\\,'));
}

/**
 * Constructs the LDAP query filter string specifically for user searches.
 * It can handle samAccountName, userPrincipalName, or distinguished names.
 *
 * @private
 * @param {String} username The sAMAccountName or userPrincipalName (email) of the user.
 *                          Can also be a distinguished name.
 * @returns {String} The generated LDAP filter string.
 */
function getUserQueryFilter(username) {
    log.trace('getUserQueryFilter(%s)', username); // Log the username for tracing
    var self = this; // Capture 'this' context

    if (!username) return ('(objectCategory=User)'); // If no username, return a broad user category filter
    // If the username looks like a distinguished name, construct a DN-based filter
    if (isDistinguishedName.call(self, username)) {
        return ('(&(objectCategory=User)(distinguishedName=' + parseDistinguishedName(username) + '))');
    }

    // Otherwise, assume it's sAMAccountName or userPrincipalName and use an OR filter
    return ('(&(objectCategory=User)(|(sAMAccountName=' + username + ')(userPrincipalName=' + username + ')))');
}

/**
 * Ensures an LDAP filter string is properly wrapped in parentheses for compound filters.
 * This is a basic check and does not parse complex existing filters.
 *
 * @param {String} filter The LDAP filter string to inspect and potentially wrap.
 * @returns {String|Boolean} The wrapped filter string, or `false` if the input filter is null/empty.
 */
function getCompoundFilter(filter) {
    log.trace('getCompoundFilter(%s)', filter); // Trace the filter input

    if (!filter) return (false); // No filter provided
    // Check if the filter is already wrapped
    if ((filter.charAt(0) === '(') && (filter.charAt(filter.length - 1) === ')')) {
        return (filter);
    }
    // Wrap the filter if necessary
    return ('(' + filter + ')');
}

/**
 * Constructs the LDAP query filter string specifically for group searches.
 * It can handle group names or distinguished names.
 *
 * @private
 * @param {String} groupName The name of the group to search for. Can also be a distinguished name.
 * @returns {String} The generated LDAP filter string.
 */
function getGroupQueryFilter(groupName) {
    log.trace('getGroupQueryFilter(%s)', groupName); // Trace the group name input
    var self = this; // Capture 'this' context

    if (!groupName) return ('(objectCategory=Group)'); // If no group name, return a broad group category filter
    // If the groupName looks like a distinguished name, construct a DN-based filter
    if (isDistinguishedName.call(self, groupName)) {
        return ('(&(objectCategory=Group)(distinguishedName=' + parseDistinguishedName(groupName) + '))');
    }

    // Otherwise, assume it's a common name (cn)
    return ('(&(objectCategory=Group)(cn=' + groupName + '))');
}

/**
 * Determines if a given LDAP search result item represents a group entry.
 * It checks 'groupType', 'objectCategory', and 'objectClass' attributes.
 * @param {Object} item The LDAP result object to inspect.
 * @returns {Boolean} `true` if the item is a group, `false` otherwise.
 */
function isGroupResult(item) {
    log.trace('isGroupResult(%j)', item); // Log the item for tracing

    if (!item) return (false); // No item provided
    if (item.groupType) return (true); // 'groupType' attribute is a strong indicator of a group
    if (item.objectCategory) {
        // Test objectCategory against precompiled regex
        return (re.isGroupResult.test(item.objectCategory));
    }
    // Check if 'group' is present in the objectClass array
    if ((item.objectClass) && (item.objectClass.length > 0)) {
        return (_.any(item.objectClass, function(c) {
            return (c.toLowerCase() === 'group');
        }));
    }
    return (false); // Not identified as a group by any criteria
}

/**
 * Determines if a given LDAP search result item represents a user entry.
 * It checks 'userPrincipalName', 'sAMAccountName', 'objectCategory', and 'objectClass' attributes.
 * @param {Object} item The LDAP result object to inspect.
 * @returns {Boolean} `true` if the item is a user, `false` otherwise.
 */
function isUserResult(item) {
    log.trace('isUserResult(%j)', item); // Log the item for tracing

    if (!item) return (false); // No item provided
    if (item.userPrincipalName) return (true); // 'userPrincipalName' is a strong indicator of a user
    if (item.sAMAccountName) return (true); // 'sAMAccountName' is also a strong indicator of a user
    if (item.objectCategory) {
        // Test objectCategory against precompiled regex
        return (re.isUserResult.test(item.objectCategory));
    }
    // Check if 'user' is present in the objectClass array
    if ((item.objectClass) && (item.objectClass.length > 0)) {
        return (_.any(item.objectClass, function(c) {
            return (c.toLowerCase() === 'user');
        }));
    }
    return (false); // Not identified as a user by any criteria
}

/**
 * Factory function to create and configure an ldapjs client instance.
 * It uses the URL from the instance options or a provided URL.
 *
 * @private
 * @param {String} [url] An optional URL to use for creating the client. If not provided,
 *                       the instance's configured URL (`this.url` or `this.opts.url`) is used.
 * @throws {String} If no URL can be determined for the client.
 * @returns {Object} A configured ldapjs client object.
 */
function createClient(url) {
    // Attempt to get the URL, prioritizing passed argument, then instance properties
    url = url || this.url || (this.opts || {}).url;
    if (!url) {
        throw 'No url specified for ActiveDirectory client.'; // Critical error if no URL is available
    }
    log.trace('createClient(%s)', url); // Log the URL being used

    // Merge options, explicitly setting the URL and omitting sensitive bind info from debug log
    var opts = _.defaults({}, {
        url: url
    }, this.opts);
    log.debug('Creating ldapjs client for %s. Opts: %j', opts.url, _.omit(opts, 'url', 'bindDN', 'bindCredentials'));

    // Create and return the ldapjs client
    var client = ldap.createClient(opts);
    return (client);
}

/**
 * Checks if a given LDAP referral URL is allowed to be followed based on global referral settings.
 * Referrals can be globally disabled or excluded by a list of regular expressions.
 *
 * @param {String} referral The referral URL string to check.
 * @returns {Boolean} `true` if the referral should be followed, `false` if it should be ignored.
 */
function isAllowedReferral(referral) {
    log.trace('isAllowedReferral(%j)', referral); // Trace the referral URL
    if (!defaultReferrals.enabled) return (false); // If referrals are globally disabled, always return false
    if (!referral) return (false); // Cannot check an empty referral

    // Check if the referral matches any exclusion patterns
    return (!_.any(defaultReferrals.exclude, function(exclusion) {
        var re = new RegExp(exclusion, "i"); // Create regex from exclusion pattern (case-insensitive)
        return (re.test(referral));
    }));
}

/**
 * Extracts and returns only the ldapjs client and search-specific options from a larger options object.
 * This is useful for passing clean options directly to ldapjs methods.
 *
 * @param {Object} opts The full options object to parse.
 * @returns {Object} A new object containing only ldapjs-relevant options.
 */
function getLdapOpts(opts) {
    // Use underscore's pick method to select specific properties
    return (_.pick(opts || {},
        // Client connection options
        'url',
        'host', 'port', 'secure', 'tlsOptions',
        'socketPath', 'log', 'timeout', 'idleTimeout',
        'reconnect', 'queue', 'queueSize', 'queueTimeout',
        'queueDisable', 'bindDN', 'bindCredentials',
        // Search operation options
        'filter', 'scope', 'attributes', 'controls',
        'paged', 'sizeLimit', 'timeLimit', 'typesOnly',
        'derefAliases'
    ));
}

/**
 * Performs a generic search operation on the LDAP directory.
 * This is the core search method, handling paging, referrals, and range retrieval.
 *
 * @private
 * @param {String} [baseDN] The optional base distinguished name for the search.
 *                          If not provided, the instance's `baseDN` is used.
 * @param {Object} [opts] Options for the LDAP search, including `scope`, `filter`, `attributes`, `sizeLimit`, etc.
 * @param {Function} callback The callback function to execute upon completion.
 *                            Signature: `callback(err: {Object}, results: {Array<Object>})`.
 */
function search(baseDN, opts, callback) {
    var self = this; // Preserve context

    // Handle flexible argument signatures
    if (typeof(opts) === 'function') {
        callback = opts;
        opts = baseDN;
        baseDN = undefined;
    }
    if (typeof(baseDN) === 'object') {
        opts = baseDN;
        baseDN = undefined;
    }
    opts || (opts = {}); // Initialize opts if null/undefined
    baseDN || (baseDN = opts.baseDN) || (baseDN = self.baseDN); // Determine baseDN
    log.trace('search(%s,%j)', baseDN, opts); // Log search parameters

    var isDone = false; // Flag to indicate if the main search is logically complete
    var pendingReferrals = []; // Array to hold clients for active referral chases
    var pendingRangeRetrievals = 0; // Counter for attributes requiring range retrieval

    var client = createClient.call(self); // Create a new LDAP client for this search
    client.on('error', onClientError); // Attach error listener to the client

    /**
     * Helper function to unbind and remove a referral client from the pending list.
     * @param {Object} client The referral client to remove.
     */
    function removeReferral(client) {
        if (!client) return;

        client.unbind(); // Disconnect the client
        var indexOf = pendingReferrals.indexOf(client);
        if (indexOf >= 0) {
            pendingReferrals.splice(indexOf, 1); // Remove from tracking array
        }
    }

    /**
     * The default entry parser function. It performs no modifications by default.
     * This function can be overridden via `opts.entryParser` or `this.opts.entryParser`.
     * @param {Object} item The processed LDAP entry object.
     * @param {Object} raw The raw ldapjs entry object.
     * @param {Function} callback The callback to invoke with the potentially modified item.
     */
    var entryParser = (opts || {}).entryParser || (self.opts || {}).entryParser || function onEntryParser(item, raw, callback) {
        callback(item); // By default, pass the item through unchanged
    };

    /**
     * Event handler for 'searchEntry' events received from the LDAP client.
     * Processes each entry, handles range attributes, and pushes to results.
     * @param {Object} entry The raw ldapjs search entry object.
     */
    function onSearchEntry(entry) {
        log.trace('onSearchEntry(%j)', entry);
        var result = entry.object;
        delete result.controls; // Remove internal ldapjs controls from the final result

        // Check for and parse range attributes, which might require additional queries.
        pendingRangeRetrievals++; // Increment counter for pending range retrievals
        parseRangeAttributes.call(self, result, opts, function(err, item) {
            pendingRangeRetrievals--; // Decrement counter when done

            if (err) item = entry.object; // Fallback to original object on error
            // Apply custom entry parser if defined
            entryParser(item, entry.raw, function(item) {
                if (item) results.push(item); // Add the processed item to the results array
                // If all range retrievals are complete and main search is done, end the search.
                if ((!pendingRangeRetrievals) && (isDone)) {
                    onSearchEnd();
                }
            });
        });
    }

    /**
     * Event handler for 'searchReference' (referral) events.
     * Initiates new searches on referred LDAP servers if referrals are enabled and allowed.
     * @param {Object} ref The referral object containing URIs.
     */
    function onReferralChase(ref) {
        var index = 0;
        var referralUrl; // Initialize to null

        // Iterate through all URIs provided in the referral
        while ((referralUrl = (ref.uris || [])[index++])) {
            if (isAllowedReferral(referralUrl)) {
                log.debug('Following LDAP referral chase at %s', referralUrl);
                var referralClient = createClient.call(self, referralUrl); // Create client for referral
                pendingReferrals.push(referralClient); // Track the referral client

                // Perform a new search on the referral client
                referralClient.search(referralClient.url.DN, getLdapOpts(opts), controls, function(err, res) {
                    /**
                     * Inner function to handle errors specific to a referral client.
                     * @param {Object} err The error object.
                     */
                    function onReferralError(err) {
                        log.error(
                            err,
                            '[%s] An error occurred chasing the LDAP referral on %s (%j)',
                            (err || {}).errno,
                            referralClient.url.DN,
                            opts
                        );
                        removeReferral(referralClient); // Clean up the referral client
                    }

                    // If the referral search itself failed, just log and clean up, then return.
                    if (err) {
                        onReferralError(err);
                        return;
                    }

                    // Attach event listeners to the referral search result stream
                    res.on('searchEntry', onSearchEntry);
                    res.on('searchReference', onReferralChase); // Handle nested referrals
                    res.on('error', onReferralError);
                    res.on('end', function(result) {
                        removeReferral(referralClient); // Clean up on referral search end
                        onSearchEnd(); // Check if all searches are now complete
                    });
                });
            }
        }
    }

    /**
     * Event handler for errors encountered by the main LDAP client.
     * Calls the main callback with the error.
     * @param {Object} err The error object or string.
     */
    function onClientError(err) {
        client.unbind(); // Ensure client is unbound on error
        // Special handling for SizeLimitExceededError
        if ((err || {}).name === 'SizeLimitExceededError') {
            if (callback) callback(err, results); // Return partial results with the error
            return;
        }

        log.error(
            err,
            '[%s] An error occurred performing the requested LDAP search on %s (%j)',
            (err || {}).errno || 'UNKNOWN', // Fallback for errno if not present
            baseDN,
            opts
        );
        if (callback) callback(err); // Call back with the error
    }

    /**
     * Event handler for the 'end' of a search operation.
     * This function checks if all pending operations (range retrievals, referrals) are complete
     * before finalizing the search and invoking the main callback.
     * @param {Object} result The final result object from the LDAP server (may be undefined).
     */
    function onSearchEnd(result) {
        isDone = true; // Mark the main search stream as complete

        // Only finalize if no pending range retrievals and no active referral chases
        if ((!pendingRangeRetrievals) && (pendingReferrals.length <= 0)) {
            client.unbind(); // Unbind the main client
            log.info(
                'Active directory search (%s) for "%s" returned %d entries.',
                baseDN,
                truncateLogOutput(opts.filter), // Truncate filter for log readability
                (results || []).length
            );
            if (callback) callback(null, results); // Success callback with collected results
        }
    }

    var results = []; // Array to accumulate search results

    // Prepare LDAP controls for the search operation
    var controls = opts.controls || (opts.controls = []);

    // Add PagedResultsControl if not already present, enabling paging by default
    if (!_.any(controls, function(control) {
        return (control instanceof ldap.PagedResultsControl);
    })) {
        log.debug(
            'Adding PagedResultControl to search (%s) with filter "%s" for %j',
            baseDN,
            truncateLogOutput(opts.filter),
            _.any(opts.attributes) ? opts.attributes : '[*]' // Log attributes or '*' if none specified
        );
        controls.push(new ldap.PagedResultsControl({
            value: {
                size: defaultPageSize
            }
        }));
    }

    // Add ShowDeletedOidControl if 'includeDeleted' option is true and control not present
    if (opts.includeDeleted) {
        if (!_.any(controls, function(control) {
            return (control.type === '1.2.840.113556.1.4.417'); // OID for ShowDeletedOidControl
        })) {
            log.debug(
                'Adding ShowDeletedOidControl(1.2.840.113556.1.4.417) to search (%s) with filter "%s" for %j',
                baseDN,
                truncateLogOutput(opts.filter),
                _.any(opts.attributes) ? opts.attributes : '[*]'
            );
            controls.push(new ldap.Control({
                type: '1.2.840.113556.1.4.417',
                criticality: true
            }));
        }
    }

    log.debug('Querying active directory (%s) with filter "%s" for %j',
        baseDN, truncateLogOutput(opts.filter), _.any(opts.attributes) ? opts.attributes : '[*]');