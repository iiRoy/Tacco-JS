/*
 * Host Information Fetcher
 *
 * This utility gathers network and ranking data for specified domains.
 * It leverages external modules to perform DNS lookups and obtain Alexa ranks.
 *
 * Version: 1.0.0
 * License: MIT
 */

const nameService = require('dns');
const flowControl = require('async');
const rankChecker = require('alexarank');

const globalization = require('intl'); // Standard global, less renaming needed
const displayGrid = require('cli-table'); // Renamed from Table

/**
 * Main module function to process hostnames.
 * @param {object} inputConfig - Configuration object containing target hostnames.
 * @returns {void}
 */
module.exports = (inputConfig) => {
    // Validate input configuration
    if (!inputConfig || !Array.isArray(inputConfig.targetHostnames) || inputConfig.targetHostnames.length === 0) {
        console.error('Error: No target hostnames provided in configuration. Aborting operation.');
        return;
    }

    // Initialize the output table structure
    const outputGrid = new displayGrid({
        head: ['Hostname', 'NS Servers', 'IPv4 Addr', 'IPv6 Addr', 'Alexa Rank'],
        chars: {
            'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
            'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
            'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
            'right': '║', 'right-mid': '╢', 'middle': '│'
        }
    });

    /**
     * Helper function to append resolved records to a string, each on a new line.
     * @param {string[]} recordList - Array of records (e.g., IP addresses, NS names).
     * @returns {string} Formatted string of records.
     */
    const formatRecordsForDisplay = (recordList) => {
        if (!recordList || recordList.length === 0) {
            return 'N/A';
        }
        return recordList.join('\n');
    };

    // Process each target hostname asynchronously
    flowControl.eachSeries(inputConfig.targetHostnames, (currentHostname, completionSignal) => {
        const hostnameDetails = {
            nameServers: 'N/A',
            ipV4Records: 'N/A',
            ipV6Records: 'N/A',
            alexaRanking: 'N/A'
        };

        // Define a series of asynchronous tasks for each hostname
        flowControl.series([
            // Task 1: Fetch Alexa Traffic Rank
            (stepCompleted) => {
                rankChecker(currentHostname, (lookupIssue, rankData) => {
                    if (!lookupIssue && rankData && rankData.rank) {
                        hostnameDetails.alexaRanking = new globalization.NumberFormat().format(rankData.rank);
                    } else if (lookupIssue) {
                        console.warn(`Warning: Could not retrieve Alexa rank for ${currentHostname}. Issue: ${lookupIssue.message || lookupIssue}`);
                    }
                    stepCompleted(); // Continue even if rank lookup fails
                });
            },

            // Task 2: Resolve Name Servers (NS records)
            (stepCompleted) => {
                nameService.resolveNs(currentHostname, (lookupIssue, resolvedServers) => {
                    if (!lookupIssue && resolvedServers && resolvedServers.length > 0) {
                        hostnameDetails.nameServers = formatRecordsForDisplay(resolvedServers);
                    } else if (lookupIssue) {
                        console.warn(`Warning: NS lookup failed for ${currentHostname}. Issue: ${lookupIssue.message || lookupIssue}`);
                    }
                    stepCompleted();
                });
            },

            // Task 3: Resolve IPv4 Addresses (A records)
            (stepCompleted) => {
                nameService.resolve4(currentHostname, (lookupIssue, resolvedIpv4s) => {
                    if (!lookupIssue && resolvedIpv4s && resolvedIpv4s.length > 0) {
                        hostnameDetails.ipV4Records = formatRecordsForDisplay(resolvedIpv4s);
                    } else if (lookupIssue) {
                        console.warn(`Warning: IPv4 lookup failed for ${currentHostname}. Issue: ${lookupIssue.message || lookupIssue}`);
                    }
                    stepCompleted();
                });
            },

            // Task 4: Resolve IPv6 Addresses (AAAA records)
            (stepCompleted) => {
                nameService.resolve6(currentHostname, (lookupIssue, resolvedIpv6s) => {
                    if (!lookupIssue && resolvedIpv6s && resolvedIpv6s.length > 0) {
                        hostnameDetails.ipV6Records = formatRecordsForDisplay(resolvedIpv6s);
                    } else if (lookupIssue) {
                        console.warn(`Warning: IPv6 lookup failed for ${currentHostname}. Issue: ${lookupIssue.message || lookupIssue}`);
                    }
                    stepCompleted();
                });
            }
        ], (overallIssue) => {
            // After all series tasks for a single hostname are complete
            if (overallIssue) {
                console.error(`Critical Error processing ${currentHostname}: ${overallIssue.message || overallIssue}`);
            }

            // Construct the row for the output table
            const rowData = [
                currentHostname,
                hostnameDetails.nameServers,
                hostnameDetails.ipV4Records,
                hostnameDetails.ipV6Records,
                hostnameDetails.alexaRanking
            ];
            outputGrid.push(rowData); // Add the data row to our display grid

            completionSignal(); // Signal completion for the current hostname to async.eachSeries
        });

    }, (finalError) => {
        // After all hostnames have been processed
        if (finalError) {
            console.error(`An unexpected error occurred during hostname processing: ${finalError.message || finalError}`);
        }

        // Sort the entries in the grid alphabetically by hostname
        outputGrid.sort((entryA, entryB) => {
            const hostnameA = entryA[0].toLowerCase();
            const hostnameB = entryB[0].toLowerCase();
            if (hostnameA < hostnameB) {
                return -1;
            }
            if (hostnameA > hostnameB) {
                return 1;
            }
            return 0; // Hostnames are equal
        });

        // Display the final formatted table to the console
        console.info(outputGrid.toString());
    });
};