/*
 * Copyright (c) 2012 Kuba Niegowski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * This file contains the core Daemon class for managing background processes.
 */

"use strict"; // Enforce strict mode for cleaner code.

// Require necessary Node.js modules and custom constants.
var fs           = require("fs"),
    path         = require("path"),
    util         = require("util"),
    constants    = require("./constants"),
    spawn        = require("child_process").spawn, // Used to create child processes.
    EventEmitter = require("events").EventEmitter; // For event handling.


/**
 * Sets up and returns a new Daemon instance.
 * @param {Object} options - Configuration options for the daemon.
 * @returns {Daemon} A new Daemon instance.
 */
exports.setup = function(options) {
  return new Daemon(options);
};

/**
 * Daemon constructor function.
 * @param {Object} options - Configuration options.
 */
var Daemon = function(options) {
  // Call the EventEmitter constructor to inherit its properties.
  EventEmitter.call(this);

  // Validate the 'main' option, which specifies the daemon's entry point.
  if ( ! options.main ) {
    throw new Error("Expected 'main' option for daemonize");
  }

  // Resolve paths and names for the daemon.
  var dir  = path.dirname(module.parent.filename),
      main = path.resolve(dir, options.main),
      name = options.name || path.basename(main, ".js");

  // Ensure the main module file exists.
  if ( ! this._isFile(main) ) {
    throw new Error("Can't find daemon main module: '" + main + "'");
  }

  // Initialize options object.
  this._options = {};

  // Perform a shallow copy of provided options.
  for ( var arg in options ) {
    this._options[arg] = options[arg];
  }

  // Set normalized main path and name.
  this._options.main = main;
  this._options.name = this.name = name;

  // Determine the PID file path.
  this._options.pidfile = options.pidfile
                        ? path.resolve(dir, options.pidfile)
                        : path.join("/var/run", name + ".pid");

  // Set user and group for process, if specified.
  this._options.user  = options.user  || "";
  this._options.group = options.group || "";

  // Handle umask option.
  if ( typeof options.umask == "undefined" ) {
    this._options.umask = 0;
  }
  else if ( typeof options.umask == "string" ) {
    this._options.umask = parseInt(options.umask);
  }

  // Normalize arguments into arrays.
  this._options.args = this._makeArray(options.args);
  this._options.argv = this._makeArray(options.argv || process.argv.slice(2));

  // Set stop timeout.
  this._stopTimeout = options.stopTimeout || 2000;

  // Initialize child process event handlers.
  this._childExitHandler       = null;
  this._childDisconnectHandler = null;
  this._childDisconnectTimer   = null;

  // Bind console listeners if not in silent mode.
  if ( ! options.silent ) {
    this._bindConsole();
  }
};

// Inherit EventEmitter prototype methods.
util.inherits(Daemon, EventEmitter);


/**
 * Starts the daemon process.
 * @param {Function} [listener] - Callback function (err, pid).
 * @returns {Daemon} The current Daemon instance.
 */
