const EventBroadcaster = require('events').EventEmitter;
const nodeCluster        = require('cluster');

/**
 * Manages individual child processes (workers) within a clustered application.
 * This class abstracts away direct interaction with the Node.js cluster API,
 * providing a consistent interface for monitoring and control.
 */
class ChildProcessManager extends EventBroadcaster {
  /**
   * Initializes a new ChildProcessManager instance.
   * @param {object} subProcessRef - The reference to the child process object obtained from cluster.fork().
   * @param {object} initialConfig - Configuration parameters for this managed process.
   */
  constructor(subProcessRef, initialConfig) {
    // Ensure the base EventBroadcaster constructor is called
    super();

    // Basic input validation
    if (!subProcessRef || typeof subProcessRef.on !== 'function') {
      throw new Error("Invalid child process reference provided; 'on' method is missing.");
    }
    if (!initialConfig || typeof initialConfig !== 'object') {
      console.warn("ChildProcessManager initialized without a valid configuration object.");
      initialConfig = {}; // Default to empty object
    }

    this.managedProcess = subProcessRef;
    this.configuration = initialConfig;
    this.processIdentifier = subProcessRef.id || 'unknown';

    // Establish a flexible logging mechanism for internal operations
    this.operationLogger = (typeof this.configuration.logger === 'function')
      ? this.configuration.logger
      : (...args) => { /* Default to no-op if no logger is provided */ };

    this.operationLogger(`[CPM:${this.processIdentifier}] Initializing manager for new child process.`);

    // Set up event delegation from the child process to this manager
    this.delegateProcessEvents();
  }

  /**
   * Attaches listeners to the managed child process, re-emitting its events
   * through this manager instance. This allows external components to subscribe
   * to worker events via the ChildProcessManager.
   */
  delegateProcessEvents() {
    const monitoredEvents = ['message', 'online', 'listening', 'disconnect', 'error', 'exit'];

    // Iterate through the predefined events and bind them
    for (const eventName of monitoredEvents) {
      this.managedProcess.on(eventName, (...eventArgs) => {
        // Log the event for debugging purposes
        this.operationLogger(`[CPM:${this.processIdentifier}] Event '${eventName}' received.`);
        // Re-emit the event with its original arguments
        this.emit(eventName, ...eventArgs);
      });
    }
    this.operationLogger(`[CPM:${this.processIdentifier}] Delegated ${monitoredEvents.length} events from child process.`);
  }
}

/**
 * Factory function to create and manage a new child process worker.
 * This is the primary entry point for spawning workers.
 * @param {object} processOptions - Options to configure the new worker.
 * @returns {ChildProcessManager} An instance of the ChildProcessManager for the newly spawned worker.
 */
module.exports = function spawnManagedChildProcess(processOptions) {
  // Ensure processOptions is a valid object, default to empty if not
  const effectiveConfiguration = (processOptions && typeof processOptions === 'object')
    ? { ...processOptions } // Deep clone using spread operator for safety
    : {};

  // Log creation attempt if a logger is available
  const currentLogger = (typeof effectiveConfiguration.logger === 'function')
    ? effectiveConfiguration.logger
    : console.log; // Fallback to console.log for factory

  currentLogger("Attempting to fork a new worker process from the cluster.");

  // Fork a new worker process using the Node.js cluster API
  const newChildProcessInstance = nodeCluster.fork();

  // Create and return a manager for this new child process
  const managerInstance = new ChildProcessManager(newChildProcessInstance, effectiveConfiguration);

  currentLogger(`Successfully initiated manager for worker ID: ${managerInstance.processIdentifier}`);

  return managerInstance;
};