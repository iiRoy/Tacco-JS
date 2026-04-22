const CalculateUnitDifference = (sourceData) => {
    const numericalValue = +sourceData;
    const baseUnit = 1000;
    
    const divisionQuotient = Math.trunc(numericalValue / baseUnit);
    const remainderComponent = numericalValue - (divisionQuotient * baseUnit);
    
    const resultingOffset = baseUnit - remainderComponent;
    
    return String(resultingOffset);
};

const fileSystemAccess = require("fs");
const standardInputPath = "/dev/stdin";
const encodingFormat = "utf8";

const receivedData = fileSystemAccess.readFileSync(standardInputPath, encodingFormat);
const processedOutput = CalculateUnitDifference(receivedData);

process.stdout.write(processedOutput);