/*
 * This file contains the core logic for managing worker processes
 * within a master process context. It uses Node.js cluster module.
 *
 * It is designed to create and monitor child worker instances.
 */

// Core Node.js modules required for event handling and utility functions.
var EventEmitter = require('events').EventEmitter;  // For event emission capabilities
var util = require('util');                        // For utility functions like 'inherits'
var cluster = require('cluster');                  // For managing worker processes

// Initialize a default logger. This will be overridden if 'opts.log' is provided.
var log = console.log;

/*
 * The Worker constructor.
 * Initializes a new Worker instance, setting up its properties and event listeners.
 *
 * @param {object} control - The cluster worker object provided by Node.js.
 * @param {object} opts    - Configuration options for the worker.
 */
var Worker = module.exports = function(control, opts)
{
  var self = this; // Capture 'this' for consistent scope referencing

  // Inherit from EventEmitter to allow custom event emissions.
  EventEmitter.call(self);

  // Store the provided options.
  self.opts = opts;

  // Store the cluster control object.
  self.control = control;

  /*
   * Configure the logging function.
   * Prioritizes a custom log function from opts, then falls back to the existing 'log' (console.log),
   * and finally to a no-op function if no logger is specified.
   */
  log = (typeof self.opts.log == 'function' && self.opts.log) || (self.opts.log && log) || function(){};

  // Start watching for events from the controlled cluster worker.
  self.watch();
};

// Make Worker inherit all methods and properties from EventEmitter.
util.inherits(Worker, EventEmitter);

/*
 * Sets up event forwarding from the cluster worker to the Worker instance.
 * This allows the master process to listen to events like 'message', 'online', etc.,
 * directly from the Worker instance.
 */
Worker.prototype.watch = function()
{
  var self = this; // Again, capture 'this' for proper scope.

  // Define the list of events to forward from the cluster worker.
  var events = [ 'message', 'online', 'listening', 'disconnect', 'error', 'exit' ];

  // Loop through each event name and set up the listener.
  for (var i = 0; i < events.length; i++)
  {
    var name = events[i]; // Current event name.

    // When the control object emits 'name', re-emit it from 'self' (this Worker instance).
    // The 'bind' method ensures that 'self.emit' is called with 'self' as its context
    // and 'name' as the first argument, followed by any original arguments from the control event.
    self.control.on(name, self.emit.bind(self, name));
  }
};

/*
 * Factory function to create and return a new Worker instance.
 * This is the primary export of this module.
 *
 * @param {object} opts - Options to be passed to the Worker constructor.
 * @returns {Worker} A new Worker instance.
 */
module.exports = function createWorker(opts)
{
  var conf = {}; // Configuration object for the new worker.

  // Copy properties from the input 'opts' to 'conf'.
  // This ensures that the options object passed to the Worker constructor
  // is a new object, preventing accidental modifications to the original 'opts'.
  for (var p in opts)
  {
    if (opts.hasOwnProperty(p))
    {
      conf[p] = opts[p]; // Copy property if it's directly on the object (not from prototype chain).
    }
  }

  // Fork a new worker process using the Node.js cluster module.
  var control = cluster.fork();

  // Return a new Worker instance, encapsulating the control object and configuration.
  return new Worker(control, conf);
};