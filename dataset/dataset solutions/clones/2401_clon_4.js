const processInputData = (rawData) => {
    const lineSegments = rawData.split("\n");
    const dimensionData = lineSegments[0].split(" ");
    const totalLength = Number(dimensionData[0]);
    const maxStepSize = Number(dimensionData[1]);
    const pathMap = lineSegments[1].split("");

    const generateInitialPath = (currentPos, endTarget, maxJump, mapString, collectedJumps = []) => {
        if (currentPos >= endTarget - 1) {
            return collectedJumps;
        }

        let nextStep = -1;
        for (let stepIncrement = 1; stepIncrement <= maxJump; stepIncrement++) {
            if (mapString[currentPos + stepIncrement] === '0') {
                nextStep = stepIncrement;
                break;
            }
        }

        if (nextStep === -1) {
            return null;
        }

        return generateInitialPath(currentPos + nextStep, endTarget, maxJump, mapString, [...collectedJumps, nextStep]);
    };

    const initialPathSegments = generateInitialPath(0, totalLength, maxStepSize, pathMap);

    if (initialPathSegments === null) {
        console.log(-1);
        return;
    }

    const optimizedPathSegments = initialPathSegments.reduceRight((acc, currentJump) => {
        if (acc.length === 0) {
            return [currentJump];
        }

        const rightmostCombinedJump = acc[0];
        if (currentJump + rightmostCombinedJump <= maxStepSize) {
            return [currentJump + rightmostCombinedJump, ...acc.slice(1)];
        } else {
            return [currentJump, ...acc];
        }
    }, []);

    console.log(optimizedPathSegments.join(""));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
