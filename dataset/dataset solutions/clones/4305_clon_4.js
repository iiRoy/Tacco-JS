"use strict";

const processInputData = incomingData => {
    const sourceInformation = incomingData.trim();
    const payloadUnits = sourceInformation.split("\n");
    const keyStatement = payloadUnits[0];
    
    const truncationPoint = keyStatement.length - 8;
    
    const resultantFragment = keyStatement.slice(0, truncationPoint);
    
    console.log(resultantFragment);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));