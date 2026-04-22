const processInput = (rawText) => {
    const lines = rawText.trim().split("\n");
    const quantityVal = parseInt(lines[0]);
    const numericData = lines[1].split(" ").map(Number);

    const occurrenceMap = numericData.reduce((acc, currentVal) => {
        acc[currentVal] = (acc[currentVal] || 0) + 1;
        return acc;
    }, {});

    const dataValues = Object.keys(occurrenceMap).map(Number);
    if (dataValues.length === 0) {
        console.log(0);
        return;
    }
    const minVal = Math.min(...dataValues);
    const maxVal = Math.max(...dataValues);

    let peakCount = 0;

    for (let currentCenter = minVal - 1; currentCenter <= maxVal + 1; currentCenter++) {
        let currentTally = 0;
        currentTally += (occurrenceMap[currentCenter - 1] || 0);
        currentTally += (occurrenceMap[currentCenter] || 0);
        currentTally += (occurrenceMap[currentCenter + 1] || 0);
        
        if (currentTally > peakCount) {
            peakCount = currentTally;
        }
    }
    
    console.log(peakCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));