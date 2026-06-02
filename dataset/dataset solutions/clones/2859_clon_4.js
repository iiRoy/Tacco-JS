function Main(input) {
    const inputLines = input.split("\n");
    const dataSize = Number(inputLines[0]);
    const numericArray = inputLines[1].split(" ").map(Number);

    if (dataSize === 2) {
        const difference = numericArray[0] - numericArray[1];
        console.log(Math.abs(difference));
    } else {
        const totalSummation = numericArray.reduce((acc, val) => acc + val, 0);

        const prefixSumsCollection = [];
        let runningAccumulator = 0;
        for (const itemValue of numericArray) {
            runningAccumulator += itemValue;
            prefixSumsCollection.push(runningAccumulator);
        }

        // Determine the first index where the prefix sum is greater than or equal to half the total sum.
        // This corresponds to the 'total' variable in the original code when the loop breaks.
        const divisionPointIndex = prefixSumsCollection.findIndex(s => s >= totalSummation / 2);

        let firstCandidateDifference;
        let secondCandidateDifference;

        // Calculate the difference for the partition at 'divisionPointIndex'.
        // This corresponds to 'P' in the original code.
        const leftSegmentSum = prefixSumsCollection[divisionPointIndex];
        const rightSegmentSum = totalSummation - leftSegmentSum;
        firstCandidateDifference = leftSegmentSum - rightSegmentSum;

        // Calculate the difference for the partition just before 'divisionPointIndex'.
        // This corresponds to 'Q' in the original code, derived from 't' and 't2'.
        // If 'divisionPointIndex' is 0, it means the first element alone already satisfied the condition.
        // In this scenario, 't' and 't2' would not have been assigned in the original code's loop,
        // leading to a NaN result for their difference.
        if (divisionPointIndex > 0) {
            const priorLeftSegmentSum = prefixSumsCollection[divisionPointIndex - 1];
            const priorRightSegmentSum = totalSummation - priorLeftSegmentSum;
            secondCandidateDifference = priorLeftSegmentSum - priorRightSegmentSum;
        } else {
            secondCandidateDifference = NaN; // Replicate original's behavior for unassigned 't'/'t2'
        }

        if (dataSize === 3) {
            console.log(Math.abs(firstCandidateDifference));
        } else { // dataSize > 3
            console.log(Math.min(Math.abs(firstCandidateDifference), Math.abs(secondCandidateDifference)));
        }
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
