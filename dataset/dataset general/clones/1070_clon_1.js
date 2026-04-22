/*
 * This is a configuration file.
 * It sets up the 'config' object for the module.
 * Version 1.0
 */

// Enforce strict mode for better error handling.
'use strict'
;

  var   config  =  module.exports  ;


// Define the 'node' specific configuration details.
config.node =
{
    env : 'node', // Environment setting
    tests : [
        '**/*-test.js'  // Pattern for test files
    ]
}
;