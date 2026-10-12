function evaluateCoordinateSet(coordinateData) {
    const dataLines = coordinateData.split('\n');
    const pointCount = parseInt(dataLines[0], 10);

    if (pointCount <= 1) {
        // Replicate original code's behavior for pointCount <= 1.
        // Original code initializes four corner points with specific coordinates:
        // tr = {x: 1, y: 1}, tl = {x: 10^9, y: 1}, br = {x: 1, y: 10^9}, bl = {x: 10^9, y: 10^9}
        // If pointCount <= 1, the loop doesn't run, and these initial values are used directly.
        // The final calculation is:
        // Math.max(Math.abs(tr.x - bl.x) + Math.abs(tr.y - bl.y), Math.abs(tl.x - br.x) + Math.abs(tl.y - br.y))
        //   = Math.max(Math.abs(1 - 10^9) + Math.abs(1 - 10^9), Math.abs(10^9 - 1) + Math.abs(1 - 10^9))
        //   = Math.max((10^9 - 1) + (10^9 - 1), (10^9 - 1) + (10^9 - 1))
        //   = 2 * (10^9 - 1) + 2 * (10^9 - 1)
        //   = 4 * (10^9 - 1)
        //   = 4 * (1,000,000,000 - 1)
        //   = 4 * 999,999,999 = 3,999,999,996
        console.log('%d', 3999999996);
        return;
    }

    const processedLocations = dataLines.slice(1, pointCount).filter(line => line.trim() !== '')
        .map(line => {
            const parts = line.split(' ');
            const primaryAxis = parseInt(parts[0], 10);
            const secondaryAxis = parseInt(parts[1], 10);
            return { primaryAxis, secondaryAxis };
        });

    let minCombined = Infinity;
    let maxCombined = -Infinity;
    let minSeparation = Infinity;
    let maxSeparation = -Infinity;

    processedLocations.forEach(location => {
        const currentCombined = location.primaryAxis + location.secondaryAxis;
        const currentSeparation = location.primaryAxis - location.secondaryAxis;

        if (currentCombined < minCombined) minCombined = currentCombined;
        if (currentCombined > maxCombined) maxCombined = currentCombined;
        if (currentSeparation < minSeparation) minSeparation = currentSeparation;
        if (currentSeparation > maxSeparation) maxSeparation = currentSeparation;
    });

    const rangeCombined = maxCombined - minCombined;
    const rangeSeparation = maxSeparation - minSeparation;

    const ultimateMetric = Math.max(rangeCombined, rangeSeparation);
    console.log('%d', ultimateMetric);
}

evaluateCoordinateSet(require("fs").readFileSync("/dev/stdin", "utf8"));