"use strict";

const computationExecutor = (dataSource) => {

    const numericalValues = dataSource
                              .split(/\s+/)
                              .filter(Boolean)
                              .map(Number);

    const commencementHour = numericalValues[0];
    const commencementMinute = numericalValues[1];
    const terminationHour = numericalValues[2];
    const terminationMinute = numericalValues[3];
    const penaltyValue = numericalValues[4];

    const epochStartMinutes = (commencementHour * 60) + commencementMinute;
    const epochEndMinutes = (terminationHour * 60) + terminationMinute;

    const cycleBoundary = 3600;

    const grossDuration = (epochEndMinutes - epochStartMinutes + cycleBoundary) % cycleBoundary;

    const netDuration = grossDuration - penaltyValue;

    process.stdout.write(netDuration.toString() + '\n');
};

computationExecutor(require("fs").readFileSync("/dev/stdin", "utf8"));