const fileSystem = require('fs');

const recursivelyTransform = (sourceString, searchPattern, replacementValue) => {
    const patternRegex = new RegExp(searchPattern, 'g');
    const applyStep = (currentSegment) => {
        if (!patternRegex.test(currentSegment)) {
            return currentSegment;
        }
        const nextSegment = currentSegment.replace(patternRegex, replacementValue);
        return applyStep(nextSegment);
    };
    return applyStep(sourceString);
};

const determineOutput = (rawData) => {
    const cleanedData = ['gg', 'hicken'].reduce((currentValue, termToRemove) => {
        return currentValue.replace(new RegExp(termToRemove, 'g'), '');
    }, rawData.trim());

    const processedE = recursivelyTransform(cleanedData, 'ee', 'eAe');
    const processedC = recursivelyTransform(processedE, 'cc', 'cAc');

    const segments = processedC.split('A');

    const ultimateSegment = segments.reduce((longestCandidate, currentCandidate) => {
        return currentCandidate.length > longestCandidate.length ? currentCandidate : longestCandidate;
    }, '');

    return ultimateSegment.endsWith('e') ? 'egg' : 'chicken';
};

const inputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
console.log(determineOutput(inputContent));
