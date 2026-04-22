/*
 * This file contains the logic for spawning a daemon process.
 * It ensures strict mode for better code quality and error handling.
 */
'use strict';

// Load the 'daemon' module for process management.
var daemon = require( 'daemon' );

// Load the 'fs' (file system) module for file operations.
var fs = require( 'fs' );

/**
 * Defines the default configuration options for the daemon.
 * These options can be overridden when the daemon is spawned.
 * @type {object}
 */
var defaultOptions = {

  doAuthorization: false, /* Flag to indicate if user authorization is required */
  doSecure: false         // Flag for enabling secure communication (e.g., SSL/TLS)

};

/**
 * Main function to spawn a daemon process.
 *
 * @param {string} script - The path to the script to be run as a daemon.
 * @param {object} params - Parameters to be passed to the daemon script.
 * @param {object} [options] - Optional configuration overrides for the daemon.
 * @returns {void}
 */
module.exports = function ( script, params, options ) {
  // Ensure options are set, falling back to default options if not provided.
  options = options || defaultOptions;

  /*
   * Open the log file in append mode.
   * This file will capture stdout and stderr from the daemon process.
   */
  var logFile = fs.openSync( params.logPath, 'a' );

  // Initialize an array to hold command-line arguments for the daemon script.
  var args = [
    '-h', params.host,          // Host parameter
    '-p', params.port,          // Port parameter
    '-n', params.number,        // Number parameter
    '-l', params.lines,         // Lines parameter
    '-t', params.theme          // Theme parameter
  ];

  /*
   * Conditionally add authorization-related arguments if doAuthorization is enabled.
   * This typically involves a username and password.
   */
  if ( options.doAuthorization ) {
    args.push(
      '-U', params.user,        // User parameter
      '-P', params.password     // Password parameter
    );
  }

  /*
   * Conditionally add security-related arguments if doSecure is enabled.
   * This often includes SSL key and certificate paths.
   */
  if ( options.doSecure ) {
    args.push(
      '-k', params.key,         // Key file path
      '-c', params.certificate  // Certificate file path
    );
  }

  /*
   * Conditionally add SSH-related arguments if doSSH is enabled.
   * Used for remote host connections.
   */
  if ( options.doSSH ) {
    args.push(
      '--remote-host', params.remoteHost,       // Remote host
      '--remote-user', params.remoteUser,       // Remote user
      '--remote-port', params.remotePort        // Remote port
    );
  }

  // Add UI specific arguments based on parameters.
  if ( params.uiHideTopbar ) {
    args.push( '--ui-hide-topbar' ); // Flag to hide the UI topbar
  }

  // Check if UI indentation is disabled.
  if ( !params.uiIndent ) {
    args.push( '--ui-no-indent' );   // Flag to disable UI indentation
  }

  // Handle UI highlighting options.
  if ( params.uiHighlight ) {
    args.push(
      '--ui-highlight',                         // Enable UI highlighting
      '--ui-highlight-preset', params.uiHighlightPreset // Set the highlighting preset
    );
  }

  // Concatenate any additional arguments provided in params.args.
  args = args.concat( params.args );

  // Spawn the daemon process using the specified script and arguments.
  var proc = daemon.daemon( script, args, {
    stdout: logFile, // Redirect standard output to the log file
    stderr: logFile  // Redirect standard error to the log file
  } );

  // Write the process ID (PID) of the spawned daemon to a file.
  fs.writeFileSync( params.pidPath, proc.pid );

}; // End of module.exports function