const travelRouteManager = () => {
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    const dataRows = rawInputData.split("\n");

    const interpretNumericalSequence = (textLine) => (Array.isArray(textLine) ? textLine : textLine.split(/\s+/)).map(Number);

    const [stationLimit, totalRoutes, totalRequests] = interpretNumericalSequence(dataRows[0]);

    const routeRecords = dataRows.slice(1, totalRoutes + 1).map(line => interpretNumericalSequence(line));
    const requestSpecifications = dataRows.slice(totalRoutes + 1, totalRoutes + 1 + totalRequests).map(line => interpretNumericalSequence(line));

    const routeOccurrenceRegister = new Map(); // Map<endingPoint, Map<startingPoint, count>>
    routeRecords.forEach(([startPoint, endPoint]) => {
        if (!routeOccurrenceRegister.has(endPoint)) {
            routeOccurrenceRegister.set(endPoint, new Map());
        }
        const startPointCounts = routeOccurrenceRegister.get(endPoint);
        startPointCounts.set(startPoint, (startPointCounts.get(startPoint) || 0) + 1);
    });

    const cumulativeRouteTallies = new Map(); // Map<endingPoint, number[]> where array index is startingPoint
    for (let currentEndPoint = 1; currentEndPoint <= stationLimit; currentEndPoint++) {
        const cumulativeForEndPoint = Array(stationLimit + 1).fill(0);
        let runningAccumulation = 0;
        const startPointFrequency = routeOccurrenceRegister.get(currentEndPoint) || new Map();

        for (let currentStartPoint = 1; currentStartPoint <= stationLimit; currentStartPoint++) {
            runningAccumulation += startPointFrequency.get(currentStartPoint) || 0;
            cumulativeForEndPoint[currentStartPoint] = runningAccumulation;
        }
        cumulativeRouteTallies.set(currentEndPoint, cumulativeForEndPoint);
    }

    const requestResults = requestSpecifications.map(([minimumPoint, maximumPoint]) => {
        let currentRequestTotal = 0;
        for (let targetEndPoint = minimumPoint; targetEndPoint <= maximumPoint; targetEndPoint++) {
            const endPointData = cumulativeRouteTallies.get(targetEndPoint);
            if (endPointData) {
                currentRequestTotal += endPointData[maximumPoint] - (endPointData[minimumPoint - 1] || 0);
            }
        }
        return currentRequestTotal;
    });

    console.log(requestResults.join("\n"));
};

travelRouteManager();