const
  util = require('util'),
  existsSync = require('fs').existsSync || require('path').existsSync,
  child_process = require('child_process'),
  events = require('events'); // Core Node.js module for event handling

// This constant defines the maximum history to consider
// when calculating the decaying factor for heuristics.
// It helps in smoothing out cost estimations for work items.
const MAX_HISTORY = 100;

/**
 * Represents a cluster of compute processes.
 * @param {object} options - Configuration options for the compute cluster.
 * @param {string} options.module - The path to the JavaScript module to be run by worker processes. This is a required parameter.
 * @param {number} [options.max_processes] - The maximum number of child processes to spawn. Defaults to CPU cores * 1.25.
 * @param {number} [options.max_backlog] - The maximum number of pending jobs in the queue before refusing new work. Defaults to max_processes * 10.
 * @param {number} [options.max_request_time] - The maximum estimated time (in seconds) a request can take before refusing new work. Defaults to 0 (no limit).
 * @constructor
 * @augments events.EventEmitter
 * @throws {string} If required options are missing or invalid.
 */
function ComputeCluster(options) {

  // Validate the 'module' option; it is essential for worker processes.
  if (!options || typeof options.module !== 'string') {
    throw "missing required 'module' argument"; // Error if module path is not provided or is not a string.
  }

  // Check if the specified module file actually exists.
  // This prevents runtime errors when workers try to load a non-existent module.
  if (!existsSync(options.module)) {
    throw "module doesn't exist: " + options.module; // Error if module file is not found.
  }

  // Validate 'max_processes' if provided.
  // It must be a positive integer.
  if (options.max_processes &&
    (typeof options.max_processes !== 'number' || options.max_processes < 1)) {
    throw "when provided, max_processes must be an integer greater than one"; // Error for invalid max_processes.
  }

  // Validate 'max_backlog' if provided.
  // It must be a number (can be negative for no limit, though typically positive).
  if (options.max_backlog && typeof options.max_backlog != 'number') {
    throw "when provided, max_backlog must be a number"; // Error for invalid max_backlog.
  }

  // Validate 'max_request_time' if provided.
  // It must be a number (typically positive, representing seconds).
  if (options.max_request_time && typeof options.max_request_time != 'number') {
    throw "when provided, max_request_time must be a number"; // Error for invalid max_request_time.
  }

  // Initialize EventEmitter capabilities for the ComputeCluster instance.
  events.EventEmitter.call(this);

  // Internal storage for child processes, keyed by their Process ID (PID).
  this._kids = {};

  // Maximum number of child processes allowed to be spawned.
  // Defaults to 125% of CPU cores if not specified in options, providing some buffer.
  this._MAX_KIDS = (options.max_processes || Math.ceil(require('os').cpus().length * 1.25));

  // The queue for pending work items. Each item is an object with 'job' and 'cb'.
  this._work_q = [];

  // Flag indicating if the cluster is in the process of shutting down.
  this._exiting = false;

  // Callback function to be executed once all child processes have exited during shutdown.
  this._exit_cb;

  // The path to the module that worker processes will execute.
  this._module = options.module;

  // Maximum number of jobs allowed in the work queue.
  // A negative value implies no limit. Defaults to 10 * _MAX_KIDS.
  this._MAX_BACKLOG = options.max_backlog || this._MAX_KIDS * 10;

  // Maximum allowed estimated time for a request to complete.
  // Defaults to 0, meaning no time limit is imposed.
  this._MAX_REQUEST_TIME = options.max_request_time || 0;

  // Keeps track of the estimated average duration of work items.
  this._work_duration = 0;

  // Counter for the total number of jobs processed.
  this._jobs_run = 0;
}

// Inherit all methods and properties from EventEmitter.
// This allows ComputeCluster instances to emit and listen for events.
util.inherits(ComputeCluster, events.EventEmitter);

/**
 * Creates a closure for the 'exit' event handler of a child worker process.
 * This function handles cleanup and error reporting when a worker process terminates.
 * @param {number} pid - The Process ID of the worker that exited.
 * @returns {function(number): void} A function that takes the exit code as an argument.
 * @private
 */
