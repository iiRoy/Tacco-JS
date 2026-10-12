function searchViableOrigin(powerStations, travelRequirements) {
    if (powerStations.length === 0) {
        return -1;
    }

    const numberOfStations = powerStations.length;
    const possibleOrigins = [];

    for (let origin = 0; origin < numberOfStations; origin++) {
        let availablePower = 0;
        let currentStation = origin;
        let visitedStations = 0;

        while (visitedStations < numberOfStations) {
            availablePower =
                availablePower +
                powerStations[currentStation] -
                travelRequirements[currentStation];

            if (availablePower < 0) {
                break;
            }

            currentStation++;

            if (currentStation === numberOfStations) {
                currentStation = 0;
            }

            visitedStations++;
        }

        if (visitedStations === numberOfStations) {
            possibleOrigins.push(origin);
        }
    }

    return possibleOrigins.length === 0
        ? -1
        : possibleOrigins[0];
}

const powerStations = [1, 2, 3, 4, 5];
const requirements = [3, 4, 5, 1, 2];

console.log(
    searchViableOrigin(powerStations, requirements)
); // 3