const fileContent = require('fs') .readFileSync( '/dev/stdin', 'utf8' );

let lineFragments = fileContent.trim()
                              .split("\n");

const totalElements = parseInt(lineFragments.shift(), 10);

const [initialValue, differenceAmount] = lineFragments
                                          .shift()
                                          .split(" ")
                                          .map(valueString => parseInt(valueString, 10));

const identifierMap = {};

const operationQuantity = parseInt(lineFragments.shift(), 10);

for (let currentOpIndex = 0;
     currentOpIndex < operationQuantity;
     currentOpIndex++)
{
    const [operationKind, firstAlias, secondAlias] = lineFragments
                                                        .shift()
                                                        .split(" ");
    
    if ( ! identifierMap.hasOwnProperty(firstAlias) ) {
        identifierMap[firstAlias] = firstAlias;
    }
    
    if ( ! identifierMap.hasOwnProperty(secondAlias) ) {
        identifierMap[secondAlias] = secondAlias;
    }
    
    if (operationKind === "0") {
        [identifierMap[firstAlias], identifierMap[secondAlias]] = [identifierMap[secondAlias], identifierMap[firstAlias]];
    } else {
        identifierMap[firstAlias] = identifierMap[secondAlias];
    }
}

let lookupTarget = parseInt(lineFragments.shift(), 10);

if (identifierMap.hasOwnProperty(lookupTarget + "")) {
    lookupTarget = parseInt(identifierMap[lookupTarget], 10);
}

console.log(initialValue + ((lookupTarget - 1) * differenceAmount));