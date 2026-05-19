process.stdin.setEncoding('utf-8');

process.stdin.on('data', function (inputData) {
    const scoreComponents = inputData.replace(/\r?\n/g, "").split(" ");

    const parseNumericValue = (componentString) => {
        const parsed = parseInt(componentString);
        return isNaN(parsed) ? -1 : parsed;
    };

    const scoreOne = parseNumericValue(scoreComponents[0]);
    const scoreTwo = parseNumericValue(scoreComponents[1]);
    const scoreThree = parseNumericValue(scoreComponents[2]);

    if (scoreOne === -1 && scoreTwo === -1 && scoreThree === -1) {
        process.exit();
    }

    const getAdjustedScore = (rawScore) => {
        return rawScore === -1 ? 0 : rawScore;
    };

    const adjustedScoreOne = getAdjustedScore(scoreOne);
    const adjustedScoreTwo = getAdjustedScore(scoreTwo);

    const totalCombinedScore = adjustedScoreOne + adjustedScoreTwo;

    let determinedGrade;
    const gradeATres = 80;
    const gradeBTres = 65;
    const gradeCTres = 50;
    const gradeDTres = 30;
    const retestPassThreshold = 50;

    if (totalCombinedScore >= gradeATres) {
        determinedGrade = "A";
    } else if (totalCombinedScore >= gradeBTres) {
        determinedGrade = "B";
    } else if (totalCombinedScore >= gradeCTres) {
        determinedGrade = "C";
    } else if (totalCombinedScore >= gradeDTres) {
        if (scoreThree >= retestPassThreshold) {
            determinedGrade = "C";
        } else {
            determinedGrade = "D";
        }
    } else {
        determinedGrade = "F";
    }

    console.log(determinedGrade);
});
