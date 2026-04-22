"use strict";

// Importing essential modules under new, descriptive names
const taskOrchestrator = require('async'); // Manages asynchronous operations flow
const dnsRecordFactory = require('node-named'); // Creates DNS record objects
const dataUtilities = require('lodash'); // Provides utility functions for data manipulation
const eventMonitor = require('./logger.js'); // Custom logging utility

// Core DNS server instance
const dnsResponder = dnsRecordFactory.createServer();

// Central repository for all loaded DNS records
const recordRepository = {
    aEntries: new Map(),        // Stores A records, mapping FQDN to record object
    cnameEntries: new Map(),    // Stores CNAME records, mapping FQDN to record object
    srvEntries: new Map(),      // Stores SRV records, mapping FQDN to array of records
    soaEntry: null              // Stores the SOA record
};

// Runtime configuration settings
let serviceConfiguration;

// Regular expression for validating domain names
const permittedDomainCharacters = /^[A-Za-z0-9\.\*\-_]+$/;

/**
 * Handles incoming DNS queries. This is the primary entry point for DNS requests.
 * @param {object} dnsRequest - The incoming DNS query object.
 */
dnsResponder.on('query', function(dnsRequest) {
    const requestedIdentifier = dnsRequest.name();
    const queryClassification = dnsRequest.type();

    // Perform initial validation on the requested domain name
    if (!requestedIdentifier || requestedIdentifier.length === 0) {
        eventMonitor.warn('Empty domain requested, ignoring query.');
        dnsResponder.send(dnsRequest); // Send an empty response for malformed queries
        return;
    }

    if (!permittedDomainCharacters.test(requestedIdentifier)) {
        eventMonitor.error('Malformed query detected, contains invalid characters:', requestedIdentifier);
        dnsResponder.send(dnsRequest); // Send an empty response for invalid queries
        return;
    }

    eventMonitor.info('DNS Request Received:', queryClassification, requestedIdentifier);

    // Process the query based on its type
    switch (queryClassification) {
        case 'A': // Address Record
            handleARecordQuery(dnsRequest, requestedIdentifier);
            break;
        case 'CNAME': // Canonical Name Record
            handleCNAMERecordQuery(dnsRequest, requestedIdentifier);
            break;
        case 'SOA': // Start of Authority Record
            handleSOARecordQuery(dnsRequest, requestedIdentifier);
            break;
        case 'SRV': // Service Record
            handleSRVRecordQuery(dnsRequest, requestedIdentifier);
            break;
        default: // Unsupported query type
            eventMonitor.debug('Unsupported query type received:', queryClassification, 'for domain:', requestedIdentifier);
            dnsResponder.send(dnsRequest); // Send an empty response
            break;
    }
});

/**
 * Resolves a CNAME chain to its ultimate A record target.
 * @param {string} domainName - The initial domain name to resolve.
 * @param {Map} cnameMap - The map of CNAME records.
 * @param {Map} aMap - The map of A records.
 * @returns {{targetDomain: string, aRecord: object}|null} - The final A record and its domain, or null if not found.
 */
function resolveCnameChain(domainName, cnameMap, aMap) {
    let currentDomain = domainName;
    let maxRedirects = 5; // Prevent infinite loops
    while (maxRedirects-- > 0) {
        const cnameEntry = cnameMap.get(currentDomain);
        if (cnameEntry) {
            currentDomain = cnameEntry.target;
            eventMonitor.debug(`CNAME redirect: ${domainName} -> ${currentDomain}`);
        } else {
            break; // No more CNAMEs in the chain
        }
    }
    const finalARecord = aMap.get(currentDomain);
    return finalARecord ? { targetDomain: currentDomain, aRecord: finalARecord } : null;
}

/**
 * Handles A record queries, including CNAME resolution.
 * @param {object} dnsRequest - The DNS query object.
 * @param {string} domain - The requested domain name.
 */
function handleARecordQuery(dnsRequest, domain) {
    const directARecord = recordRepository.aEntries.get(domain);
    if (directARecord) {
        dnsRequest.addAnswer(domain, directARecord);
        eventMonitor.debug('Direct A record found for:', domain);
    } else {
        const cnameResolution = resolveCnameChain(domain, recordRepository.cnameEntries, recordRepository.aEntries);
        if (cnameResolution) {
            const { targetDomain, aRecord } = cnameResolution;
            const cnameRecord = recordRepository.cnameEntries.get(domain); // Get the initial CNAME for the answer
            if (cnameRecord) {
                dnsRequest.addAnswer(domain, cnameRecord); // Add the CNAME itself
            }
            dnsRequest.addAnswer(targetDomain, aRecord); // Add the resolved A record
            eventMonitor.debug(`A record resolved via CNAME for ${domain} to ${targetDomain}`);
        } else {
            eventMonitor.debug('No A or CNAME record found for:', domain);
        }
    }
    dnsResponder.send(dnsRequest);
}

