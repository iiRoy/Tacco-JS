const fileSystemOperations = require('fs');
const standardInputPath = '/dev/stdin';

(function executeProgramLogic() {
    const acquireRawData = fileSystemOperations.readFileSync(standardInputPath, 'utf8');
    const symbolSequence = Array.from(acquireRawData.trim());

    const firstBoundaryMarker = symbolSequence.indexOf('\\');
    const lastBoundaryMarker = symbolSequence.lastIndexOf('/');

    // If no valid boundaries or if boundaries are inverted, no water can be trapped.
    // The original code would empty the array via `shift`/`pop` loops in such cases,
    // leading to an empty or single-element height list, and thus no accumulated water.
    if (firstBoundaryMarker === -1 || lastBoundaryMarker === -1 || firstBoundaryMarker >= lastBoundaryMarker) {
        console.log(0);
        console.log(0); // Original outputs '0' for no holes
        return;
    }

    const relevantSegment = symbolSequence.slice(firstBoundaryMarker, lastBoundaryMarker + 1);

    let currentElevationLevel = 0;
    // Transform the character sequence into an elevation profile
    const terrainElevationProfile = relevantSegment.reduce((accumulator, character) => {
        if (character === '\\') {
            currentElevationLevel -= 1;
        } else if (character === '/') {
            currentElevationLevel += 1;
        }
        // '_' characters result in no change to currentElevationLevel
        accumulator.push(currentElevationLevel);
        return accumulator;
    }, [0]); // Start with an initial ground level of zero

    // Recursive function to analyze the terrain and identify water basins
    const analyzeTerrainForBasins = (currentTerrainSlice) => {
        // Base case: A slice of less than two points cannot form a basin
        if (currentTerrainSlice.length < 2) {
            return { totalLiquidVolume: 0, individualBasins: [] };
        }

        const initialPointElevation = currentTerrainSlice[0];
        let closingWallPosition = -1;

        // Search for the first point to the right that is at least as high as the initial point
        for (let i = 1; i < currentTerrainSlice.length; i++) {
            if (currentTerrainSlice[i] >= initialPointElevation) {
                closingWallPosition = i;
                break;
            }
        }

        // If no closing wall is found for the current initial point,
        // it means this part of the terrain cannot hold water from this side.
        // Recurse on the slice starting from the next point.
        if (closingWallPosition === -1) {
            return analyzeTerrainForBasins(currentTerrainSlice.slice(1));
        }

        let accumulatedBasinFill = 0;
        // Calculate the water volume in the basin between the initial point and the closing wall
        for (let i = 1; i < closingWallPosition; i++) {
            accumulatedBasinFill += (initialPointElevation - currentTerrainSlice[i]);
        }

        // Recursively process the remainder of the terrain, starting from the closing wall
        const subsequentAnalysisResult = analyzeTerrainForBasins(currentTerrainSlice.slice(closingWallPosition));

        // Aggregate the results
        if (accumulatedBasinFill > 0) {
            return {
                totalLiquidVolume: accumulatedBasinFill + subsequentAnalysisResult.totalLiquidVolume,
                individualBasins: [accumulatedBasinFill, ...subsequentAnalysisResult.individualBasins]
            };
        } else {
            return subsequentAnalysisResult;
        }
    };

    const finalAnalysisOutcome = analyzeTerrainForBasins(terrainElevationProfile);

    console.log(finalAnalysisOutcome.totalLiquidVolume);
    if (finalAnalysisOutcome.individualBasins.length > 0) {
        console.log(finalAnalysisOutcome.individualBasins.length + ' ' + finalAnalysisOutcome.individualBasins.join(' '));
    } else {
        console.log(0); // Consistent with original's output for no basins
    }
})();