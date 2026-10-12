function processInput(rawData) {
    const inputLines = rawData.split("\n");
    const totalElements = parseInt(inputLines[0], 10);
    const charSequence = inputLines[1];
    
    let distinctTripletsCount = 0;
    
    const checkDistinctChars = (c1, c2, c3) => {
        return c1 !== c2 && c1 !== c3 && c2 !== c3;
    };

    const checkArithmeticProgression = (valA, valB, valC) => {
        return valC - valB === valB - valA;
    };

    for (let indexA = 1; indexA <= totalElements; ++indexA) {
        for (let indexB = indexA + 1; indexB <= totalElements; ++indexB) {
            for (let indexC = indexB + 1; indexC <= totalElements; ++indexC) {
                const isNotArithmetic = !checkArithmeticProgression(indexA, indexB, indexC);
                
                if (isNotArithmetic) {
                    const charAtA = charSequence[indexA - 1];
                    const charAtB = charSequence[indexB - 1];
                    const charAtC = charSequence[indexC - 1];
                    
                    const areAllCharsUnique = checkDistinctChars(charAtA, charAtB, charAtC);
                    
                    if (areAllCharsUnique) {
                        distinctTripletsCount++;
                    }
                }
            }
        }
    }
    
    console.log(distinctTripletsCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
