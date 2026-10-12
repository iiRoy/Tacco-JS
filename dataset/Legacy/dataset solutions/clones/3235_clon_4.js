const processData = (rawDataString) => {
    const [totalCapacity, firstGroupSize, secondGroupSize] = rawDataString.split(" ").map(Number);

    const minimumOfGroups = Math.min(firstGroupSize, secondGroupSize);

    const unaccommodatedCount = Math.max(0, firstGroupSize + secondGroupSize - totalCapacity);

    console.log('%d %d', minimumOfGroups, unaccommodatedCount);
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
