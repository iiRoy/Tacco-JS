const processInputData = (inputStringContent) => {
    const contentLines = inputStringContent.split('\n').filter(Boolean);
    
    const stringNumbers = contentLines[1].match(/\d+/g);
    const numericValues = stringNumbers.map(Number);
    
    const maximumNumber = numericValues.reduce((currentMax, currentVal) => 
        (currentVal > currentMax ? currentVal : currentMax), -Infinity);
    
    const targetValueHalf = maximumNumber / 2;
    
    const findClosestElementRecursively = (dataArray, halfTarget) => {
        if (dataArray.length === 0) {
            return undefined; 
        }

        let closestFound = dataArray[0];
        let smallestDeviation = Math.abs(halfTarget - dataArray[0]);

        const exploreElements = (idx) => {
            if (idx >= dataArray.length) {
                return;
            }

            const currentDatum = dataArray[idx];
            const currentDeviation = Math.abs(halfTarget - currentDatum);

            if (currentDeviation < smallestDeviation) {
                smallestDeviation = currentDeviation;
                closestFound = currentDatum;
            }

            exploreElements(idx + 1); 
        };

        exploreElements(1); 
        return closestFound;
    };

    const finalClosestNumber = findClosestElementRecursively(numericValues, targetValueHalf);
    
    console.log(maximumNumber + " " + finalClosestNumber);
};

(() => {
    const fileSystemModule = require('fs');
    const readInputContent = (path, encoding) => fileSystemModule.readFileSync(path, encoding);

    const fullInputText = readInputContent('/dev/stdin', 'utf8');
    processInputData(fullInputText);
})();