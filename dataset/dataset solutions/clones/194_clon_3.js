const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const utf8Encoding = "utf8";

function determineWeightClass(weightValue) {
    if (weightValue > 91) {
        return 'heavy';
    } else if (weightValue > 81) {
        return 'light heavy';
    } else if (weightValue > 75) {
        return 'middle';
    } else if (weightValue > 69) {
        return 'light middle';
    } else if (weightValue > 64) {
        return 'welter';
    } else if (weightValue > 60) {
        return 'light welter';
    } else if (weightValue > 57) {
        return 'light';
    } else if (weightValue > 54) {
        return 'feather';
    } else if (weightValue > 51) {
        return 'bantam';
    } else if (weightValue > 48) {
        return 'fly';
    } else {
        return 'light fly';
    }
}

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, utf8Encoding);
const processedTokens = rawInputContent.split(/\s/);

processedTokens.map(function(currentInputToken) {
    if (currentInputToken) {
        console.log(determineWeightClass(j));
    }
});
