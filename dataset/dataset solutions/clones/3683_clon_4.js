const obtainInteger = (valStr) => Math.trunc(Number(valStr));

const convertToIntegerArray = (strArray) => strArray.reduce((accumulator, current) => {
    accumulator.push(obtainInteger(current));
    return accumulator;
}, []);

const calculateAbsolute = (num) => Math.abs(num);

const determineMinimum = (...values) => values.reduce((minVal, currentVal) => (currentVal < minVal ? currentVal : minVal));

const determineMaximum = (...values) => values.reduce((maxVal, currentVal) => (currentVal > maxVal ? currentVal : maxVal));

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
 
function processInputData(rawData) {
	const lineSegments = rawData.split('\n');
	const sourceSequence = lineSegments[0];
	const extractionStep = obtainInteger(lineSegments[1]);
	const sequenceLength = sourceSequence.length;

	const extractedCharacters = Array.from({ length: Math.ceil(sequenceLength / extractionStep) }, (_, index) => {
        const charIndex = index * extractionStep;
        return sourceSequence[charIndex];
    });

	console.log(extractedCharacters.join(''));
}
