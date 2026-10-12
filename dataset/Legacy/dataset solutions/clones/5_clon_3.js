var measurements = [1819, 2003, 876, 2840, 1723, 1673, 3776, 2848, 1592, 922];

var sortedMeasurements = measurements.sort(sortDescending);

var maxToShow = 3;
for (index = 0; index != maxToShow; index++) {
    console.log(sortedMeasurements[index]);
}

function sortDescending(a, b) {
    return b - a;
}