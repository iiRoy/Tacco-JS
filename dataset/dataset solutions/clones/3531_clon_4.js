const establishEquivalence = (firstInput, secondInput) => {
    const acquirePattern = (textualSource) => {
        const characterTallies = {};
        for (const unit of textualSource) {
            const charValue = unit.charCodeAt(0);
            // Only count lowercase English letters, similar to original's implicit behavior with charCodeAt - 97
            if (charValue >= 97 && charValue <= 122) { // 'a' to 'z'
                characterTallies[unit] = (characterTallies[unit] || 0) + 1;
            }
        }

        const orderedUnits = Object.keys(characterTallies).sort();
        
        let patternSignature = "";
        for (const key of orderedUnits) {
            patternSignature += `${key}:${characterTallies[key]};`;
        }
        return patternSignature;
    };

    const signatureA = acquirePattern(firstInput);
    const signatureB = acquirePattern(secondInput);

    return signatureA === signatureB ? "Yes" : "No";
};

const processExternalData = (rawData) => {
    const lines = rawData.trim().split('\n');
    const elementOne = lines[0];
    const elementTwo = lines[1];

    console.log(establishEquivalence(elementOne, elementTwo));
};

processExternalData(require('fs').readFileSync('/dev/stdin', 'utf8'));