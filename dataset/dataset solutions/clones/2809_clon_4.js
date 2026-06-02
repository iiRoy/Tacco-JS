'use strict';

function processSchedule(sourceText) {
    const contentLines = sourceText.trim().split('\n');

    // The first line indicates the total number of tasks, which we parse
    // but do not directly use for iteration bounds in the new strategy.
    const totalTasksDeclared = Number(contentLines[0]);

    // Parse task details from the remaining lines.
    // Filter out any empty lines that might result from trailing newlines.
    const rawTaskEntries = contentLines.slice(1).filter(Boolean);

    const workUnits = rawTaskEntries.map(lineSegment => {
        const [durationString, deadlineString] = lineSegment.split(' ');
        // Convert string segments to integers.
        return [parseInt(durationString, 10), parseInt(deadlineString, 10)];
    });

    // Sort the work units based on their deadlines in ascending order.
    // A more concise comparison function for numerical sorting.
    workUnits.sort((unitA, unitB) => unitA[1] - unitB[1]);

    // Evaluate the feasibility of completing all tasks using a functional reduction.
    // The accumulator tracks the current elapsed time and whether the schedule remains possible.
    const finalOutcome = workUnits.reduce((accumulator, currentUnit) => {
        // If the schedule is already deemed impossible, short-circuit further calculations.
        if (!accumulator.isFeasible) {
            return accumulator;
        }

        const taskDuration = currentUnit[0];
        const taskDeadline = currentUnit[1];

        const updatedTime = accumulator.elapsedTime + taskDuration;
        const stillWithinLimits = updatedTime <= taskDeadline;

        return {
            elapsedTime: updatedTime,
            isFeasible: stillWithinLimits
        };
    }, { elapsedTime: 0, isFeasible: true }); // Initial state: no time elapsed, schedule is feasible.

    // Output the final determination.
    if (finalOutcome.isFeasible) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

// Standard entry point for reading input from stdin.
processSchedule(require('fs').readFileSync('/dev/stdin', 'utf8'));
