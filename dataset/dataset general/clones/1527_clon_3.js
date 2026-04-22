const { EventEmitter } = require('events');
const { fork } = require('child_process');
const { existsSync: checkFileExistence } = require('fs');
const os = require('os');
const path = require('path');

// Constant defining the historical window size for average task duration calculation.
const DECAY_FACTOR_LIMIT = 100;

/**
 * Manages a dynamic pool of child processes (workers) to execute computational tasks.
 * Inherits from EventEmitter to provide a mechanism for logging and error reporting.
 */
class WorkerPoolManager extends EventEmitter {
    /**
     * Constructs a new WorkerPoolManager instance, setting up its configuration and initial state.
     * @param {object} initConfig - Configuration object for the worker pool.
     * @param {string} initConfig.workerScriptPath - Absolute or relative path to the worker module script.
     * @param {number} [initConfig.maxConcurrentWorkers] - Maximum number of worker processes to run simultaneously.
     * @param {number} [initConfig.maxPendingTasks] - Maximum number of tasks allowed in the queue before rejection.
     * @param {number} [initConfig.maxExpectedTaskDuration] - Maximum estimated task completion time (in seconds) before new tasks are rejected.
     * @throws {Error} If critical configuration is missing or invalid.
     */
    constructor(initConfig) {
        super(); // Initialize EventEmitter base class

        // --- Configuration Validation ---
        if (!initConfig || typeof initConfig.workerScriptPath !== 'string') {
            throw new Error("Initialization error: Required 'workerScriptPath' argument is missing or invalid.");
        }

        const resolvedScriptPath = path.resolve(initConfig.workerScriptPath);
        if (!checkFileExistence(resolvedScriptPath)) {
            throw new Error(`Initialization error: Worker script not found at specified path: '${resolvedScriptPath}'.`);
        }

        if (initConfig.maxConcurrentWorkers !== undefined) {
            if (!Number.isInteger(initConfig.maxConcurrentWorkers) || initConfig.maxConcurrentWorkers < 1) {
                throw new Error("Configuration error: 'maxConcurrentWorkers' must be a positive integer.");
            }
        }

        if (initConfig.maxPendingTasks !== undefined && typeof initConfig.maxPendingTasks !== 'number') {
            throw new Error("Configuration error: 'maxPendingTasks' must be a numeric value.");
        }

        if (initConfig.maxExpectedTaskDuration !== undefined && typeof initConfig.maxExpectedTaskDuration !== 'number') {
            throw new Error("Configuration error: 'maxExpectedTaskDuration' must be a numeric value.");
        }

        // --- Internal State Initialization ---
        this._activeWorkers = {}; // Stores worker objects indexed by PID
        this._workerModulePath = resolvedScriptPath;
        this._isShuttingDown = false;
        this._shutdownCallback = null; // Callback for when all workers have exited during shutdown

        // --- Derived Configuration Properties ---
        this._MAX_PARALLEL_WORKERS = initConfig.maxConcurrentWorkers || Math.ceil(os.cpus().length * 1.25);
        if (this._MAX_PARALLEL_WORKERS < 1) { // Ensure at least one worker is allowed
            this._MAX_PARALLEL_WORKERS = 1;
        }

        this._MAX_QUEUED_TASKS = initConfig.maxPendingTasks || (this._MAX_PARALLEL_WORKERS * 10);
        this._MAX_TASK_EXPECTED_TIME_SECONDS = initConfig.maxExpectedTaskDuration || 0; // 0 indicates no time limit check

        // --- Task Queue & Heuristics ---
        this._taskQueue = []; // Queue for pending tasks
        this._avgTaskProcessingTimeMs = 0; // Running average of task processing time in milliseconds
        this._processedTaskCount = 0; // Counter for processed tasks, used in heuristics
    }

    /**
     * Generates a sanitized environment object for new worker processes.
     * It copies the current process's environment variables and removes any
     * Node.js cluster-specific identifiers to prevent unintended behavior.
     * @returns {object} A clean environment variable object.
     * @private
     */
    _prepareWorkerEnvVariables() {
        const workerEnvironment = { ...process.env }; // Create a shallow copy

        // Remove Node.js cluster-related environment variables
        delete workerEnvironment.NODE_WORKER_ID;
        delete workerEnvironment.NODE_UNIQUE_ID;

        return workerEnvironment;
    }

