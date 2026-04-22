const processAmidaPath = (inputData) => {
    const numeralValues = inputData.split(" ").map(Number);
    const maxFloor = numeralValues[0];
    const trackCount = numeralValues[1];
    const destinationTrack = numeralValues[2] - 1; // Convert to zero-indexed

    const primeModulo = 1000000007;

    if (trackCount === 1) {
        return 1;
    }

    // Function to enumerate all permissible horizontal bar layouts
    // A layout is an array where 1 indicates a bar and 0 no bar.
    // The array represents bars between track i-1 and i.
    // Padded with 0s at both ends for simplified boundary checks.
    const enumerateLayouts = (numTracks) => {
        const validLayouts = [];
        const buildLayout = (currentBars, lastBarPresent) => {
            if (currentBars.length === numTracks - 1) { // Core bar positions
                validLayouts.push(currentBars);
                return;
            }
            buildLayout(currentBars.concat(0), false); // Option: no bar
            if (!lastBarPresent) {
                buildLayout(currentBars.concat(1), true); // Option: bar, if previous wasn't a bar
            }
        };

        if (numTracks > 1) {
            buildLayout([], false);
        } else {
            buildLayout([], false); // For numTracks=1, 0 core bars, but this branch is not hit due to early exit
        }
        return validLayouts.map(layout => [0, ...layout, 0]);
    };

    const permittedLayouts = enumerateLayouts(trackCount);

    // Initialize track counts for the starting floor (floor 0)
    let currentFloorCounts = new Array(trackCount).fill(0);
    currentFloorCounts[0] = 1; // Start at track 0, 1 way.

    // Iterate through each floor from 1 up to maxFloor
    // Use reduce to iterate and update the counts for each floor
    const finalCounts = Array.from({ length: maxFloor }, (_, i) => i + 1).reduce((prevFloorCounts, currentFloorNum) => {
        // For each floor, calculate the counts for each track
        // This will be the sum of contributions from all permitted layouts
        const nextFloorCounts = new Array(trackCount).fill(0);

        permittedLayouts.forEach(layout => {
            // Calculate temporary contributions for the current level based on this specific arrangement
            // Map each track to its contribution from the previous floor based on the current layout
            const layoutContributions = Array.from({ length: trackCount }, (_, trackIdx) => {
                // layout[trackIdx] is the indicator for a bar between (trackIdx-1) and trackIdx
                // layout[trackIdx+1] is the indicator for a bar between trackIdx and (trackIdx+1)
                if (layout[trackIdx] === 1) { // If there's a bar to the left, current track receives from trackIdx-1
                    return prevFloorCounts[trackIdx - 1];
                } else if (layout[trackIdx + 1] === 1) { // If there's a bar to the right, current track receives from trackIdx+1
                    return prevFloorCounts[trackIdx + 1];
                } else { // Otherwise (no adjacent bars), current track receives from itself
                    return prevFloorCounts[trackIdx];
                }
            });

            // Accumulate these contributions into the nextFloorCounts for the current floor
            layoutContributions.forEach((contrib, trackIdx) => {
                nextFloorCounts[trackIdx] = (nextFloorCounts[trackIdx] + contrib) % primeModulo;
            });
        });

        return nextFloorCounts; // This becomes prevFloorCounts for the next iteration
    }, currentFloorCounts); // Initial value for reduce is currentFloorCounts (from floor 0)

    return finalCounts[destinationTrack];
};

if (typeof require !== 'undefined') {
    console.log(processAmidaPath(require("fs").readFileSync("/dev/stdin", "utf8")));
}