ComputeCluster.prototype._onWorkerExit = function(pid) {
  var self = this; // Capture 'this' context for use in the inner function.

  return function(code) {
    // Retrieve the worker object associated with the PID.
    var worker = self._kids[pid];

    // If the worker had an active job with a callback, inform the client about the termination.
    if (worker && worker.job && worker.job.cb) {
      worker.job.cb("compute process (" + pid + ") dies with code: " + code);
    }

    // If the cluster is not intentionally exiting, this worker's termination is an unexpected error.
    if (!self._exiting) {
      self.emit('error',
        "compute process (" + pid + ") dies with code: " + code); // Emit an error event.
    }

    // Always emit an 'info' event about the worker's exit.
    self.emit('info', "compute process (" + pid + ") exits with code " + code);

    // Remove the terminated worker from the internal _kids tracking object.
    delete self._kids[pid];

    // If a global exit callback was set (meaning the cluster is shutting down),
    // check if all workers have exited.
    if (self._exit_cb) {
      if (Object.keys(self._kids).length === 0) {
        self._exit_cb(null); // Call the exit callback once all workers are gone.
        self._exit_cb = undefined; // Clear the callback reference.
      }
    }
  };
};

/**
 * Generates an environment object suitable for a new worker process.
 * It copies the current process's environment variables but removes Node.js cluster-specific ones.
 * @returns {object} The environment object for the worker.
 * @private
 */
ComputeCluster.prototype._getEnvForWorker = function() {
  var env = {};
  // Copy all environment variables from the parent process.
  for (var i in process.env) {
    env[i] = process.env[i];
  }

  // Delete specific environment variables that might interfere with standalone worker behavior
  // or are specific to Node.js's built-in 'cluster' module, which this module bypasses.
  delete env.NODE_WORKER_ID; // Used by Node.js cluster module (v0.6).
  delete env.NODE_UNIQUE_ID; // Used by Node.js cluster module (v0.7+).

  return env;
};

/**
 * Finds an idle worker process or spawns a new one if limits allow.
 * @returns {object|undefined} An available worker object, or undefined if none can be found/spawned.
 * @private
 */
ComputeCluster.prototype._getFreeWorker = function() {
  var self = this; // Preserve 'this' context.

  // Iterate through existing workers to find one that is not currently processing a job.
  for (var i in this._kids) {
    if (!this._kids[i].job) return this._kids[i]; // Return the first free worker found.
  }

  // If no free workers are found, try to spawn a new one if the maximum limit hasn't been reached.
  if (Object.keys(this._kids).length < this._MAX_KIDS) {
    var k = {
      worker: child_process.fork( // Use child_process.fork to create a new Node.js process.
        this._module, // The module path for the worker to execute.
        [], // No command-line arguments passed to the worker.
        { env: this._getEnvForWorker() } // Set the environment for the new worker.
      )
    };
    // Attach the exit handler to the new worker process.
    k.worker.on('exit', this._onWorkerExit(k.worker.pid));
    // Store the new worker in the _kids object.
    this._kids[k.worker.pid] = k;

    // Emit an info event about the newly spawned worker.
    this.emit('info', "spawned new worker process (" + k.worker.pid + ") " +
      Object.keys(this._kids).length + "/" + this._MAX_KIDS + " processes running");

    return k; // Return the newly spawned worker.
  }

  // If no free workers and unable to spawn new ones, return undefined.
};

/**
 * Assigns a work item to a specific worker process and handles its lifecycle.
 * @param {object} work - The work item containing 'job' data and a 'cb' callback.
 * @param {object} worker - The worker object (from _kids) to which the work will be assigned.
 * @private
 */
ComputeCluster.prototype._runWorkOnWorker = function(work, worker) {
  var self = this; // Preserve 'this' context for inner functions.

  // Emit a debug event indicating which process is receiving the job.
  this.emit("debug", "passing compute job to process " + worker.worker.pid);

  var startTime = new Date(); // Record the start time for performance tracking.

  // Listen for a 'message' from the worker, which signifies job completion.
  worker.worker.once('message', function(m) {
    // Clear the 'job' property on the worker, marking it as free.
    var cb = worker.job.cb; // Store the callback before clearing the job.
    delete worker.job;

    // Attempt to assign more work from the queue, now that a worker is free.
    self._assignWork();

    // Call the client's callback with the result from the worker.
    if (cb) cb(null, m);

    // Calculate and emit debug information about the job's duration.
    var timeMS = (new Date() - startTime);
    self.emit("debug", "process " + worker.worker.pid + " completed work in " +
      (timeMS / 1000.0).toFixed(2) + "s");

    // If _MAX_REQUEST_TIME is set and enough jobs have run, update the work duration heuristic.
    // This uses a decaying average to estimate typical job duration.
    if (self._MAX_REQUEST_TIME && self._jobs_run >= (2 * self._MAX_KIDS)) {
      // Determine how much history to consider, capped by MAX_HISTORY.
      var history = (self._jobs_run > MAX_HISTORY) ? MAX_HISTORY : self._jobs_run;
      // Update the average work duration with the new job's time.
      self._work_duration = ((self._work_duration * history) + timeMS) / (history + 1);
    }

    self._jobs_run++; // Increment the total jobs run counter.
  });

  // Send the actual job data to the worker process.
  worker.worker.send(work.job);
  // Store the work object on the worker, marking it as busy.
  worker.job = work;
};

