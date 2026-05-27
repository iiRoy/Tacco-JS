const descendingComparator = (firstVal, secondVal) => {
    return secondVal - firstVal;
};

const originalMeasurements = [1819, 2003, 876, 2840, 1723, 1673, 3776, 2848, 1592, 922];
const orderedValues = originalMeasurements.sort(descendingComparator);

const LIMIT_FOR_DISPLAY = 3;
let displayIndex = 0;

while (displayIndex < LIMIT_FOR_DISPLAY) {
    console.log(orderedValues[displayIndex]);
    displayIndex++;
}
