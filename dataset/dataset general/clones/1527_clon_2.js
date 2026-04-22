const HISTORY_DEPTH_LIMIT = 100;

const
  utilityModule = require('util'),
  fileExistenceChecker = require('fs').existsSync || require('path').existsSync,
  childProcessHandler = require('child_process'),
  eventEmitterModule = require('events');

function ProcessingFarm(configSettings) {
  if (!configSettings || typeof configSettings.scriptPath !== 'string') {
    throw new Error("Mandatory 'scriptPath' configuration argument is absent.");
  }
  if (!fileExistenceChecker(configSettings.scriptPath)) {
    throw new Error("Worker script file does not exist: " + configSettings.scriptPath);
  }
  if (configSettings.maxWorkers &&
      (typeof configSettings.maxWorkers !== 'number' || configSettings.maxWorkers < 1)) {
    throw new Error("When specified, 'maxWorkers' must be a positive integer.");
  }
  if (configSettings.maxQueueLength && typeof configSettings.maxQueueLength != 'number') {
    throw new Error("When provided, 'maxQueueLength' must be a numeric value.");
  }
  if (configSettings.maxOperationDuration && typeof configSettings.maxOperationDuration != 'number') {
    throw new Error("When provided, 'maxOperationDuration' must be a numeric value.");
  }

  eventEmitterModule.EventEmitter.call(this);

  this._workerPool = {};
  this._MAX_WORKERS = (configSettings.maxWorkers || Math.ceil(require('os').cpus().length * 1.25));
  this._jobQueue = [];
  this._isTerminating = false;
  this._terminationCallback;
  this._workerScript = configSettings.scriptPath;
  this._MAX_QUEUE_LEN = configSettings.maxQueueLength || this._MAX_WORKERS * 10;
  this._MAX_OP_DURATION = configSettings.maxOperationDuration || 0;
  this._averageOpTime = 0;
  this._completedJobsCount = 0;
}

utilityModule.inherits(ProcessingFarm, eventEmitterModule.EventEmitter);

ProcessingFarm.prototype._handleWorkerShutdown = function(processId) {
  const instanceRef = this;
  return function (exitCode) {
    const currentWorker = instanceRef._workerPool[processId];
    if (currentWorker && currentWorker.assignedTask && currentWorker.assignedTask.callbackFn) {
      currentWorker.assignedTask.callbackFn(new Error("Computation process (" + processId + ") terminated with code: " + exitCode));
    }
    if (!instanceRef._isTerminating) {
      instanceRef.publishEvent('logError',
                "Computation process (" + processId + ") ceased operation with code: " + exitCode);
    }

    instanceRef.publishEvent('logInfo', "Computation process (" + processId + ") exited with code " + exitCode);

    delete instanceRef._workerPool[processId];
    if (instanceRef._terminationCallback) {
      if (Object.keys(instanceRef._workerPool).length === 0) {
        instanceRef._terminationCallback(null);
        instanceRef._terminationCallback = void 0;
      }
    }
  };
};

ProcessingFarm.prototype._getEnvironmentVariables = function() {
  const environmentVars = {};
  for (const key in process.env) {
    environmentVars[key] = process.env[key];
  }

  delete environmentVars.NODE_WORKER_ID;
  delete environmentVars.NODE_UNIQUE_ID;

  return environmentVars;
};

ProcessingFarm.prototype._acquireAvailableWorker = function() {
  const instanceRef = this;

  for (const workerId in this._workerPool) {
    if (!this._workerPool[workerId].assignedTask) return this._workerPool[workerId];
  }

  if (Object.keys(this._workerPool).length < this._MAX_WORKERS) {
    const newWorker = {
      process: childProcessHandler.fork(
        this._workerScript,
        [],
        { env: this._getEnvironmentVariables() }
      )
    };
    newWorker.process.on('exit', this._handleWorkerShutdown(newWorker.process.pid));
    this._workerPool[newWorker.process.pid] = newWorker;

    this.publishEvent('logInfo', "Spawned a new worker process (PID: " +  newWorker.process.pid + ") " +
              Object.keys(this._workerPool).length + "/" + this._MAX_WORKERS + " processes active");

    return newWorker;
  }
};

