const calculateSummation = (inputString) => {
    const processSegments = (remainingSegments, currentTotal) => {
        if (remainingSegments.length === 0) {
            return currentTotal;
        }

        const [firstElement, ...restElements] = remainingSegments;
        const numericalValue = parseInt(firstElement, 10);
        
        return processSegments(restElements, currentTotal + numericalValue);
    };

    const initialSegments = inputString.split('\n');
    const finalResult = processSegments(initialSegments, 0);
    
    console.log(finalResult);
};

const acquiredData = require("node:fs").readFileSync("/dev/stdin", "utf8");
calculateSummation(acquiredData);