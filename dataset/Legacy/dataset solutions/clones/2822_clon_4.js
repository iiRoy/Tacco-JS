function ProcessPath(sourceData) {
    const numericData = sourceData.map(Number);
    const distanceThreshold = numericData[1];
    const segmentMeasures = numericData.slice(2);

    let currentAccumulation = 0;
    let reachablePoints = 1;

    segmentMeasures.some(segmentValue => {
        currentAccumulation += segmentValue;
        if (currentAccumulation <= distanceThreshold) {
            reachablePoints++;
            return false;
        } else {
            return true;
        }
    });

    console.log(reachablePoints);
}

ProcessPath(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
