const fileSystem = require('fs');

const processInputData = (sourceData) => {
    const allInputLines = sourceData.trim().split("\n");
    const iterationLimitString = allInputLines.shift();
    const maximumIterations = Number(iterationLimitString);

    function* quaternionDataGenerator(linesCollection, iterationCap) {
        let processedCount = 0;
        for (const currentLineEntry of linesCollection) {
            if (processedCount >= iterationCap) break;
            if (currentLineEntry === "0") break;

            const numericalValues = currentLineEntry.split(" ").map(Number);
            const quaternionOne = numericalValues.slice(0, 4);
            const quaternionTwo = numericalValues.slice(4, 8);

            yield { qA: quaternionOne, qB: quaternionTwo };
            processedCount++;
        }
    }

    const quaternionCalculations = quaternionDataGenerator(allInputLines, maximumIterations);

    for (const quaternionPair of quaternionCalculations) {
        const [q1_real, q1_i, q1_j, q1_k] = quaternionPair.qA;
        const [q2_real, q2_i, q2_j, q2_k] = quaternionPair.qB;

        const resultReal = q1_real * q2_real - q1_i * q2_i - q1_j * q2_j - q1_k * q2_k;
        const resultI = q1_real * q2_i + q1_i * q2_real + q1_j * q2_k - q1_k * q2_j;
        const resultJ = q1_real * q2_j - q1_i * q2_k + q1_j * q2_real + q1_k * q2_i;
        const resultK = q1_real * q2_k + q1_i * q2_j - q1_j * q2_i + q1_k * q2_real;

        console.log(`${resultReal} ${resultI} ${resultJ} ${resultK}`);
    }
};

processInputData(fileSystem.readFileSync('/dev/stdin', 'utf8'));
