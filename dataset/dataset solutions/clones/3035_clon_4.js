"use strict";

function TransformSequence(initialText) {
    const componentParts = initialText.split(/\s+/).filter(Boolean);
    let tokenPointer = 0;

    const pullNumber = () => parseInt(componentParts[tokenPointer++], 10);
    const pullString = () => componentParts[tokenPointer++];

    const limitCount = pullNumber();
    const sourceString = pullString();
    const characterLocation = pullNumber();

    const referenceCharacter = sourceString[characterLocation - 1];

    const processedChars = Array.from(sourceString)
                                .slice(0, limitCount)
                                .map((currentElement) => {
                                    return currentElement === referenceCharacter ? referenceCharacter : '*';
                                });

    console.log(processedChars.join(''));
}

if (typeof module !== 'undefined' && module.exports) {
    const inputContent = require('fs').readFileSync(0, 'utf8');
    TransformSequence(inputContent);
}