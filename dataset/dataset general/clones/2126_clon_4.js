"use strict";

class ProcessorToolkit {
    constructor() {
        // Utility methods are stateless, no instance properties needed.
    }

    sanitizeInputForPattern(subjectString) {
        const specialCharacters = new Set(['-', '[', ']', '{', '}', '(', ')', '*', '+', '?', '.', '\\', '^', '$', '|', '#', ' ']);
        let modifiedString = [];
        for (let idx = 0; idx < subjectString.length; idx++) {
            const char = subjectString[idx];
            if (specialCharacters.has(char)) {
                modifiedString.push('\\');
            }
            modifiedString.push(char);
        }
        return modifiedString.join('');
    }

    amalgamateObjects(primaryObject, ...additionalObjects) {
        // The original implementation mutates the first argument (`target`).
        // It does not gracefully handle `target` being null or undefined
        // before property assignment, so we assume `primaryObject` is a valid object.
        for (let objIndex = 0; objIndex < additionalObjects.length; objIndex++) {
            const currentSource = additionalObjects[objIndex];
            if (typeof currentSource === 'object' && currentSource !== null) {
                // Object.keys returns own enumerable string-keyed properties,
                // which aligns with the behavior of `for...in` with `hasOwnProperty` check.
                const sourceKeys = Object.keys(currentSource);
                for (let keyIndex = 0; keyIndex < sourceKeys.length; keyIndex++) {
                    const propertyKey = sourceKeys[keyIndex];
                    primaryObject[propertyKey] = currentSource[propertyKey];
                }
            }
        }
        return primaryObject;
    }

    purgeSourceAnnotations(codeContent) {
        let finalOutput = [];
        let index = 0;

        const InterpretationState = {
            CODE_MODE: 0,
            SINGLE_COMMENT_MODE: 1,
            MULTI_COMMENT_MODE: 2,
            POSSIBLE_MULTI_COMMENT_END_MODE: 3
        };
        let currentInterpretation = InterpretationState.CODE_MODE;

        while (index < codeContent.length) {
            const currentChar = codeContent[index];
            const nextChar = codeContent[index + 1];

            switch (currentInterpretation) {
                case InterpretationState.CODE_MODE:
                    if (currentChar === '/' && nextChar === '/') {
                        currentInterpretation = InterpretationState.SINGLE_COMMENT_MODE;
                        index++; // Skip the second '/'
                    } else if (currentChar === '/' && nextChar === '*') {
                        currentInterpretation = InterpretationState.MULTI_COMMENT_MODE;
                        index++; // Skip the '*'
                    } else {
                        finalOutput.push(currentChar);
                    }
                    break;
                case InterpretationState.SINGLE_COMMENT_MODE:
                    if (currentChar === '\n' || currentChar === '\r') {
                        currentInterpretation = InterpretationState.CODE_MODE;
                        finalOutput.push(currentChar); // Preserve the newline character
                    }
                    // All other characters are ignored in single-line comment mode
                    break;
                case InterpretationState.MULTI_COMMENT_MODE:
                    if (currentChar === '*') {
                        currentInterpretation = InterpretationState.POSSIBLE_MULTI_COMMENT_END_MODE;
                    }
                    // All other characters are ignored in multi-line comment mode
                    break;
                case InterpretationState.POSSIBLE_MULTI_COMMENT_END_MODE:
                    if (currentChar === '/') {
                        currentInterpretation = InterpretationState.CODE_MODE;
                    } else if (currentChar !== '*') {
                        // If it's not '/' and not '*', then the '*' was part of the comment,
                        // not an end delimiter. Revert to multi-line comment mode.
                        currentInterpretation = InterpretationState.MULTI_COMMENT_MODE;
                    }
                    // If it's '*', stay in POSSIBLE_MULTI_COMMENT_END_MODE
                    break;
            }
            index++;
        }
        return finalOutput.join('');
    }

    filterDirectiveLines(textBlock) {
        let collectionOfLines = [];
        let currentLineBuild = [];
        let charIndex = 0;

        while (charIndex < textBlock.length) {
            const char = textBlock[charIndex];

            if (char === '\n' || char === '\r') {
                const constructedLine = currentLineBuild.join('');
                if (!(constructedLine.length >= 3 && constructedLine[0] === '/' && constructedLine[1] === '/' && constructedLine[2] === '!')) {
                    collectionOfLines.push(constructedLine);
                }
                currentLineBuild = [];

                // Handle Windows-style `\r\n` line endings
                if (char === '\r' && textBlock[charIndex + 1] === '\n') {
                    charIndex++; // Skip the `\n` as it's part of the `\r\n` sequence
                }
            } else {
                currentLineBuild.push(char);
            }
            charIndex++;
        }

        // Process any remaining characters if the string doesn't end with a newline
        if (currentLineBuild.length > 0) {
            const constructedLine = currentLineBuild.join('');
            if (!(constructedLine.length >= 3 && constructedLine[0] === '/' && constructedLine[1] === '/' && constructedLine[2] === '!')) {
                collectionOfLines.push(constructedLine);
            }
        }

        let completeString = collectionOfLines.join('\n');

        // Manual trimming to replicate String.prototype.trim()
        let startTrimIndex = 0;
        while (startTrimIndex < completeString.length && (
            completeString[startTrimIndex] === ' ' ||
            completeString[startTrimIndex] === '\t' ||
            completeString[startTrimIndex] === '\n' ||
            completeString[startTrimIndex] === '\r'
        )) {
            startTrimIndex++;
        }

        let endTrimIndex = completeString.length - 1;
        while (endTrimIndex >= startTrimIndex && (
            completeString[endTrimIndex] === ' ' ||
            completeString[endTrimIndex] === '\t' ||
            completeString[endTrimIndex] === '\n' ||
            completeString[endTrimIndex] === '\r'
        )) {
            endTrimIndex--;
        }

        if (startTrimIndex > endTrimIndex) {
            return ''; // The string was entirely whitespace or empty
        }

        return completeString.substring(startTrimIndex, endTrimIndex + 1);
    }
}

module.exports = new ProcessorToolkit();