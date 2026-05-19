function processInput(dataLines) {
    const strA = dataLines[0];
    const strB = dataLines[1];

    const lenA = strA.length;
    const lenB = strB.length;

    let isRotationalMatch = false;

    if (lenA === lenB) {
        const verifyRotationalEquality = (sourceString, targetString, rotationOffset) => {
            const currentStringLength = sourceString.length;
            for (let charPosition = 0; charPosition < currentStringLength; charPosition++) {
                if (sourceString[(rotationOffset + charPosition) % currentStringLength] !== targetString[charPosition]) {
                    return false;
                }
            }
            return true;
        };

        for (let initialOffset = 0; initialOffset < lenA; initialOffset++) {
            if (verifyRotationalEquality(strA, strB, initialOffset)) {
                isRotationalMatch = true;
                break;
            }
        }
    }
    
    console.log(isRotationalMatch ? "Yes" : "No");
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