    /**
     * Creates a closure to handle the 'exit' event of a child worker process.
     * This method manages cleanup, error reporting, and shutdown completion.
     * @param {number} processId - The Process ID of the worker that exited.
     * @returns {Function} An event handler for the worker's 'exit' event.
     * @private
     */
    _handleWorkerTermination(processId) {
        const managerContext = this; // Capture 'this' for the closure

        return (exitCode) => {
            const terminatedWorker = managerContext._activeWorkers[processId];

            // If the worker was busy, notify its task's completion callback of the failure.
            if (terminatedWorker?.assignedTask?.completionCallback) {
                terminatedWorker.assignedTask.completionCallback(
                    new Error(`Worker process (PID: ${processId}) terminated unexpectedly with exit code: ${exitCode}.`)
                );
            }

            // If not in a graceful shutdown, an exit is considered an error.
            if (!managerContext._isShuttingDown) {
                managerContext.emit('error',
                    `Worker process (PID: ${processId}) exited unexpectedly with code: ${exitCode}.`);
            }

            managerContext.emit('worker:terminated', { processId, exitCode, unexpected: !managerContext._isShuttingDown });
            managerContext.emit('info', `Worker process (PID: ${processId}) exited with code ${exitCode}.`);

            delete managerContext._activeWorkers[processId]; // Remove worker from the active pool

            // During shutdown, check if all workers have exited.
            if (managerContext._isShuttingDown && managerContext._shutdownCallback) {
                if (Object.keys(managerContext._activeWorkers).length === 0) {
                    managerContext._shutdownCallback(null); // All workers gone, call the final shutdown callback
                    managerContext._shutdownCallback = null; // Clear the callback reference
                }
            }
        };
    }

    /**
     * Attempts to find an idle worker process or spawn a new one if capacity allows.
     * @returns {object|null} A worker entry object if an available worker is found or spawned, otherwise null.
     * @private
     */
    _locateAvailableWorker() {
        // Prioritize finding an existing idle worker
        for (const workerEntry of Object.values(this._activeWorkers)) {
            if (!workerEntry.assignedTask) { // Worker is not currently busy
                return workerEntry;
            }
        }

        // If no idle workers, try to create a new one if below max capacity
        const currentActiveWorkerCount = Object.keys(this._activeWorkers).length;
        if (currentActiveWorkerCount < this._MAX_PARALLEL_WORKERS) {
            const newWorkerDetails = {
                processInstance: fork(
                    this._workerModulePath,
                    [], // No command-line arguments for the worker script
                    { env: this._prepareWorkerEnvVariables() }
                ),
                assignedTask: null // New worker starts unassigned
            };

            const newWorkerPid = newWorkerDetails.processInstance.pid;
            newWorkerDetails.processInstance.on('exit', this._handleWorkerTermination(newWorkerPid));
            this._activeWorkers[newWorkerPid] = newWorkerDetails; // Add to our map of active workers

            this.emit('worker:spawned', {
                processId: newWorkerPid,
                currentActive: Object.keys(this._activeWorkers).length,
                maxAllowed: this._MAX_PARALLEL_WORKERS
            });
            this.emit('info', `Spawned new worker process (PID: ${newWorkerPid}). Active pool: ${Object.keys(this._activeWorkers).length}/${this._MAX_PARALLEL_WORKERS}.`);

            return newWorkerDetails;
        }

        // No free worker and cannot spawn more, so return null
        return null;
    }

    /**
     * Dispatches a specific task from the queue to an available worker process.
     * Manages the worker's state and updates task completion heuristics.
     * @param {object} taskPayload - The task object containing 'jobData' and 'completionCallback'.
     * @param {object} workerEntry - The worker object to which the task will be assigned.
     * @private
     */
    _dispatchTaskToWorker(taskPayload, workerEntry) {
        const managerContext = this;
        this.emit("debug", `Dispatching task to worker process (PID: ${workerEntry.processInstance.pid}).`);

        const taskStartTimeMs = Date.now(); // Record start time in milliseconds

        workerEntry.assignedTask = taskPayload; // Mark the worker as busy with this task

        workerEntry.processInstance.once('message', (responsePayload) => {
            // Store callback before clearing the task, in case the worker entry is reused
            const taskCompletionCb = workerEntry.assignedTask.completionCallback;

            workerEntry.assignedTask = null; // Worker is now free

            // Attempt to assign the next pending task, as a worker just became free
            managerContext._attemptTaskAssignment();

            // Invoke the original client's callback
            if (taskCompletionCb) {
                taskCompletionCb(null, responsePayload);
            }

            // Log performance metrics
            const taskDurationMs = Date.now() - taskStartTimeMs;
            managerContext.emit("debug", `Worker (PID: ${workerEntry.processInstance.pid}) completed task in ${(taskDurationMs / 1000.0).toFixed(3)}s.`);

            // Update average task processing time for queue estimation
            if (managerContext._MAX_TASK_EXPECTED_TIME_SECONDS > 0 && managerContext._processedTaskCount >= (2 * managerContext._MAX_PARALLEL_WORKERS)) {
                // Use a decaying average, favoring recent history up to DECAY_FACTOR_LIMIT
                const currentHistoryWindow = Math.min(managerContext._processedTaskCount, DECAY_FACTOR_LIMIT);
                managerContext._avgTaskProcessingTimeMs =
                    ((managerContext._avgTaskProcessingTimeMs * currentHistoryWindow) + taskDurationMs) / (currentHistoryWindow + 1);
            }

            managerContext._processedTaskCount++; // Increment total tasks processed
        });

        // Send the actual job data to the worker process
        workerEntry.processInstance.send(taskPayload.jobData);
    }