/**
 * Handles CNAME record queries.
 * @param {object} dnsRequest - The DNS query object.
 * @param {string} domain - The requested domain name.
 */
function handleCNAMERecordQuery(dnsRequest, domain) {
    const cnameEntry = recordRepository.cnameEntries.get(domain);
    if (cnameEntry) {
        dnsRequest.addAnswer(domain, cnameEntry);
        eventMonitor.debug('CNAME record found for:', domain, '->', cnameEntry.target);
        // Also add the A record that the CNAME points to, if available
        const targetARecord = recordRepository.aEntries.get(cnameEntry.target);
        if (targetARecord) {
            dnsRequest.addAnswer(cnameEntry.target, targetARecord);
            eventMonitor.debug('Associated A record added for CNAME target:', cnameEntry.target);
        } else {
            eventMonitor.debug('No associated A record found for CNAME target:', cnameEntry.target);
        }
    } else {
        eventMonitor.debug('No CNAME record found for:', domain);
    }
    dnsResponder.send(dnsRequest);
}

/**
 * Handles SOA record queries.
 * @param {object} dnsRequest - The DNS query object.
 * @param {string} domain - The requested domain name.
 */
function handleSOARecordQuery(dnsRequest, domain) {
    if (recordRepository.soaEntry) {
        dnsRequest.addAnswer(domain, recordRepository.soaEntry);
        eventMonitor.debug('SOA record provided for:', domain);
    } else {
        eventMonitor.warn('SOA record requested but not configured.');
    }
    dnsResponder.send(dnsRequest);
}

/**
 * Handles SRV record queries, potentially matching wildcards.
 * @param {object} dnsRequest - The DNS query object.
 * @param {string} domain - The requested domain name.
 */
function handleSRVRecordQuery(dnsRequest, domain) {
    eventMonitor.debug('Processing SRV query for:', domain);
    locateServiceRecords(domain, function(err, foundRecords) {
        if (err) {
            eventMonitor.error('Error locating SRV records:', err);
            dnsResponder.send(dnsRequest);
            return;
        }

        if (foundRecords && foundRecords.length > 0) {
            taskOrchestrator.each(foundRecords, function(srvRecord, iterationComplete) {
                eventMonitor.debug("SRV match identified:", srvRecord.name, srvRecord.port);
                dnsRequest.addAnswer(domain, srvRecord);
                iterationComplete();
            }, function() {
                dnsResponder.send(dnsRequest);
            });
        } else {
            eventMonitor.debug('No SRV records found for:', domain);
            dnsResponder.send(dnsRequest);
        }
    });
}

/**
 * Searches for matching SRV records, supporting wildcard patterns.
 * @param {string} targetDomainName - The domain name to search for.
 * @param {function} completionCallback - Callback function (err, records).
 */
const locateServiceRecords = function(targetDomainName, completionCallback) {
    let matchingRecords = [];

    // Prioritize exact matches
    const exactMatch = recordRepository.srvEntries.get(targetDomainName);
    if (exactMatch && exactMatch.length > 0) {
        eventMonitor.debug("Found exact SRV match for:", targetDomainName);
        return completionCallback(null, exactMatch);
    }

    // If no exact match, search using wildcard patterns
    const domainSearchPattern = generateRegexFromDomain(targetDomainName);
    eventMonitor.debug("Searching for SRV records with pattern:", domainSearchPattern.source);

    // Iterate through all stored SRV keys and apply the regex
    taskOrchestrator.each(Array.from(recordRepository.srvEntries.keys()), function(storedDomainKey, iterationDone) {
        if (domainSearchPattern.test(storedDomainKey)) {
            eventMonitor.debug("Pattern match found for stored key:", storedDomainKey);
            matchingRecords = matchingRecords.concat(recordRepository.srvEntries.get(storedDomainKey));
        }
        iterationDone();
    }, function(err) {
        if (err) {
            eventMonitor.error("Error during SRV record pattern matching:", err);
            return completionCallback(err);
        }
        // Ensure uniqueness based on target and port to avoid duplicates from multiple matches
        const uniqueRecords = Array.from(new Set(matchingRecords.map(rec => JSON.stringify({ name: rec.name, port: rec.port, target: rec.target }))))
                                .map(str => JSON.parse(str))
                                .map(uniqueData => {
                                    // Reconstruct a named.SRVRecord from the unique data if necessary
                                    // This assumes SRVRecord constructor takes name, port, target
                                    // Original code only passes name, port, so we'll stick to that if target is not a constructor arg
                                    // If target is needed, the recordRepository.srvEntries would need to store more data
                                    const originalRecord = matchingRecords.find(r => r.name === uniqueData.name && r.port === uniqueData.port && r.target === uniqueData.target);
                                    return originalRecord || new dnsRecordFactory.SRVRecord(uniqueData.name, uniqueData.port);
                                });
        completionCallback(null, uniqueRecords);
    });
};

