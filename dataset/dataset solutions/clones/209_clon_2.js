function locateLaunchPoint(supplies, consumption) {
    const locationCount = supplies.length;

    for (let origin = 0; origin < locationCount; origin++) {
        let remainingPower = 0;
        let successfulTrip = true;

        for (let movement = 0; movement < locationCount; movement++) {
            const currentLocation =
                (origin + movement) % locationCount;

            remainingPower +=
                supplies[currentLocation] -
                consumption[currentLocation];

            if (remainingPower < 0) {
                successfulTrip = false;
                break;
            }
        }

        if (successfulTrip) {
            return origin;
        }
    }

    return -1;
}

const supplies = [1, 2, 3, 4, 5];
const consumption = [3, 4, 5, 1, 2];

console.log(locateLaunchPoint(supplies, consumption)); // 3