var elevationReadings = [1819, 2003, 876, 2840, 1723, 1673, 3776, 2848, 1592, 922];
var topElevations = [];

elevationReadings.forEach(function(currentElevation) {
    if (topElevations.length < 3) {
        topElevations.push(currentElevation);
        topElevations.sort((valA, valB) => valB - valA);
    } else if (currentElevation > topElevations[2]) {
        topElevations[2] = currentElevation;
        topElevations.sort((valA, valB) => valB - valA);
    }
});

console.log(topElevations.join('\n'));