const wildcardReplacementRegex = /\*/g; // Regex to find all wildcard characters

/**
 * Converts a domain string with wildcards into a regular expression.
 * @param {string} domainString - The domain string, potentially containing '*'.
 * @returns {RegExp} - A regular expression object.
 */
const generateRegexFromDomain = function(domainString) {
    if (!domainString || typeof domainString !== 'string') {
        eventMonitor.warn("Invalid domain string for regex generation:", domainString);
        return new RegExp(''); // Return an empty regex that matches nothing
    }
    const escapedDomain = domainString.replace(/[.+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters
    const regexPattern = escapedDomain.replace(wildcardReplacementRegex, ".*");
    return new RegExp(`^${regexPattern}$`); // Anchor to start and end for full match
};

// Event handler for client-side errors during DNS communication
dnsResponder.on('clientError', function(errDetails) {
    eventMonitor.error("A client connection error occurred:", errDetails.message || errDetails);
});

// Event handler for uncaught exceptions within the DNS server process
dnsResponder.on('uncaughtException', function(errDetails) {
    eventMonitor.critical("An unhandled exception was caught:", errDetails.message || errDetails, errDetails.stack);
    // Depending on severity, you might want to gracefully shut down or restart
});

/**
 * External interface to load new DNS records into the repository.
 * @param {object} sourceRecords - An object containing A, CNAME, and SRV record arrays.
 * @param {function} completionCallback - Callback function upon completion (err).
 */
module.exports.initializeRecordSet = function(sourceRecords, completionCallback) {
    eventMonitor.info("Initiating load of new DNS record configurations.");
    if (!sourceRecords || typeof sourceRecords !== 'object') {
        const error = new Error("Invalid source records provided for initialization.");
        eventMonitor.error(error.message);
        return completionCallback(error);
    }
    processIncomingRecords(sourceRecords, completionCallback);
};

/**
 * Internal function to process and transform raw incoming record data into the structured repository.
 * @param {object} rawRecordData - The raw record data.
 * @param {function} processingDoneCallback - Callback function upon completion (err).
 */
const processIncomingRecords = function(rawRecordData, processingDoneCallback) {
    // Execute record building functions in parallel
    taskOrchestrator.parallel([
        function(stepComplete) {
            constructARecordIndex(rawRecordData, stepComplete);
        },
        function(stepComplete) {
            constructCNAMERecordIndex(rawRecordData, stepComplete);
        },
        function(stepComplete) {
            constructSRVRecordIndex(rawRecordData, stepComplete);
        }
    ], processingDoneCallback);
};

/**
 * Builds the A record index from the incoming data.
 * @param {object} incomingDataSet - The dataset containing 'a' records.
 * @param {function} buildCompletion - Callback function (err).
 */
const constructARecordIndex = function(incomingDataSet, buildCompletion) {
    recordRepository.aEntries.clear(); // Clear existing A records
    const aRecordsArray = incomingDataSet.a;

    if (!Array.isArray(aRecordsArray) || aRecordsArray.length === 0) {
        eventMonitor.debug("No A records provided or array is empty.");
        return buildCompletion(null);
    }

    taskOrchestrator.each(aRecordsArray, function(aEntry, entryProcessed) {
        if (aEntry && aEntry.fqdn && aEntry.ip) {
            recordRepository.aEntries.set(aEntry.fqdn, new dnsRecordFactory.ARecord(aEntry.ip));
            eventMonitor.debug("Added A record for:", aEntry.fqdn, "->", aEntry.ip);
        } else {
            eventMonitor.warn("Skipping malformed A record entry:", aEntry);
        }
        entryProcessed();
    }, buildCompletion);
};

/**
 * Builds the CNAME record index from the incoming data.
 * @param {object} incomingDataSet - The dataset containing 'cname' records.
 * @param {function} buildCompletion - Callback function (err).
 */
const constructCNAMERecordIndex = function(incomingDataSet, buildCompletion) {
    recordRepository.cnameEntries.clear(); // Clear existing CNAME records
    const cnameRecordsArray = incomingDataSet.cname;

    if (!Array.isArray(cnameRecordsArray) || cnameRecordsArray.length === 0) {
        eventMonitor.debug("No CNAME records provided or array is empty.");
        return buildCompletion(null);
    }

    taskOrchestrator.each(cnameRecordsArray, function(cnameEntry, entryProcessed) {
        if (cnameEntry && cnameEntry.fqdn && cnameEntry.a) {
            recordRepository.cnameEntries.set(cnameEntry.fqdn, new dnsRecordFactory.CNAMERecord(cnameEntry.a));
            eventMonitor.debug("Added CNAME record for:", cnameEntry.fqdn, "->", cnameEntry.a);
        } else {
            eventMonitor.warn("Skipping malformed CNAME record entry:", cnameEntry);
        }
        entryProcessed();
    }, buildCompletion);
};

/**
 * Builds the SRV record index from the incoming data.
 * @param {object} incomingDataSet - The dataset containing 'srv' records.
 * @param {function} buildCompletion - Callback function (err).
 */
const constructSRVRecordIndex = function(incomingDataSet, buildCompletion) {
    recordRepository.srvEntries.clear(); // Clear existing SRV records
    const srvRecordsArray = incomingDataSet.srv;

    if (!Array.isArray(srvRecordsArray) || srvRecordsArray.length === 0) {
        eventMonitor.debug("No SRV records provided or array is empty.");
        return buildCompletion(null);
    }

    taskOrchestrator.each(srvRecordsArray, function(srvEntry, entryProcessed) {
        if (srvEntry && srvEntry.fqdn && srvEntry.name && srvEntry.port) {
            // Ensure an array exists for this FQDN
            if (!recordRepository.srvEntries.has(srvEntry.fqdn)) {
                recordRepository.srvEntries.set(srvEntry.fqdn, []);
            }
            recordRepository.srvEntries.get(srvEntry.fqdn).push(new dnsRecordFactory.SRVRecord(srvEntry.name, srvEntry.port));
            eventMonitor.debug("Added SRV record for:", srvEntry.fqdn, "service:", srvEntry.name, "port:", srvEntry.port);
        } else {
            eventMonitor.warn("Skipping malformed SRV record entry:", srvEntry);
        }
        entryProcessed();
    }, buildCompletion);
};

/**
 * External interface to start the DNS service.
 * @param {object} initialSettings - Configuration object for the service.
 * @param {function} startupCompletion - Callback function upon service startup (err).
 */
module.exports.initiateService = function(initialSettings, startupCompletion) {
    if (!initialSettings || typeof initialSettings !== 'object') {
        const error = new Error("Invalid initial settings provided for service startup.");
        eventMonitor.error(error.message);
        return startupCompletion(error);
    }

    serviceConfiguration = initialSettings;
    // Overwrite logger with configured one if provided
    if (serviceConfiguration.logger) {
        eventMonitor.replaceLogger(serviceConfiguration.logger);
    }

    // Configure the SOA record based on service settings
    const defaultTtl = 3600; // Default TTL in seconds
    recordRepository.soaEntry = new dnsRecordFactory.SOARecord(serviceConfiguration.authoritativeDomain || 'example.com', {
        serial: Math.floor(Date.now() / 1000), // Current timestamp as serial
        refresh: 7200, // 2 hours
        retry: 3600, // 1 hour
        expire: 604800, // 1 week
        minimum: defaultTtl, // 1 hour
        ttl: serviceConfiguration.soaTtl || defaultTtl
    });
    eventMonitor.info('SOA record configured for:', recordRepository.soaEntry.origin);

    const bindAddress = serviceConfiguration.networkInterface.bindIp || '0.0.0.0';
    const listenPort = serviceConfiguration.networkInterface.port || 53;

    // Attempt to start the DNS server listener
    try {
        dnsResponder.listen(listenPort, bindAddress, function() {
            eventMonitor.info(`DNS service operational and listening on ${bindAddress}:${listenPort}`);
            startupCompletion(null);
        });
    } catch (startError) {
        eventMonitor.critical("Failed to start DNS service listener:", startError.message);
        startupCompletion(startError);
    }
};