const interpretNumeric = (inputStringValue) => Number(inputStringValue);
const convertToNumericArray = (stringArray) => stringArray.map(interpretNumeric);

function OrchestrateComputation(fullInputData) {
    const dataSegments = fullInputData.split('\n');

    const configurationElements = dataSegments[0].split(' ');
    const numberOfProblemTypes = interpretNumeric(configurationElements[0]);
    const requiredTotalPoints = interpretNumeric(configurationElements[1]) / 100;

    const typeSpecifications = [];
    for (let currentTypeIndex = 0; currentTypeIndex < numberOfProblemTypes; currentTypeIndex++) {
        const typeSpecificData = convertToNumericArray(dataSegments[currentTypeIndex + 1].split(' '));
        const typeTaskCount = typeSpecificData[0];
        const typeCompletionBonus = typeSpecificData[1] / 100;
        const pointsPerSingleTask = currentTypeIndex + 1;

        typeSpecifications.push({
            tasksAvailable: typeTaskCount,
            pointsPerTask: pointsPerSingleTask,
            bonusForCompletion: typeCompletionBonus,
        });
    }

    let globalMinimumTaskCount = Infinity;

    function exploreSolutionPaths(completedTypesMask, currentAccumulatedPoints, currentTasksSolved) {
        if (currentTasksSolved >= globalMinimumTaskCount) {
            return;
        }

        let tasksToFinishPath = Infinity;
        if (currentAccumulatedPoints >= requiredTotalPoints) {
            tasksToFinishPath = 0;
        } else {
            const pointsStillNeeded = requiredTotalPoints - currentAccumulatedPoints;
            for (let i = 0; i < numberOfProblemTypes; i++) {
                if (!((completedTypesMask >> i) & 1)) {
                    const categoryDetails = typeSpecifications[i];
                    const tasksRequiredFromThisCategory = Math.ceil(pointsStillNeeded / categoryDetails.pointsPerTask);
                    
                    if (tasksRequiredFromThisCategory <= categoryDetails.tasksAvailable) {
                        tasksToFinishPath = Math.min(tasksToFinishPath, tasksRequiredFromThisCategory);
                    }
                }
            }
        }
        
        if (tasksToFinishPath !== Infinity) {
            globalMinimumTaskCount = Math.min(globalMinimumTaskCount, currentTasksSolved + tasksToFinishPath);
        }

        for (let i = 0; i < numberOfProblemTypes; i++) {
            if (!((completedTypesMask >> i) & 1)) {
                const categoryDetails = typeSpecifications[i];
                const nextCompletedTypesMask = completedTypesMask | (1 << i);
                const nextAccumulatedPoints = currentAccumulatedPoints + categoryDetails.tasksAvailable * categoryDetails.pointsPerTask + categoryDetails.bonusForCompletion;
                const nextTasksSolved = currentTasksSolved + categoryDetails.tasksAvailable;
                
                if (nextTasksSolved < globalMinimumTaskCount) {
                    exploreSolutionPaths(nextCompletedTypesMask, nextAccumulatedPoints, nextTasksSolved);
                }
            }
        }
    }

    exploreSolutionPaths(0, 0, 0);

    console.log(globalMinimumTaskCount);
}

OrchestrateComputation(require("fs").readFileSync("/dev/stdin", "utf8"));