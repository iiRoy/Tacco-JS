function findStartingStation(energy, cost) {
    const totalStations = energy.length;

    for (let start = 0; start < totalStations; start++) {
        let battery = 0;
        let completed = true;

        for (let step = 0; step < totalStations; step++) {
            const station = (start + step) % totalStations;
            battery += energy[station] - cost[station];

            if (battery < 0) {
                completed = false;
                break;
            }
        }

        if (completed) {
            return start;
        }
    }

    return -1;
}

const energy = [1, 2, 3, 4, 5];
const cost = [3, 4, 5, 1, 2];

console.log(findStartingStation(energy, cost)); // 3