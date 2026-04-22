function processInputData(rawData) {
    const contentSegments = rawData.split('\n').filter(segment => segment.trim().length > 0);
    const totalPoints = parseInt(contentSegments[0], 10);

    if (totalPoints <= 2) {
        console.log(1);
        return;
    }

    const coordinateEntities = [];
    for (let currentLineIndex = 1; currentLineIndex < contentSegments.length; currentLineIndex++) {
        const valuePairs = contentSegments[currentLineIndex].split(' ').map(val => parseInt(val, 10));
        coordinateEntities.push({ horiz: valuePairs[0], vert: valuePairs[1] });
    }

    const directionFrequency = new Map();

    for (let i = 0; i < coordinateEntities.length; i++) {
        const sourceEntity = coordinateEntities[i];
        for (let j = 0; j < coordinateEntities.length; j++) {
            const targetEntity = coordinateEntities[j];

            if (sourceEntity === targetEntity) {
                continue;
            }

            const hDelta = targetEntity.horiz - sourceEntity.horiz;
            const vDelta = targetEntity.vert - sourceEntity.vert;
            
            const directionKey = `${hDelta}_${vDelta}`;

            directionFrequency.set(directionKey, (directionFrequency.get(directionKey) || 0) + 1);
        }
    }

    let maxFrequencyEncountered = 1; 

    for (const currentCount of directionFrequency.values()) {
        if (currentCount > maxFrequencyEncountered) {
            maxFrequencyEncountered = currentCount;
        }
    }
    
    console.log(totalPoints - maxFrequencyEncountered);
}

processInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));