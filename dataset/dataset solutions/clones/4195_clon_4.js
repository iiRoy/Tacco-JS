async function obtainSourceData() {
    return new Promise(resolve => {
        let fullText = '';
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', chunk => {
            fullText += chunk;
        });
        process.stdin.on('end', () => {
            resolve(fullText.split(/\r?\n/));
        });
    });
}

function calculateMaximizedOutcome(subjectCount, subjectFeatures, valueTable) {
    let topScore = Number.MIN_SAFE_INTEGER;
    const maxConfigurationMask = (1 << 10); // Represents 2^10 possible combinations of 10 items

    for (let currentMask = 0; currentMask < maxConfigurationMask; currentMask++) {
        // If the current mask is 0, it means no categories are active.
        // The original code returns MIN_SAFE_INTEGER if all are closed.
        // We handle this by skipping this configuration as a valid choice,
        // ensuring topScore remains MIN_SAFE_INTEGER if no other choice is better.
        if (currentMask === 0) {
            continue;
        }

        let currentConfigurationTotal = 0;
        const subjectOverlapCounts = Array(subjectCount).fill(0);

        // For each subject, count how many of its features align with the currently active categories
        for (let sIdx = 0; sIdx < subjectCount; sIdx++) {
            for (let categoryIdx = 0; categoryIdx < 10; categoryIdx++) {
                // Check if the 'categoryIdx' bit is set in 'currentMask'
                const isCategoryActive = (currentMask >> categoryIdx) & 1;
                
                // Check if the subject has a feature in this 'categoryIdx'
                const hasSubjectFeature = (subjectFeatures[sIdx][categoryIdx] === 1);

                if (isCategoryActive && hasSubjectFeature) {
                    subjectOverlapCounts[sIdx]++;
                }
            }
        }

        // Aggregate the scores for the current configuration
        for (let sIdx = 0; sIdx < subjectCount; sIdx++) {
            const matches = subjectOverlapCounts[sIdx];
            currentConfigurationTotal += valueTable[sIdx][matches];
        }

        // Update the highest score found so far
        if (currentConfigurationTotal > topScore) {
            topScore = currentConfigurationTotal;
        }
    }

    return topScore;
}

async function launchProcessing() {
    const rawLines = await obtainSourceData();
    const subjectQuantity = parseInt(rawLines[0], 10);

    const featureSets = Array.from({ length: subjectQuantity }, (_, lineIndex) => {
        return rawLines[1 + lineIndex].split(' ').map(Number);
    });

    const profitMetrics = Array.from({ length: subjectQuantity }, (_, lineIndex) => {
        return rawLines[1 + subjectQuantity + lineIndex].split(' ').map(Number);
    });

    const finalResult = calculateMaximizedOutcome(subjectQuantity, featureSets, profitMetrics);
    console.log(finalResult);
}

launchProcessing();