/**
 * Assigns as many work units as possible from the work queue to available compute processes.
 * It continuously tries to get a free worker and run work on it until no more workers are available
 * or the queue is empty.
 * @private
 */
ComputeCluster.prototype._assignWork = function() {
  // Loop while there are jobs in the queue.
  while (this._work_q.length > 0) {
    var worker = this._getFreeWorker(); // Try to get an available worker.
    if (!worker) break; // If no worker is available, stop assigning.

    // If a worker is found, take the next job from the queue and assign it.
    this._runWorkOnWorker(this._work_q.shift(), worker);
  }
};

/**
 * Enqueues a new work item to be processed by a worker.
 * Includes checks for maximum request time and backlog limits.
 * @param {*} args - The data to be sent to the worker for processing.
 * @param {function(Error|string|null, *): void} cb - The callback function to be invoked when the work is done or an error occurs.
 * @returns {ComputeCluster} The current ComputeCluster instance for chaining.
 */
ComputeCluster.prototype.enqueue = function(args, cb) {
  // Check against the maximum allowed request time if it's configured.
  // This check is only performed after a sufficient number of jobs have run to get a stable _work_duration.
  if (this._MAX_REQUEST_TIME && this._jobs_run > (2 * this._MAX_KIDS)) {
    var numWorkers = Object.keys(this._kids).length * 1.0; // Current number of active workers.
    if (numWorkers) {
      // Estimate how long this new work would take, considering current queue and average job duration.
      var expected = ((this._work_q.length / numWorkers) * this._work_duration + this._work_duration) / 1000.0;
      if (expected > this._MAX_REQUEST_TIME) {
        // If the estimated time exceeds the limit, refuse to enqueue.
        this.emit('info', "maximum expected work duration hit hit (work would take about " + expected +
          "s, which is greater than " + this._MAX_REQUEST_TIME + ")!  cannot enqueue!");
        // Use process.nextTick to call the callback asynchronously, matching typical Node.js behavior.
        process.nextTick(function() {
          cb("cannot enqueue work: maximum expected work duration exceeded (" + expected + "s)");
        });
        return this; // Return early, as work is not enqueued.
      }
    }
  }

  // Check against the maximum backlog size.
  if (this._MAX_BACKLOG > 0 && this._work_q.length >= this._MAX_BACKLOG) {
    // If the queue is full, refuse to enqueue more work.
    this.emit('info', "maximum work backlog hit (" + this._MAX_BACKLOG +
      ")!  cannot enqueue additional work!");
    var mb = this._MAX_BACKLOG; // Capture _MAX_BACKLOG for the closure.
    process.nextTick(function() {
      cb("cannot enqueue work: maximum backlog exceeded (" + mb + ")");
    });
    return this; // Return early.
  }

  // Add the new job and its callback to the work queue.
  this._work_q.push({ job: args, cb: cb });
  // Immediately try to assign work from the queue to available workers.
  this._assignWork();
  return this; // Allow method chaining.
};

/**
 * Initiates the shutdown of the compute cluster.
 * It gracefully terminates all child processes and invokes a callback when done.
 * @param {function(Error|null): void} [cb] - An optional callback function to be called once all workers have exited.
 * @returns {ComputeCluster} The current ComputeCluster instance for chaining.
 */
ComputeCluster.prototype.exit = function(cb) {
  // If there are no active child processes, call the callback immediately.
  if (Object.keys(this._kids).length === 0) {
    if (cb) setTimeout(function() { cb(null); }, 0); // Asynchronously call callback.
  } else {
    this._exiting = true; // Set the exiting flag.
    this._exit_cb = cb; // Store the shutdown callback.

    // Emit an info event about the shutdown process.
    this.emit('info', "exit called, shutting down " + Object.keys(this._kids).length +
      " child processes");

    // Iterate through all active workers and send a kill signal.
    for (var i in this._kids) {
      this._kids[i].worker.kill(); // Default is 'SIGTERM'.
    }
  }
  return this; // Allow method chaining.
};

// Export the ComputeCluster constructor for external use.
module.exports = ComputeCluster;