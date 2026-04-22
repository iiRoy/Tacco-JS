'use strict';

const processInputData = (inputStringContent) => {
    const numericParts = inputStringContent.match(/\d+/g).map(item => parseInt(item, 10));

    const [firstMeasure, secondMeasure, thirdMeasure] = numericParts;

    const evaluationRules = [
        {
            test: (m1, m2, m3) => m2 >= m3,
            result: 'delicious'
        },
        {
            test: (m1, m2, m3) => m1 >= (m3 - m2),
            result: 'safe'
        },
        {
            test: (m1, m2, m3) => true,
            result: 'dangerous'
        }
    ];

    const determinedOutcome = evaluationRules.find(criterion =>
        criterion.test(firstMeasure, secondMeasure, thirdMeasure)
    ).result;

    process.stdout.write(determinedOutcome + '\n');
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));