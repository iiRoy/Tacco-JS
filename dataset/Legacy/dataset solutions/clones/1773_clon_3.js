function processInput(rawData) {
    const processedLines = rawData.trim().split('\n');
    
    const firstLineParts = processedLines[0].split(' ');
    const targetVal = Number(firstLineParts[0]);
    const forbiddenCountStr = firstLineParts[1]; 
    
    if (forbiddenCountStr === '0') {
        console.log(targetVal);
        return;
    }
    
    const excludedNumbers = processedLines[1].split(' ');
    
    const isNumberExcluded = (numToCheck) => {
        return excludedNumbers.includes(`${numToCheck}`);
    };

    for (let offset = 1; offset < 101; offset++) {
        const candidateBelow = targetVal - offset;
        const candidateAbove = targetVal + offset;

        if (!isNumberExcluded(candidateBelow)) {
            console.log(candidateBelow);
            return;
        }
        
        if (!isNumberExcluded(candidateAbove)) {
            console.log(candidateAbove);
            return;
        }
    }
    
    console.log('error');
    return;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
