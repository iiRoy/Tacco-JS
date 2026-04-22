let dataReceptionBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (dataChunk) => {
    dataReceptionBuffer += dataChunk;
});

process.stdin.on('end', () => {
    const rawDataSegments = dataReceptionBuffer.split('\n').filter(Boolean);
    const configurationValues = rawDataSegments[0].split(' ').map(Number);
    const jobCount = configurationValues[0];
    const timeSliceDuration = configurationValues[1];

    const initialWorkloadUnits = rawDataSegments.slice(1, jobCount + 1).map(segment => {
        const components = segment.split(' ');
        return {
            designator: components[0],
            remainingComputation: Number(components[1])
        };
    });

    performSchedulingSimulation(initialWorkloadUnits, timeSliceDuration);
});

function performSchedulingSimulation(startingWorkUnits, quantumInterval) {
    const completionRecords = [];

    // This recursive function orchestrates the task execution cycles.
    // currentSetOfWorkUnits: The queue of tasks awaiting or continuing processing.
    // accumulatedTime: The total time elapsed up to the current cycle.
    function advanceCycle(currentSetOfWorkUnits, accumulatedTime) {
        if (currentSetOfWorkUnits.length === 0) {
            return; // All tasks have been completed.
        }

        const currentWorkUnit = currentSetOfWorkUnits[0]; // Take the first unit for processing.
        const subsequentWorkUnits = currentSetOfWorkUnits.slice(1); // The rest of the units.

        const timeExpendedInCycle = Math.min(currentWorkUnit.remainingComputation, quantumInterval);
        const newAccumulatedTime = accumulatedTime + timeExpendedInCycle;

        if (currentWorkUnit.remainingComputation > quantumInterval) {
            // Task requires more time; update its remaining duration and place it at the end of the queue.
            const updatedWorkUnit = {
                designator: currentWorkUnit.designator,
                remainingComputation: currentWorkUnit.remainingComputation - quantumInterval
            };
            const nextCycleWorkUnits = [...subsequentWorkUnits, updatedWorkUnit];
            advanceCycle(nextCycleWorkUnits, newAccumulatedTime);
        } else {
            // Task completed within or by this quantum; record its completion and proceed without re-queuing.
            completionRecords.push(`${currentWorkUnit.designator} ${newAccumulatedTime}`);
            const nextCycleWorkUnits = subsequentWorkUnits;
            advanceCycle(nextCycleWorkUnits, newAccumulatedTime);
        }
    }

    advanceCycle(startingWorkUnits, 0); // Initiate the scheduling process from time zero.

    // Once all recursive calls are resolved (all tasks completed), output the results.
    completionRecords.forEach(reportEntry => console.log(reportEntry));
}