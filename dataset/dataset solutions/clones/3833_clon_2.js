function obtainGreatestHistogramSurface(barSizes) {
    let greatestSurface = 0;

    for (
        let leftBoundary = 0;
        leftBoundary < barSizes.length;
        leftBoundary++
    ) {
        for (
            let rightBoundary = leftBoundary;
            rightBoundary < barSizes.length;
            rightBoundary++
        ) {
            let shortestBar = Infinity;

            for (
                let inspectedIndex = leftBoundary;
                inspectedIndex <= rightBoundary;
                inspectedIndex++
            ) {
                shortestBar = Math.min(
                    shortestBar,
                    barSizes[inspectedIndex]
                );
            }

            const segmentLength =
                rightBoundary - leftBoundary + 1;

            const candidateSurface =
                shortestBar * segmentLength;

            if (candidateSurface > greatestSurface) {
                greatestSurface = candidateSurface;
            }
        }
    }

    return greatestSurface;
}