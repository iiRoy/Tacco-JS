"use strict";

const processInput = (rawContent) => {
    const contentSegments = rawContent.trim().split("\n");
    const sourceString = contentSegments[0];
    const stringExtent = sourceString.length;

    const transformationRules = [
        {
            criterion: (len) => len >= 8,
            operation: (str, len) => str.slice(0, len - 8)
        },
        {
            criterion: (len) => len >= 4, // Handles lengths 4, 5, 6, 7
            operation: (str, len) => str.slice(0, (2 * len) - 8)
        },
        {
            criterion: (len) => true, // Default for lengths 0, 1, 2, 3
            operation: (str, len) => ""
        }
    ];

    const applicableRule = transformationRules.find((rule) => rule.criterion(stringExtent));
    const finalResult = applicableRule.operation(sourceString, stringExtent);
    
    console.log(finalResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
