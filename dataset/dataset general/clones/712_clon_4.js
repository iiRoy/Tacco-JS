'use strict';

const createThrottleMechanism = (operationLimit, timeWindow, permitInstantBurst) => {
    let currentCycleOperations = 0;
    let cycleStartPoint = Date.now();
    let taskBuffer = [];
    let processingScheduled = false;

    // Derived values for simpler calculation, mirroring original's _maxRate
    const effectiveRateThreshold = permitInstantBurst ? operationLimit : operationLimit / timeWindow;

    // Delay for setTimeout, mirroring original's 1 / _maxRate
    const recheckDelay = 1 / effectiveRateThreshold;

    const internalProcess = (incomingTask) => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - cycleStartPoint;

        // Reset cycle if window passed, mirroring original's elapsed > _interval
        if (elapsedTime >= timeWindow) {
            currentCycleOperations = 0;
            cycleStartPoint = currentTime;
        }

        // Calculate current rate, mirroring original's rate = _numOps / (allowBursts ? 1 : elapsed)
        const currentInstantaneousRate = currentCycleOperations / (permitInstantBurst ? 1 : elapsedTime);

        if (currentInstantaneousRate < effectiveRateThreshold) {
            // Within limit, mirroring original's rate < _maxRate
            if (taskBuffer.length === 0) {
                // No pending tasks, execute incoming if provided
                if (incomingTask) {
                    currentCycleOperations++;
                    incomingTask();
                }
                // If incomingTask is undefined here (from a retry), nothing happens,
                // matching original's behavior when _queue is empty and fn is undefined.
            } else {
                // There are pending tasks
                if (incomingTask) {
                    taskBuffer.push(incomingTask); // Add new task to queue if provided
                }
                // Execute the oldest task from the queue, mirroring original's _queue.shift()()
                currentCycleOperations++;
                taskBuffer.shift()();
                // No recursive call here; next queued item will be processed by subsequent submitAction or scheduled retry.
            }
        } else {
            // Limit exceeded, mirroring original's else block
            if (incomingTask) {
                taskBuffer.push(incomingTask); // Add new task to queue if provided
            }
            if (!processingScheduled) {
                processingScheduled = true;
                setTimeout(() => {
                    processingScheduled = false;
                    internalProcess(undefined); // Retry processing the queue, mirroring original's that.schedule()
                }, recheckDelay);
            }
        }
    };

    return {
        submitAction: internalProcess
    };
};

module.exports = createThrottleMechanism;