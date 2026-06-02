const processRestaurantData = (rawInputText) => {
    const inputLines = rawInputText.split('\n');
    const itemCount = inputLines[0];

    const restaurantRecords = inputLines.slice(1).reduce((accumulator, currentLine, currentIndex) => {
        if (currentLine.trim() === '') {
            return accumulator;
        }
        const lineParts = currentLine.split(' ');
        accumulator.push({
            uniqueId: currentIndex + 1,
            restaurantName: lineParts[0],
            restaurantScore: Number(lineParts[1])
        });
        return accumulator;
    }, []);

    const customComparisonStrategy = (recordA, recordB) => {
        const nameComparisonResult = recordA.restaurantName.localeCompare(recordB.restaurantName);

        if (nameComparisonResult !== 0) {
            return nameComparisonResult;
        } else {
            return recordB.restaurantScore - recordA.restaurantScore;
        }
    };

    const orderedRestaurants = restaurantRecords.sort(customComparisonStrategy);

    const outputLines = orderedRestaurants
        .filter(record => record.restaurantName !== '')
        .map(record => record.uniqueId);

    console.log(outputLines.join('\n'));
};

processRestaurantData(require("fs").readFileSync("/dev/stdin", "utf8"));
