function chooseDeparturePoint(generatedEnergy, requiredEnergy) {
    if (generatedEnergy.length === 0) {
        return -1;
    }

    let planetaryBalance = 0;
    let shipBattery = 0;
    let departureCandidate = 0;

    for (let station = 0; station < generatedEnergy.length; station++) {
        const energyDifference =
            generatedEnergy[station] - requiredEnergy[station];

        planetaryBalance += energyDifference;
        shipBattery += energyDifference;

        if (shipBattery < 0) {
            departureCandidate = station + 1;
            shipBattery = 0;
        }
    }

    if (planetaryBalance < 0) {
        return -1;
    }

    return departureCandidate;
}

const generatedEnergy = [1, 2, 3, 4, 5];
const requiredEnergy = [3, 4, 5, 1, 2];

console.log(
    chooseDeparturePoint(generatedEnergy, requiredEnergy)
); // 3