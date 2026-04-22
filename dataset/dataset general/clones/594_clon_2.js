"use strict";
var flowControl = require('async');
var dnsLib = require('node-named');
var util = require('lodash');
var dnsServer = dnsLib.createServer();
var eventLog = require('./logger.js');

// Global storage for various DNS record types
var dataStore = {};
// Application configuration settings
var settingsHolder;

// Regular expression for validating incoming domain names
var validPattern = /[A-Za-z0-9\.\*-_]*/;

dnsServer.on('query', function(request) {
    // Extract the domain name from the incoming request
    var hostName = request.name();

    // Validate the requested domain name
    if ( ! hostName.match(validPattern) ) {
        eventLog.issue('Invalid domain query detected', hostName);
        dnsServer.dispatch(request); // Send an empty response for invalid queries
        return; // Exit processing for this request
    }

    // Determine the type of DNS record being queried
    var recordType = request.type();
    eventLog.log('Incoming DNS Request:', recordType, hostName);

    // Process the query based on its record type
    switch (recordType) {
        case 'A':
            // Handle A (Address) records
            if (dataStore.aRecords[hostName]) {
                request.addResponse(hostName, dataStore.aRecords[hostName]);
            } else if (dataStore.canonicalRecords[hostName]) {
                request.addResponse(hostName, dataStore.canonicalRecords[hostName]);
                eventLog.trace('CNAME A-Record lookup:', dataStore.canonicalRecords[hostName].destination,
                               dataStore.aRecords[dataStore.canonicalRecords[hostName].destination]);
                request.addResponse(dataStore.canonicalRecords[hostName].destination,
                               dataStore.aRecords[dataStore.canonicalRecords[hostName].destination]);
            }
            dnsServer.dispatch(request);
            break;

        case 'CNAME':
            // Handle CNAME (Canonical Name) records
            request.addResponse(hostName, dataStore.canonicalRecords[hostName]);
            eventLog.trace('CNAME A-Record lookup:', dataStore.canonicalRecords[hostName].destination,
                           dataStore.aRecords[dataStore.canonicalRecords[hostName].destination]);
            request.addResponse(dataStore.canonicalRecords[hostName].destination,
                           dataStore.aRecords[dataStore.canonicalRecords[hostName].destination]);
            dnsServer.dispatch(request);
            break;

        case 'SOA':
            // Handle SOA (Start of Authority) records
            request.addResponse(hostName, dataStore.soaRecord);
            dnsServer.dispatch(request);
            break;

        case 'SRV':
            // Handle SRV (Service) records
            // eventLog.trace(dataStore.serviceRecords[hostName]); // Original debug line, replaced with eventLog.trace for consistency
            locateServiceRecords(hostName, function(problem, recordsList) {
                flowControl.forEach(recordsList, function(currentRecord, nextItem) {
                    eventLog.trace("Service record match found:", currentRecord);
                    request.addResponse(hostName, currentRecord);
                    nextItem(); // Continue to the next record
                }, function() {
                    dnsServer.dispatch(request); // All records processed, send response
                });
            });
            break;

        // case 'TXT': // Example of a commented-out section
        // var textEntry = new dnsLib.TXTRecord('hello world');
        // request.addResponse(hostName, textEntry, 'TXT');
        // break;

        default:
            // Default action for unhandled record types
            dnsServer.dispatch(request);
    }
});

// Function to find matching SRV records based on domain name
var locateServiceRecords = function(hostName, callback) {
    var foundItems = [];
    // Return immediately if an exact match exists
    if (dataStore.serviceRecords[hostName]) {
        eventLog.trace("Exact service record found for domain: " + hostName);
        callback(null, dataStore.serviceRecords[hostName]);
    } else {
        // Otherwise, search for records using a wildcard pattern
        var regexPattern = hostToPattern(hostName);
        // eventLog.trace(regexPattern); // Debugging the regex pattern

        flowControl.forEach(Object.keys(dataStore.serviceRecords), function(currentDomain, nextItem) {
            if (currentDomain.match(regexPattern)) {
                eventLog.trace("Pattern match for service record:", currentDomain);
                foundItems = util.union(foundItems, dataStore.serviceRecords[currentDomain]);
            }
            nextItem();
        }, function(problem) {
            // Consolidate duplicate results
            foundItems = util.uniq(foundItems, 'destination'); // Assuming 'destination' is the key for uniqueness in SRV records
            callback(problem, foundItems);
        });
    }
};

