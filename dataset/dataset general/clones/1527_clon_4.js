const sysTools = require('util');
const pathChecker = require('fs').existsSync || require('path').existsSync;
const subProcessMgr = require('child_process');
const signalBus = require('events');
const systemInfo = require('os');

const DECAY_FACTOR_LIMIT = 100;

function createWorkerPool(configSettings) {
    let activeMinions = new Map();
    let maxConcurrentMinions;
    let taskQueue = [];
    let isShuttingDown = false;
    let shutdownCompletionCallback;
    let workerModulePath;
    let maxPendingTasks;
    let maxTaskExecutionTimeMs;
    let averageTaskDurationMs = 0;
    let processedTaskCount = 0;
    let messageEmitter = new signalBus.EventEmitter();

    const validateConfiguration = (settings) => {
        if (!settings || typeof settings.modulePath !== 'string') {
            throw new Error("Mandatory 'modulePath' configuration is absent.");
        }
        if (!pathChecker(settings.modulePath)) {
            throw new Error("Worker module does not exist: " + settings.modulePath);
        }
        if (settings.concurrentLimit !== undefined &&
            (typeof settings.concurrentLimit !== 'number' || settings.concurrentLimit < 1)) {
            throw new Error("When specified, 'concurrentLimit' must be a positive integer.");
        }
        if (settings.backlogAllowance !== undefined && typeof settings.backlogAllowance !== 'number') {
            throw new Error("When specified, 'backlogAllowance' must be a number.");
        }
        if (settings.requestTimeoutMs !== undefined && typeof settings.requestTimeoutMs !== 'number') {
            throw new Error("When specified, 'requestTimeoutMs' must be a number.");
        }
        return settings;
    };

    const validConfig = validateConfiguration(configSettings);

    workerModulePath = validConfig.modulePath;
    maxConcurrentMinions = validConfig.concurrentLimit || Math.ceil(systemInfo.cpus().length * 1.25);
    maxPendingTasks = validConfig.backlogAllowance || maxConcurrentMinions * 10;
    maxTaskExecutionTimeMs = validConfig.requestTimeoutMs || 0;

    const prepareMinionEnvironment = () => {
        const envCopy = { ...process.env };
        delete envCopy.NODE_WORKER_ID;
        delete envCopy.NODE_UNIQUE_ID;
        return envCopy;
    };

    const handleMinionTermination = (minionId) => (exitCode) => {
        const terminatedMinion = activeMinions.get(minionId);
        if (terminatedMinion && terminatedMinion.currentJob && terminatedMinion.currentJob.completionCallback) {
            terminatedMinion.currentJob.completionCallback(
                `Worker process (${minionId}) exited with code: ${exitCode}`
            );
        }
        if (!isShuttingDown) {
            messageEmitter.emit('malfunction',
                `Worker process (${minionId}) unexpectedly terminated with code: ${exitCode}`);
        }
        messageEmitter.emit('status', `Worker process (${minionId}) terminated with code ${exitCode}`);
        activeMinions.delete(minionId);

        if (shutdownCompletionCallback && activeMinions.size === 0) {
            shutdownCompletionCallback(null);
            shutdownCompletionCallback = undefined;
        }
        processPendingTasks();
    };

    const acquireMinion = () => {
        for (const [, minion] of activeMinions.entries()) {
            if (!minion.currentJob) {
                return minion;
            }
        }

        if (activeMinions.size < maxConcurrentMinions) {
            const newProcess = subProcessMgr.fork(
                workerModulePath,
                [],
                { env: prepareMinionEnvironment() }
            );
            const newMinion = {
                processInstance: newProcess,
                currentJob: null,
            };
            newProcess.on('exit', handleMinionTermination(newProcess.pid));
            activeMinions.set(newProcess.pid, newMinion);

            messageEmitter.emit('status', `Spawned new worker process (${newProcess.pid}). Total: ${activeMinions.size}/${maxConcurrentMinions}`);
            return newMinion;
        }
        return null;
    };

    const dispatchJobToMinion = (task, minion) => {
        messageEmitter.emit("detail", `Assigning computation task to process ${minion.processInstance.pid}`);
        const taskStartTime = Date.now();
        minion.currentJob = task;

        minion.processInstance.once('message', (responsePayload) => {
            const completionCb = minion.currentJob.completionCallback;
            minion.currentJob = null;

            processPendingTasks();

            if (completionCb) completionCb(null, responsePayload);

            const elapsedMs = Date.now() - taskStartTime;
            messageEmitter.emit("detail", `Process ${minion.processInstance.pid} completed task in ${(elapsedMs / 1000.0).toFixed(2)}s`);

            if (maxTaskExecutionTimeMs && processedTaskCount >= (2 * maxConcurrentMinions)) {
                const historyWeight = (processedTaskCount > DECAY_FACTOR_LIMIT) ? DECAY_FACTOR_LIMIT : processedTaskCount;
                averageTaskDurationMs = ((averageTaskDurationMs * historyWeight) + elapsedMs) / (historyWeight + 1);
            }
            processedTaskCount++;
        });
        minion.processInstance.send(task.payload);
    };

    const processPendingTasks = () => {
        while (taskQueue.length > 0) {
            const availableMinion = acquireMinion();
            if (!availableMinion) break;

            const nextTask = taskQueue.shift();
            dispatchJobToMinion(nextTask, availableMinion);
        }
    };

    const publicInterface = {
        submitTask: (inputData, completionHandler) => {
            if (maxTaskExecutionTimeMs && processedTaskCount > (2 * maxConcurrentMinions)) {
                const currentMinionCount = activeMinions.size * 1.0;
                if (currentMinionCount > 0) {
                    const estimatedCompletionTime = ((taskQueue.length / currentMinionCount) * averageTaskDurationMs + averageTaskDurationMs) / 1000.0;
                    if (estimatedCompletionTime > maxTaskExecutionTimeMs) {
                        messageEmitter.emit('status', `Maximum estimated task duration exceeded (estimated: ${estimatedCompletionTime.toFixed(2)}s, limit: ${maxTaskExecutionTimeMs}s). Task rejected.`);
                        process.nextTick(() => {
                            completionHandler(`Task rejected: estimated execution time (${estimatedCompletionTime.toFixed(2)}s) exceeds limit.`);
                        });
                        return publicInterface;
                    }
                }
            }

            if (maxPendingTasks > 0 && taskQueue.length >= maxPendingTasks) {
                messageEmitter.emit('status', `Maximum task backlog reached (${maxPendingTasks}). Task rejected.`);
                const currentBacklogLimit = maxPendingTasks;
                process.nextTick(() => {
                    completionHandler(`Task rejected: backlog limit (${currentBacklogLimit}) exceeded.`);
                });
                return publicInterface;
            }

            taskQueue.push({ payload: inputData, completionCallback: completionHandler });
            processPendingTasks();
            return publicInterface;
        },

        terminatePool: (onShutdownComplete) => {
            if (activeMinions.size === 0) {
                if (onShutdownComplete) setTimeout(() => { onShutdownComplete(null); }, 0);
            } else {
                isShuttingDown = true;
                shutdownCompletionCallback = onShutdownComplete;
                messageEmitter.emit('status', `Initiating shutdown for ${activeMinions.size} worker processes.`);
                for (const [, minion] of activeMinions.entries()) {
                    minion.processInstance.kill();
                }
            }
            return publicInterface;
        },

        on: messageEmitter.on.bind(messageEmitter),
        once: messageEmitter.once.bind(messageEmitter),
        off: messageEmitter.off.bind(messageEmitter),
        emit: messageEmitter.emit.bind(messageEmitter),
    };

    return publicInterface;
}

module.exports = createWorkerPool;