Daemon.prototype.start = function(listener) {

  // First, check if the daemon is already running.
  var pid = this._sendSignal(this._getpid());

  if ( pid ) {
    this.emit("running", pid);
    if ( listener ) {
      listener(null, pid);
    }
    return this;
  }

  // If a listener is provided, set up event handlers for 'error' and 'started'.
  if ( listener ) {
    var errorFunc, startedFunc;

    this.once("error", errorFunc = function(err) {
      this.removeListener("started", startedFunc);
      listener(err, 0);
    }.bind(this));

    this.once("started", startedFunc = function(pid) {
      this.removeListener("error", errorFunc);
      listener(null, pid);
    }.bind(this));
  }

  // Emit a 'starting' event.
  this.emit("starting");

  // Attempt to save an empty PID to check write permissions for the pidfile.
  var err = this._savepid("");
  if ( err ) {
    this.emit("error", new Error("Failed to write pidfile (" + err + ")"));
    return this;
  }

  // Spawn the child process that will become the daemon.
  var child = spawn(process.execPath, (this._options.args || []).concat([
          __dirname + "/wrapper.js" // The wrapper script handles daemonization.
        ]).concat(this._options.argv), {
          env: process.env,                              // Inherit environment variables.
          stdio: ["ignore", "ignore", "ignore", "ipc"],  // Ignore stdio, use IPC channel.
          detached: true                                 // Detach the child process.
        }
  );
  pid = child.pid; // Get the PID of the newly spawned child.

  // Save the actual PID to the pidfile.
  this._savepid(pid);

  // Set up a listener for messages from the child process.
  // This is primarily for rethrowing errors from the daemonized process.
  child.on("message", function(msg) {
    if ( msg.type == "error" ) {
      throw new Error(msg.error);
    }
  });

  // Handle the child process 'exit' event.
  // The wrapper.js script will use specific exit codes.
  child.once("exit", this._childExitHandler = function(code, signal) {

    // Clean up disconnect handlers and timers.
    child.removeListener("disconnect", this._childDisconnectHandler);
    clearTimeout(this._childDisconnectTimer);

    if ( code > 0 ) {
      // If exit code is greater than 0, it indicates an error.
      this.emit("error", new Error(
          code > 1
          ? constants.findExitCode(code) // Custom exit code mapping.
          : "Module '" + this._options.main + "' stopped unexpected"
      ));
    } else {
      // Successful exit (code 0).
      this.emit("stopped");
    }

  }.bind(this));

  // Handle the child process 'disconnect' event (IPC channel closed).
  child.once("disconnect", this._childDisconnectHandler = function() {

    // Set a timeout to check if the child is still running after a short delay.
    // This is to differentiate between an intentional exit and a start failure.
    this._childDisconnectTimer = setTimeout(function() {

      // Remove the exit listener as we're now handling the disconnect.
      child.removeListener("exit", this._childExitHandler);

      // Check if the process is still alive.
      if ( this._sendSignal(pid) ) {
        this.emit("started", pid); // Daemon successfully started.
      } else {
        this.emit("error", new Error("Daemon failed to start")); // Daemon died unexpectedly.
      }

    }.bind(this), 100); // Check after 100 milliseconds.
  }.bind(this));

  // Send an initialization message to the child process via IPC.
  child.send({ type: "init", options: this._options });

  // Detach the child process from the parent's event loop.
  // This allows the parent process to exit independently.
  child.unref();

  return this;
};


/**
 * Stops the daemon process gracefully.
 * Sends SIGTERM by default.
 * @param {Function} [listener] - Callback function (err, pid).
 * @param {Array<string>} [signals] - Array of signals to try (e.g., ["SIGTERM", "SIGKILL"]).
 * @param {number} [timeout] - Time in ms to wait between signals.
 * @returns {Daemon} The current Daemon instance.
 */
Daemon.prototype.stop = function(listener, signals, timeout) {
  // Calls the internal _kill method with SIGTERM as the primary signal.
  return this._kill(signals || ["SIGTERM"], timeout || 0, listener);
};


/**
 * Kills the daemon process forcefully.
 * Sends SIGTERM then SIGKILL by default.
 * @param {Function} [listener] - Callback function (err, pid).
 * @param {Array<string>} [signals] - Array of signals to try.
 * @param {number} [timeout] - Time in ms to wait between signals.
 * @returns {Daemon} The current Daemon instance.
 */
Daemon.prototype.kill = function(listener, signals, timeout) {
  // Calls the internal _kill method with SIGTERM and SIGKILL.
  return this._kill(signals || ["SIGTERM", "SIGKILL"], timeout || 0, listener);
};


/**
 * Checks the status of the daemon.
 * @returns {number} The PID if running, 0 otherwise.
 */
Daemon.prototype.status = function() {
  return this._sendSignal(this._getpid());
};


/**
 * Sends a specific signal to the daemon process.
 * @param {string} signal - The signal to send (e.g., "SIGHUP").
 * @returns {number} The PID if the signal was sent, 0 otherwise.
 */
Daemon.prototype.sendSignal = function(signal) {
  return this._sendSignal(this._getpid(), signal);
};


/**
 * Ensures an argument is an array. If it's a string, it's split by whitespace.
 * @param {*} args - The argument to convert.
 * @returns {Array} An array of arguments.
 * @private
 */
Daemon.prototype._makeArray = function(args) {
  if ( typeof args == "undefined" ) {
    return [];
  }
  if ( typeof args == "string" ) {
    // Split string by whitespace and filter out empty strings.
    return args.trim().split(/\s+/).filter(function(arg) { return !!arg; });
  }
  return args;
};


/**
 * Reads the PID from the pidfile.
 * @returns {number} The PID read from the file, or 0 if not found/error.
 * @private
 */
Daemon.prototype._getpid = function() {
  try {
    // Read the PID file and parse its content as an integer.
    return parseInt(fs.readFileSync(this._options.pidfile));
  }
  catch ( err ) {
    // Ignore errors (e.g., file not found).
  }

  return 0;
};