    /**
     * Continuously attempts to assign tasks from the internal queue to available workers.
     * Stops when the queue is empty or no workers are available/can be spawned.
     * @private
     */
    _attemptTaskAssignment() {
        while (this._taskQueue.length > 0) {
            const availableWorker = this._locateAvailableWorker();
            if (!availableWorker) {
                this.emit('debug', 'No available workers or capacity to spawn new ones. Pausing task assignment attempts.');
                break; // No worker found or created, cannot assign more tasks for now
            }

            const nextTaskInQueue = this._taskQueue.shift(); // Get the next task (FIFO)
            if (nextTaskInQueue) {
                this._dispatchTaskToWorker(nextTaskInQueue, availableWorker);
            }
        }
    }

    /**
     * Submits a new task to the worker pool for execution.
     * The task will be queued and processed by an available worker.
     * @param {any} taskArguments - The data payload to be sent to the worker process.
     * @param {Function} taskCompletionCallback - A callback function `(error, result)` to be invoked when the task completes or fails.
     * @returns {WorkerPoolManager} Returns the instance for method chaining.
     */
    submitTask(taskArguments, taskCompletionCallback) {
        // --- Pre-submission Validations ---

        // 1. Guard against submission during shutdown
        if (this._isShuttingDown) {
            process.nextTick(() => { // Ensure callback is async
                taskCompletionCallback(new Error("Submission failed: Worker pool is currently shutting down."));
            });
            return this;
        }

        // 2. Check estimated task duration if a limit is configured
        if (this._MAX_TASK_EXPECTED_TIME_SECONDS > 0 && this._processedTaskCount >= (2 * this._MAX_PARALLEL_WORKERS)) {
            const currentActiveWorkerCount = Object.keys(this._activeWorkers).length;
            if (currentActiveWorkerCount > 0) {
                // Estimate time for this task to be processed, considering current queue and average task time.
                const estimatedTotalExecutionTimeSeconds =
                    ((this._taskQueue.length / currentActiveWorkerCount) * this._avgTaskProcessingTimeMs + this._avgTaskProcessingTimeMs) / 1000.0;

                if (estimatedTotalExecutionTimeSeconds > this._MAX_TASK_EXPECTED_TIME_SECONDS) {
                    this.emit('warning', `Task rejected: Estimated execution time (${estimatedTotalExecutionTimeSeconds.toFixed(2)}s) exceeds maximum allowed (${this._MAX_TASK_EXPECTED_TIME_SECONDS}s).`);
                    process.nextTick(() => {
                        taskCompletionCallback(new Error(`Submission failed: Estimated execution time (${estimatedTotalExecutionTimeSeconds.toFixed(2)}s) exceeds limit.`));
                    });
                    return this;
                }
            }
        }

        // 3. Check against maximum pending tasks backlog
        if (this._MAX_QUEUED_TASKS > 0 && this._taskQueue.length >= this._MAX_QUEUED_TASKS) {
            const currentBacklogLimit = this._MAX_QUEUED_TASKS;
            this.emit('warning', `Task rejected: Maximum task backlog (${currentBacklogLimit}) has been reached.`);
            process.nextTick(() => {
                taskCompletionCallback(new Error(`Submission failed: Maximum backlog limit (${currentBacklogLimit}) exceeded.`));
            });
            return this;
        }

        // --- Task Acceptance ---
        this._taskQueue.push({ jobData: taskArguments, completionCallback: taskCompletionCallback });
        this._attemptTaskAssignment(); // Try to process the new task immediately

        return this;
    }

    /**
     * Initiates a graceful shutdown of all active worker processes.
     * All currently running tasks will be allowed to complete, but no new tasks will be accepted.
     * @param {Function} [onShutdownComplete] - An optional callback `(error)` to be executed once all workers have exited.
     * @returns {WorkerPoolManager} Returns the instance for method chaining.
     */
    initiateShutdown(onShutdownComplete) {
        const currentlyActivePids = Object.keys(this._activeWorkers);
        const numberOfActiveWorkers = currentlyActivePids.length;

        if (numberOfActiveWorkers === 0) {
            if (onShutdownComplete) {
                process.nextTick(() => onShutdownComplete(null)); // Ensure async callback
            }
        } else {
            this._isShuttingDown = true;
            this._shutdownCallback = onShutdownComplete;

            this.emit('info', `Initiating graceful shutdown for ${numberOfActiveWorkers} active worker processes.`);

            // Send termination signals to all active workers
            for (const pid of currentlyActivePids) {
                const workerToTerminate = this._activeWorkers[pid];
                if (workerToTerminate?.processInstance) {
                    workerToTerminate.processInstance.kill(); // Sends SIGTERM by default
                    this.emit('debug', `Sent termination signal to worker (PID: ${pid}).`);
                }
            }
        }
        return this;
    }
}

module.exports = WorkerPoolManager;