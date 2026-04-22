const solveSchedulingProblem = (rawScheduleData) => {
    const dataLines = rawScheduleData.split('\n');
    const jobCount = parseInt(dataLines[0], 10);

    const allJobSpecs = dataLines.slice(1, jobCount + 1).map(lineContent => {
        const valuePairs = lineContent.split(' ').map(Number);
        return {
            effort: valuePairs[0],
            deadline: valuePairs[1]
        };
    });

    allJobSpecs.sort((firstJobSpec, secondJobSpec) => {
        return firstJobSpec.deadline - secondJobSpec.deadline;
    });

    const schedulingEvaluation = allJobSpecs.reduce((currentAccumulator, currentJobSpec) => {
        if (!currentAccumulator.isFeasible) {
            return currentAccumulator;
        }

        const newCumulativeEffort = currentAccumulator.totalEffort + currentJobSpec.effort;
        const stillFeasible = newCumulativeEffort <= currentJobSpec.deadline;

        return {
            totalEffort: newCumulativeEffort,
            isFeasible: stillFeasible
        };
    }, { totalEffort: 0, isFeasible: true });

    const finalResultText = schedulingEvaluation.isFeasible ? "Yes" : "No";

    console.log(finalResultText);
    return finalResultText;
};

const programInput = require("fs").readFileSync("/dev/stdin", "utf8");
solveSchedulingProblem(programInput);