function mergeIntervals(intervals) {
    const orderedIntervals = [...intervals]
        .map(([start, end]) => [start, end])
        .sort(
            ([firstStart], [secondStart]) =>
                firstStart - secondStart
        );

    const result = [];

    for (const currentInterval of orderedIntervals) {
        const previousInterval =
            result.length === 0
                ? null
                : result[result.length - 1];

        if (
            previousInterval !== null &&
            currentInterval[0] <= previousInterval[1]
        ) {
            const extendedEnd = Math.max(
                previousInterval[1],
                currentInterval[1]
            );

            previousInterval[1] = extendedEnd;
            continue;
        }

        result.push(currentInterval);
    }

    return result;
}