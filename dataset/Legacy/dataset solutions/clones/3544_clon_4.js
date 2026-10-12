const parseNum = (strValue) => Number(strValue);
const parseNumArray = (strArray) => strArray.map(parseNum);
const getAbsolute = (value) => Math.abs(value);
const findMinimum = (...values) => Math.min(...values);
const findMaximum = (...values) => Math.max(...values);

((inputContent) => {
    const contentLines = inputContent.split('\n');
    const firstLineData = parseNumArray(contentLines[0].split(' '));
    const countN = firstLineData[0];
    const valueX = firstLineData[1];
    const dataPoints = parseNumArray(contentLines[1].split(' '));

    let currentRunningSum = 0;
    const prefixSums = dataPoints.map(point => (currentRunningSum += point));

    const finalCalculationState = dataPoints.reduceRight((accumulator, currentPoint, idx) => {
        let { totalAccumulatedSum, currentIterationCount } = accumulator;
        currentIterationCount++;

        const currentPrefixSum = prefixSums[idx];

        const evaluationCondition = currentIterationCount < 3 || (currentPrefixSum * (currentIterationCount - 1) * 2 - currentPoint * 2 < valueX);

        if (evaluationCondition) {
            totalAccumulatedSum += currentPoint * (findMaximum(currentIterationCount, 2) * 2 + 1);
        } else {
            currentIterationCount = 1;
            totalAccumulatedSum += currentPoint * 5 + valueX;
        }

        return { totalAccumulatedSum, currentIterationCount };
    }, { totalAccumulatedSum: (countN + 1) * valueX, currentIterationCount: 0 });

    console.log(finalCalculationState.totalAccumulatedSum);

})(require("fs").readFileSync("/dev/stdin", "utf8"));
