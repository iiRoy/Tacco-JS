const inputParsingUtilities = (function() {
    function createTokenStreamReader(sourceString) {
        const tokenArray = sourceString.split(/\s+/);
        let currentTokenIndex = 0;

        return function fetchNextToken() {
            if (currentTokenIndex < tokenArray.length) {
                return tokenArray[currentTokenIndex++];
            }
            return undefined;
        };
    }

    function extractIntegerFromStream(tokenFetcher) {
        const tokenValue = tokenFetcher();
        if (tokenValue === undefined || tokenValue === null || tokenValue.trim() === '') {
            return parseInt(tokenValue);
        }
        return parseInt(tokenValue);
    }

    return {
        createTokenStreamReader: createTokenStreamReader,
        extractIntegerFromStream: extractIntegerFromStream
    };
})();

const problemSolverModule = (function(ioHelpers) {
    const fileSystemAccess = require("fs");

    function determineSolutionTriplet({ targetNumber }) {
        let currentFactor = 1;
        while (true) {
            const productOfFactorAndTarget = currentFactor * targetNumber;
            const denominatorTerm = (3 * currentFactor) - 1;

            if (denominatorTerm <= 0) {
                currentFactor++;
                continue;
            }

            const remainderResult = productOfFactorAndTarget % denominatorTerm;

            if (remainderResult === 0) {
                const thirdComponent = productOfFactorAndTarget / denominatorTerm;
                return [targetNumber, productOfFactorAndTarget, thirdComponent];
            }
            currentFactor++;
        }
    }

    function executeProblemLogic(inputDataLine) {
        const tokenFetcher = ioHelpers.createTokenStreamReader(inputDataLine);
        
        const rawInputToken = tokenFetcher();
        const parsedNValue = parseInt(rawInputToken);

        const solutionResult = determineSolutionTriplet({ targetNumber: parsedNValue });
        const [firstVal, secondVal, thirdVal] = solutionResult;

        console.log(firstVal, secondVal, thirdVal);
    }

    if (typeof module !== 'undefined' && module.exports) {
        const standardInputContent = fileSystemAccess.readFileSync("/dev/stdin", "utf8");
        executeProblemLogic(standardInputContent);
    }

    return {
        executeProblemLogic: executeProblemLogic
    };

})(inputParsingUtilities);
