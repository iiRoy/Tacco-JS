(function(sourceData) {
    const rawObservations = sourceData.toString().trim().split('\n');
    const processedEvents = rawObservations.slice(1).map(line => {
        const parts = line.match(/^(\d+)\s(\d+)\s(\d+)\s(-?\d+)$/);
        return {
            buildingIndex: parseInt(parts[1], 10),
            floorLevel: parseInt(parts[2], 10),
            chamberIdentifier: parseInt(parts[3], 10),
            valueChange: parseInt(parts[4], 10)
        };
    });

    const occupancyAggregator = processedEvents.reduce((currentMap, event) => {
        const key = `${event.buildingIndex}-${event.floorLevel}-${event.chamberIdentifier}`;
        const currentValue = currentMap.get(key) || 0;
        currentMap.set(key, currentValue + event.valueChange);
        return currentMap;
    }, new Map());

    const BUILDING_COUNT = 4;
    const FLOOR_COUNT = 3;
    const ROOM_COUNT = 10;

    const buildHousingUnit = (depths, currentDepth = 0) => {
        if (currentDepth === depths.length - 1) {
            return Array.from({ length: depths[currentDepth] }, () => 0);
        }
        return Array.from({ length: depths[currentDepth] }, () =>
            buildHousingUnit(depths, currentDepth + 1)
        );
    };

    const housingReportGrid = buildHousingUnit([BUILDING_COUNT, FLOOR_COUNT, ROOM_COUNT]);

    for (let b = 0; b < BUILDING_COUNT; b++) {
        for (let f = 0; f < FLOOR_COUNT; f++) {
            for (let r = 0; r < ROOM_COUNT; r++) {
                const key = `${b + 1}-${f + 1}-${r + 1}`;
                housingReportGrid[b][f][r] = occupancyAggregator.get(key) || 0;
            }
        }
    }

    console.log(housingReportGrid);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));