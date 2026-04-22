function determineOutcome (dataStream) {
    const parseInformation = (rawContent) => {
        const lineSegments = rawContent.trim().split(/\r?\n/);
        const [segmentOne, segmentTwo, segmentThree] = lineSegments.map(chunk =>
            chunk.split(/\s+/).map(str => parseInt(str, 10))
        );

        return {
            initialPointAlpha: segmentOne[0],
            velocityAlpha: segmentOne[1],
            initialPointBeta: segmentTwo[0],
            velocityBeta: segmentTwo[1],
            timeAllowance: segmentThree[0]
        };
    };

    const evaluateMeetingPotential = (scenarioDetails) => {
        const absoluteSeparation = Math.abs(scenarioDetails.initialPointAlpha - scenarioDetails.initialPointBeta);
        const differentialSpeed = scenarioDetails.velocityAlpha - scenarioDetails.velocityBeta;
        const permittedDuration = scenarioDetails.timeAllowance;

        if (absoluteSeparation === 0) {
            return "YES";
        }

        if (differentialSpeed <= 0) {
            return "NO";
        }

        const requiredDuration = absoluteSeparation / differentialSpeed;

        if (requiredDuration <= permittedDuration) {
            return "YES";
        } else {
            return "NO";
        }
    };

    const extractedParameters = parseInformation(dataStream);
    console.log(evaluateMeetingPotential(extractedParameters));
}

determineOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));