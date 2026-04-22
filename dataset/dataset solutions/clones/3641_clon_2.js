const convertToNumber = (inputStr) => parseInt(inputStr, 10);

const convertArrayToNumbers = (strArray) => strArray.map((element) => convertToNumber(element));

const getAbsoluteValue = (numericVal) => (numericVal > 0 ? numericVal : -numericVal);

function findSmallestValue() {
    const allArguments = arguments;
    let currentMinimum = allArguments[0];

    for (let index = 1; index < allArguments.length; index++) {
        if (allArguments[index] < currentMinimum) {
            currentMinimum = allArguments[index];
        }
    }
    return currentMinimum;
}

function findLargestValue() {
    const allArguments = arguments;
    let currentMaximum = allArguments[0];

    for (let index = 1; index < allArguments.length; index++) {
        if (allArguments[index] > currentMaximum) {
            currentMaximum = allArguments[index];
        }
    }
    return currentMaximum;
}

ExecuteSolution(require("fs").readFileSync("/dev/stdin", "utf8"));

function ExecuteSolution(problemInput) {
    let lineData = problemInput.split('\n');

    let difficultyAndTarget = lineData[0].split(' ');
    let numberOfChallenges = convertToNumber(difficultyAndTarget[0]);
    let requiredTargetScore = convertToNumber(difficultyAndTarget[1]) / 100;

    let challengeDetails = [];
    let temporaryVariable;
    let totalAttempts = 0;
    let currentAchievedScore = 0;

    for (let challengeIdx = 0; challengeIdx < numberOfChallenges; challengeIdx++) {
        challengeDetails[challengeIdx] = convertArrayToNumbers(lineData[challengeIdx + 1].split(' '));
        challengeDetails[challengeIdx][1] /= 100;
        challengeDetails[challengeIdx][2] = (challengeIdx + 1) + challengeDetails[challengeIdx][1] / challengeDetails[challengeIdx][0];
        challengeDetails[challengeIdx][3] = (challengeIdx + 1);
    }

    challengeDetails.sort(function(itemA, itemB) {
        return itemB[2] - itemA[2];
    });

    let optimalProblemCount, potentialProblemCount, dummyVar1, dummyVar2;

    while (true) {
        optimalProblemCount = -1;

        for (let currentProblemIdx = 0; currentProblemIdx < challengeDetails.length; currentProblemIdx++) {
            if (currentAchievedScore + challengeDetails[currentProblemIdx][0] * challengeDetails[currentProblemIdx][3] >= requiredTargetScore) {
                potentialProblemCount = Math.ceil((requiredTargetScore - currentAchievedScore) / challengeDetails[currentProblemIdx][3]);
                if (optimalProblemCount === -1 || optimalProblemCount > potentialProblemCount) {
                    optimalProblemCount = potentialProblemCount;
                }
            } else if (currentAchievedScore + challengeDetails[currentProblemIdx][0] * challengeDetails[currentProblemIdx][3] + challengeDetails[currentProblemIdx][1] >= requiredTargetScore) {
                potentialProblemCount = challengeDetails[currentProblemIdx][0];
                if (optimalProblemCount === -1 || optimalProblemCount > potentialProblemCount) {
                    optimalProblemCount = potentialProblemCount;
                }
            }
        }

        if (optimalProblemCount !== -1) {
            console.log(totalAttempts + optimalProblemCount);
            return 0;
        }

        totalAttempts += challengeDetails[0][0];
        currentAchievedScore += challengeDetails[0][0] * challengeDetails[0][3] + challengeDetails[0][1];
        challengeDetails.shift();
    }
}