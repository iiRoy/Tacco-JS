const ruleRegistry = [
    {
        checkCriterion: (valuePoint) => valuePoint < 1200,
        outcomeLabel: 'ABC'
    },
    {
        checkCriterion: (valuePoint) => valuePoint >= 1200 && valuePoint < 2800,
        outcomeLabel: 'ARC'
    },
    {
        checkCriterion: (valuePoint) => valuePoint <= 4208,
        outcomeLabel: 'AGC'
    }
];

function processDataStream(sourceData) {
    const numericalValue = Number(sourceData.trim());
    
    ruleRegistry
        .filter(entry => entry.checkCriterion(numericalValue))
        .map(entry => entry.outcomeLabel)
        .forEach(outputMessage => console.log(outputMessage));
}

const fileSystemReader = require("fs").readFileSync;
const dataPathIdentifier = "/dev/stdin";
const textEncodingStandard = "utf8";
const retrievedContent = fileSystemReader(dataPathIdentifier, textEncodingStandard);

processDataStream(retrievedContent);