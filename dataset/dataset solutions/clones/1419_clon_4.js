const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const dataSegments = sourceData.split('\n');

const processedRecords = dataSegments
    .map(dataLine => {
        const parts = dataLine.split(' ');
        const gradeComponentA = Number(parts[0]);
        const gradeComponentB = Number(parts[1]);
        const gradeComponentC = Number(parts[2]);
        return [gradeComponentA, gradeComponentB, gradeComponentC];
    })
    .filter(triple => {
        // The original logic checks m + f + r == -3.
        // If any component is NaN, the sum is NaN, which is never equal to -3.
        // So, this filter correctly identifies the sentinel only when all are -1.
        return !(triple[0] + triple[1] + triple[2] === -3);
    });

const performanceAssessments = [
    {
        conditionCheck: (param1, param2, param3) => param1 === -1 || param2 === -1,
        outcomeCode: 'F'
    },
    {
        conditionCheck: (param1, param2, param3) => param1 + param2 >= 80,
        outcomeCode: 'A'
    },
    {
        conditionCheck: (param1, param2, param3) => param1 + param2 >= 65,
        outcomeCode: 'B'
    },
    {
        conditionCheck: (param1, param2, param3) => param1 + param2 >= 50,
        outcomeCode: 'C'
    },
    {
        conditionCheck: (param1, param2, param3) => param1 + param2 >= 30 && param3 >= 50,
        outcomeCode: 'C'
    },
    {
        conditionCheck: (param1, param2, param3) => param1 + param2 >= 30,
        outcomeCode: 'D'
    },
    {
        conditionCheck: (param1, param2, param3) => true, // Default catch-all
        outcomeCode: 'F'
    }
];

const calculateFinalGrade = (firstVal, secondVal, thirdVal) => {
    const matchingAssessment = performanceAssessments.find(assessment =>
        assessment.conditionCheck(firstVal, secondVal, thirdVal)
    );
    return matchingAssessment.outcomeCode;
};

const processRemainingRecords = (currentRecords, currentIndex = 0) => {
    if (currentIndex >= currentRecords.length) {
        return; // Base case: all records processed
    }

    const [v1, v2, v3] = currentRecords[currentIndex];
    console.log(calculateFinalGrade(v1, v2, v3));

    processRemainingRecords(currentRecords, currentIndex + 1); // Recursive step
};

processRemainingRecords(processedRecords);