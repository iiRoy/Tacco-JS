const processStreamData = (initialPayload) => {
    const allSegments = initialPayload.split('\n');
    const primarySet = Array.from(allSegments[0]);
    const secondarySet = Array.from(allSegments[1]);

    if (primarySet.length < secondarySet.length) {
        console.log(undefined);
        return;
    }

    const comparisonOffset = primarySet.length - secondarySet.length;
    const targetSlice = primarySet.slice(comparisonOffset);

    const divergenceCount = secondarySet.reduce((currentTotal, charFromSecondary, indexPosition) => {
        return currentTotal + (charFromSecondary !== targetSlice[indexPosition] ? 1 : 0);
    }, 0);

    console.log(divergenceCount);
};

processStreamData(require("fs").readFileSync("/dev/stdin", "utf8"));