/**
 * Saves the given PID to the pidfile.
 * @param {number|string} pid - The PID to save.
 * @returns {string} An empty string on success, or an error code on failure.
 * @private
 */
Daemon.prototype._savepid = function(pid) {
  try {
    // Write the PID followed by a newline to the file.
    fs.writeFileSync(this._options.pidfile, pid + "\n");
  }
  catch ( ex ) {
    return ex.code; // Return the error code.
  }
  return ""; // Success.
};


/**
 * Sends a signal to a process identified by PID.
 * @param {number} pid - The process ID.
 * @param {string} [signal] - The signal to send (default 0 for checking existence).
 * @returns {number} The PID if the signal was sent successfully, 0 otherwise.
 * @private
 */
Daemon.prototype._sendSignal = function(pid, signal) {

  if ( ! pid ) {
    return 0; // No PID provided.
  }

  try {
    // Attempt to send the signal.
    process.kill(pid, signal || 0);
    return pid; // Signal sent successfully, process exists.
  }
  catch ( err ) {
    // Error, process likely doesn't exist.
  }

  return 0; // Failed to send signal.
};


/**
 * Internal method to kill a daemon process.
 * Manages sending multiple signals with timeouts.
 * @param {number} pid - The process ID to kill.
 * @param {Array<string>} signals - An array of signals to send in sequence.
 * @param {number} timeout - Time in ms to wait between signals.
 * @param {Function} callback - Callback function (pid) when process is killed.
 * @returns {Daemon} The current Daemon instance.
 * @private
 */
Daemon.prototype._kill = function(signals, timeout, listener) {

  var pid = this._sendSignal(this._getpid());

  if ( ! pid ) {
    this.emit("notrunning");
    if ( listener ) {
      listener(null, 0);
    }
    return this;
  }

  if ( listener ) {
    this.once("stopped", function(pid) {
      listener(null, pid);
    });
  }

  this.emit("stopping");

  // Start the recursive kill attempt.
  this._tryKill(pid, signals, timeout, function(pid) {

    // Attempt to remove the PID file after the daemon has stopped.
    try {
      fs.unlinkSync(this._options.pidfile);
    }
    catch ( ex ) {
      /* ignore */
    }

    this.emit("stopped", pid);

  }.bind(this));

  return this;
};


/**
 * Recursive helper for sending signals until a process is dead.
 * @param {number} pid - The process ID.
 * @param {Array<string>} signals - Remaining signals to try.
 * @param {number} timeout - Time in ms to wait before next signal.
 * @param {Function} callback - Callback when process is no longer running.
 * @returns {boolean} True if the process was confirmed dead, false otherwise.
 * @private
 */
Daemon.prototype._tryKill = function(pid, signals, timeout, callback) {

  // If the process is no longer running, execute the callback.
  if ( ! this._sendSignal(pid, signals.length > 1 ? signals.shift() : signals[0]) ) {
    if ( callback ) {
      callback(pid);
    }
    return true;
  }

  // If still running, wait for the timeout and try again.
  setTimeout(this._tryKill.bind(this, pid, signals, timeout, callback), timeout || this._stopTimeout);
  return false;
};


/**
 * Checks if a given path points to an existing file (not a directory).
 * @param {string} path - The file path to check.
 * @returns {boolean} True if it's a file, false otherwise.
 * @private
 */
Daemon.prototype._isFile = function(path) {

  try {
    var stat = fs.statSync(path);
    if ( stat && ! stat.isDirectory() ) {
      return true; // It's a file.
    }
  }
  catch ( err ) {
    // Path does not exist or is inaccessible.
  }

  return false;
};


/**
 * Binds console logging to various daemon lifecycle events.
 * This provides verbose output during daemon operations.
 * @private
 */
Daemon.prototype._bindConsole = function() {

  this
    .on("starting", function() {
      console.log("Starting " + this.name + " daemon...");
    })
    .on("started", function(pid) {
      console.log(this.name + " daemon started. PID: " + pid);
    })
    .on("stopping", function() {
      console.log("Stopping " + this.name + " daemon...");
    })
    .on("stopped", function(pid) {
      // pid is undefined when daemon stops naturally
      console.log(this.name + " daemon stopped.");
    })
    .on("running", function(pid) {
      console.log(this.name + " daemon already running. PID: " + pid);
    })
    .on("notrunning", function() {
      console.log(this.name + " daemon is not running");
    })
    .on("error", function(err) {
      console.log(this.name + " daemon failed to start:  " + err.message);
    });

};