// Regular expression to identify wildcard characters
var wildcardRegex = /\*/g;

// Converts a domain name with wildcards into a regular expression
var hostToPattern = function(hostName) {
    hostName = hostName.replace(wildcardRegex, ".*");
    return new RegExp(hostName);
};

// Event handler for client connection errors
dnsServer.on('clientError', function(issue) {
    eventLog.issue("A client connection error occurred: ", issue);
});

// Event handler for unexpected server exceptions
dnsServer.on('uncaughtException', function(issue) {
    eventLog.issue("An unhandled server fault occurred: ", issue.message);
});

// Exported function to load new DNS records into the server
module.exports.updateRecords = function(incomingRecords, callback) {
    eventLog.log("Initiating loading of new DNS record configurations.");
    processRawRecords(incomingRecords, callback);
};

// Internal function to process and transform raw record data
var processRawRecords = function(incomingRecords, callback) {
    flowControl.parallel([
        function(nextItem) {
            constructARecords(incomingRecords, nextItem);
            // eventLog.trace("Constructed A records:", dataStore.aRecords); // Original debug line
        },
        function(nextItem) {
            constructCNAMERecords(incomingRecords, nextItem);
            // eventLog.trace("Constructed CNAME records:", dataStore.canonicalRecords); // Original debug line
        },
        function(nextItem) {
            constructSRVRecords(incomingRecords, nextItem);
        }
    ], callback);
};

// Builds A (Address) records from the provided raw data
var constructARecords = function(incomingRecords, callback) {
    dataStore.aRecords = {}; // Initialize or clear A records
    flowControl.forEach(incomingRecords.a, function(aRec, nextItem) {
        dataStore.aRecords[aRec.fullDomainName] = new dnsLib.ARecord(aRec.ipAddress);
        nextItem();
    }, callback);
};

// Builds CNAME (Canonical Name) records from the provided raw data
var constructCNAMERecords = function(incomingRecords, callback) {
    dataStore.canonicalRecords = {}; // Initialize or clear CNAME records
    flowControl.forEach(incomingRecords.cname, function(cnameRec, nextItem) {
        // eventLog.trace("Building CNAME entry:", cnameRec); // Original debug line
        dataStore.canonicalRecords[cnameRec.fullDomainName] = new dnsLib.CNAMERecord(cnameRec.a);
        nextItem();
    }, callback);
};

// Builds SRV (Service) records from the provided raw data
var constructSRVRecords = function(incomingRecords, callback) {
    dataStore.serviceRecords = {}; // Initialize or clear SRV records
    flowControl.forEach(incomingRecords.srv, function(srvRec, nextItem) {
        eventLog.trace("Processing service name:", srvRec.serviceName);
        // TODO: Consider adding weight and priority fields in the future
        if (!dataStore.serviceRecords[srvRec.fullDomainName]) {
            dataStore.serviceRecords[srvRec.fullDomainName] = [];
        }
        dataStore.serviceRecords[srvRec.fullDomainName].push(new dnsLib.SRVRecord(srvRec.serviceName, srvRec.servicePort));
        nextItem();
    }, callback);
};

// Exported function to start the DNS service
module.exports.initializeService = function(appSettings, callback) {
    settingsHolder = appSettings; // Store application configuration
    eventLog = settingsHolder.eventLog; // Update logger with configured logger
    dataStore.soaRecord = new dnsLib.SOARecord(settingsHolder.fakeTopLevelDomain, {
        timeToLive: 10
    });
    dnsServer.listen(settingsHolder.dnsSettings.listenPort, settingsHolder.dnsSettings.bindAddress, function() {
        eventLog.log('DNS service monitoring on', settingsHolder.dnsSettings.bindAddress, settingsHolder.dnsSettings.listenPort);
    });
};