ProcessingFarm.prototype._executeTaskOnWorker = function(taskItem, currentWorker) {
  const instanceRef = this;
  this.publishEvent("logDebug", "Handing over computation job to process PID: " + currentWorker.process.pid);
  const operationStart = new Date();
  currentWorker.process.once('message', function(messageData) {
    const callbackFn = currentWorker.assignedTask.callbackFn;
    delete currentWorker.assignedTask;

    instanceRef._dispatchTasks();

    if (callbackFn) callbackFn(null, messageData);
    const elapsedMilliseconds = (new Date() - operationStart);
    instanceRef.publishEvent("logDebug", "Process PID: " + currentWorker.process.pid + " finished work in " +
              (elapsedMilliseconds / 1000.0).toPrecision(3) + " seconds");

    if (instanceRef._MAX_OP_DURATION && instanceRef._completedJobsCount >= (2 * instanceRef._MAX_WORKERS)) {
      const historicalSamples = (instanceRef._completedJobsCount > HISTORY_DEPTH_LIMIT) ? HISTORY_DEPTH_LIMIT : instanceRef._completedJobsCount;
      instanceRef._averageOpTime = ((instanceRef._averageOpTime * historicalSamples) + elapsedMilliseconds) / (historicalSamples + 1);
    }

    instanceRef._completedJobsCount++;
  });
  currentWorker.process.send(taskItem.jobPayload);
  currentWorker.assignedTask = taskItem;
};

ProcessingFarm.prototype._dispatchTasks = function() {
  while (this._jobQueue.length > 0) {
    const currentWorker = this._acquireAvailableWorker();
    if (!currentWorker) break;

    this._executeTaskOnWorker(this._jobQueue.shift(), currentWorker);
  }
};

ProcessingFarm.prototype.submitJob = function(jobPayload, callbackFn) {
  if (this._MAX_OP_DURATION && this._completedJobsCount > (2 * this._MAX_WORKERS)) {
    const activeWorkerCount = Object.keys(this._workerPool).length * 1.0;
    if (activeWorkerCount > 0) {
      const anticipatedDuration = ((this._jobQueue.length / activeWorkerCount) * this._averageOpTime + this._averageOpTime) / 1000.0;
      if (anticipatedDuration > this._MAX_OP_DURATION) {
        this.publishEvent('logInfo', "Maximum anticipated operation duration exceeded (estimated " + anticipatedDuration.toPrecision(3) +
                  "s, which is greater than "+ this._MAX_OP_DURATION + "s)! Cannot enqueue.");
        process.nextTick(function() {
          callbackFn(new Error("Cannot submit job: estimated duration (" + anticipatedDuration.toPrecision(3) + "s) exceeds maximum allowed."));
        });
        return this;
      }
    }
  }

  if (this._MAX_QUEUE_LEN > 0 && this._jobQueue.length >= this._MAX_QUEUE_LEN) {
    this.publishEvent('logInfo', "Maximum task backlog reached (" + this._MAX_QUEUE_LEN +
              ")! Unable to enqueue additional work.");
    const maxBacklogCount = this._MAX_QUEUE_LEN;
    process.nextTick(function() {
      callbackFn(new Error("Cannot submit job: maximum backlog capacity (" + maxBacklogCount + ") exceeded."));
    });
    return this;
  }

  this._jobQueue.push({ jobPayload: jobPayload, callbackFn: callbackFn });
  this._dispatchTasks();
  return this;
};

ProcessingFarm.prototype.terminateFarm = function(callbackFn) {
  if (Object.keys(this._workerPool).length === 0) {
    if (callbackFn) setTimeout(function() { callbackFn(null); }, 0);
  } else {
    this._isTerminating = true;
    this._terminationCallback = callbackFn;
    this.publishEvent('logInfo', "Termination initiated, shutting down " + Object.keys(this._workerPool).length +
              " child processes.");
    for (const workerId in this._workerPool) {
      this._workerPool[workerId].process.kill();
    }
  }
  return this;
};

module.exports = ProcessingFarm;