/*
 * dnc - A DNS Checker Utility
 *
 * Version: 0.1.2
 *
 * Copyright (c) 2014 Frederic Cambus
 * All rights reserved.
 *
 * Project Home: https://github.com/fcambus/dnc
 *
 * Initial Commit: 2014-02-11
 * Last Modified: 2014-05-01
 *
 * License: BSD 2-Clause (see LICENSE file for full details)
 *
 */


// Core Node.js DNS module for name resolution
var dns = require('dns');


// External NPM Modules
//
// These dependencies enhance functionality:
// - async: For managing asynchronous operations
// - alexarank: To fetch Alexa traffic ranks
// - intl: For internationalization (number formatting)
// - cli-table: For generating command-line tables
var async = require('async');
var alexa = require('alexarank');

var Intl = require('intl');

var Table = require('cli-table');


// Main dnc module export
// This function initializes and runs the DNS checks
module.exports = function (config) {

    // Initialize the CLI table with predefined headers
    var table = new Table({
        head: ['Domain', 'NS', 'IPv4', 'IPv6', 'Alexa']
    });

    // Iterate over each domain provided in the configuration
    async.forEach(
        config.domains,
        function (domain, callback) {

            // Initialize a site object to store DNS and Alexa data for the current domain
            var site = {
                ns: '',
                ipv4: '',
                ipv6: '',
                alexa: ''
            };

            // Run a series of asynchronous tasks for each domain
            async.series([

                // Task 1: Get Alexa Traffic Rank for the domain
                function (callback) {
                    alexa(domain, function (error, result) {
                        if (!error && result.rank) {
                            // Format the Alexa rank for better readability
                            site.alexa = new Intl.NumberFormat().format(result.rank);
                        }

                        // Call the callback to proceed to the next task
                        callback();
                    });
                },

                // Task 2: Get Name Servers (NS records)
                function (callback) {
                    dns.resolveNs(domain, function (error, addresses) {
                        if (!error) {
                            // Concatenate all NS records, each on a new line
                            for (var item in addresses) {
                                site.ns += addresses[item] + "\n";
                            }
                        }

                        callback();
                    });
                },

                // Task 3: Get IPv4 addresses (A records)
                function (callback) {
                    dns.resolve4(domain, function (error, addresses) {
                        if (!error) {
                            // Concatenate all IPv4 addresses
                            for (var item in addresses) {
                                site.ipv4 += addresses[item] + "\n";
                            }
                        }

                        callback();
                    });
                },

                // Task 4: Get IPv6 addresses (AAAA records)
                function (callback) {
                    dns.resolve6(domain, function (error, addresses) {
                        if (!error) {
                            // Concatenate all IPv6 addresses
                            for (var item in addresses) {
                                site.ipv6 += addresses[item] + "\n";
                            }
                        }

                        callback();
                    });
                }
            ], function (error) { // Callback for async.series completion

                // Populate the table with the collected data for the current domain
                table.push(
                    [domain, site.ns.trim(), site.ipv4.trim(), site.ipv6.trim(), site.alexa]
                );

                // Indicate completion for the current domain to async.forEach
                callback();
            });

        }, function (error) { // Callback for async.forEach completion

            // Sort the table alphabetically by domain name (the first column)
            table.sort(function (a, b) {
                if (a[0] < b[0]) return -1;
                if (a[0] > b[0]) return 1;
                return 0;
            });

            // Output the formatted table to the console
            console.log(table.toString());
        }
    );
};