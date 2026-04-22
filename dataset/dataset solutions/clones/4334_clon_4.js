const acquireSourceData = () => require("node:fs").readFileSync("/dev/stdin", "utf8");

const prepareDataStream = (rawContent) => {
    const lines = rawContent.trim().split('\n');
    let currentMarker = 0;
    const retrieveNextDatum = () => {
        if (currentMarker >= lines.length) {
            throw new Error("No further data available in stream.");
        }
        return lines[currentMarker++];
    };
    return retrieveNextDatum;
};

const parseNumericalSequence = (textSegment) => textSegment.split(" ").map(Number);

const outputResult = (content) => console.log(content);
const outputDiagnostic = (issue) => console.error(issue);

const performCalculation = () => {
    const getNextInputLine = prepareDataStream(acquireSourceData());
    const initialSettings = parseNumericalSequence(getNextInputLine());

    const parameterAlpha = initialSettings[0];
    const parameterBeta = initialSettings[1];
    const targetValue = initialSettings[2];

    if (targetValue % parameterBeta === 0 || targetValue % parameterAlpha === 0) {
        outputResult("Yes");
        return;
    }

    let outcomeDetermined = false;

    for (let idxAlpha = 1; idxAlpha <= parameterAlpha; idxAlpha++) {
        const coefficientOfBeta = parameterAlpha - (2 * idxAlpha);
        const constantTerm = targetValue - (parameterBeta * idxAlpha);

        if (coefficientOfBeta === 0) {
            if (constantTerm === 0) {
                outcomeDetermined = true;
                break;
            }
        } else {
            const candidateIdxBeta = constantTerm / coefficientOfBeta;

            if (Number.isInteger(candidateIdxBeta) && candidateIdxBeta >= 1 && candidateIdxBeta <= parameterBeta) {
                outcomeDetermined = true;
                break;
            }
        }
    }

    if (outcomeDetermined) {
        outputResult("Yes");
    } else {
        outputResult("No");
    }
};

performCalculation();