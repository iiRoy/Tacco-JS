const processInputData = (inputContent) => {
    const numericInterpretation = +inputContent;
    const classificationIndex = Math.floor(numericInterpretation / 1000);

    const outcomeLabels = {
        '0': 'ABC',
        '1': 'ABD',
        'NaN': 'ABD'
    };

    console.log(outcomeLabels[classificationIndex]);
};

const filesystemAccess = require("node:fs");
const retrievedText = filesystemAccess.readFileSync("/dev/stdin", "utf8");

processInputData(retrievedText);