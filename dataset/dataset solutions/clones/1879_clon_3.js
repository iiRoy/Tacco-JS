function InputTokenizer(sourceText) {
    const _this = this;
    _this.tokenPosition = 0;
    _this.originalStreamContent = sourceText;

    const prepareTokens = (rawInput) => {
        let processedContent = rawInput.trim();
        processedContent = processedContent.replace(/\s+/g, " ");
        const segments = processedContent.split(" ");
        return segments.filter(Boolean);
    };

    _this.parsedTokens = prepareTokens(_this.originalStreamContent);

    _this.obtainNext = function() {
        if (_this.tokenPosition >= _this.parsedTokens.length) {
            return null;
        }
        const currentToken = _this.parsedTokens[_this.tokenPosition];
        _this.tokenPosition++;
        return currentToken;
    };

    _this.obtainNextInteger = function() {
        const tokenString = _this.obtainNext();
        if (tokenString === null) {
            return null;
        }
        const numericValue = parseInt(tokenString, 10);
        return isNaN(numericValue) ? null : numericValue;
    };

    _this.obtainNextFloat = function() {
        const tokenString = _this.obtainNext();
        if (tokenString === null) {
            return null;
        }
        const floatValue = parseFloat(tokenString);
        return isNaN(floatValue) ? null : floatValue;
    };
    
    _this.obtainNextByteValue = function() {
        const tokenString = _this.obtainNext();
        if (tokenString === null) {
            return null;
        }
        const intValue = parseInt(tokenString, 10);
        if (isNaN(intValue)) {
            return null;
        }
        return Math.max(0, Math.min(255, intValue));
    };
}

function SolutionProcessor(dataInterpreter) {
    const elementCount = dataInterpreter.obtainNextInteger();
    let iterationGoal = dataInterpreter.obtainNextInteger(); // Changed to 'let' as it might be modified

    if (elementCount === null || iterationGoal === null || elementCount <= 0 || iterationGoal < 0) {
        console.error("Error: Invalid element count or iteration goal provided.");
        return;
    }

    const transitionMap = new Map();
    
    for (let i = 0; i < elementCount; i++) {
        const mapKey = i + 1;
        const mapValue = dataInterpreter.obtainNextInteger();
        if (mapValue === null) {
            console.error(`Error: Missing value for map key ${mapKey}`);
            return;
        }
        transitionMap.set(mapKey, mapValue);
    }
    
    let currentPathValue = 1;
    const visitedStates = new Map();
    let sequenceIndex = 0;

    for (; sequenceIndex < elementCount; sequenceIndex++) {
        if (!transitionMap.has(currentPathValue)) {
            console.error(`Error: Path leads to an undefined state: ${currentPathValue}`);
            currentPathValue = -1; 
            break;
        }
        currentPathValue = transitionMap.get(currentPathValue);
        
        if (visitedStates.has(currentPathValue)) {
            break;
        }
        visitedStates.set(currentPathValue, sequenceIndex);
    }
    
    if (sequenceIndex < elementCount) {
        const cycleEntryIndex = visitedStates.get(currentPathValue);
        const cycleDuration = sequenceIndex - cycleEntryIndex;
        const preCycleSegmentLength = cycleEntryIndex;

        if (cycleDuration > 0 && iterationGoal > preCycleSegmentLength) {
            const remainingStepsInCycle = (iterationGoal - preCycleSegmentLength) % cycleDuration;
            iterationGoal = preCycleSegmentLength + remainingStepsInCycle;
        }
    }
    
    let finalOutcome = 1;
    for (let stepCounter = 0; stepCounter < iterationGoal; stepCounter++) {
        if (!transitionMap.has(finalOutcome)) {
            console.warn(`Warning: Final path leads to an undefined state: ${finalOutcome}`);
            finalOutcome = -1;
            break;
        }
        finalOutcome = transitionMap.get(finalOutcome);
    }
    
    process.stdout.write(String(finalOutcome) + '\n');
}

try {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const inputProcessor = new InputTokenizer(fileContent);
    SolutionProcessor(inputProcessor);
} catch (error) {
    console.error("Failed to read input or process solution:", error.message);
}