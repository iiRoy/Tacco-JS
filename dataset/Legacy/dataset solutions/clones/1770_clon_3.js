function validateAnimalLegsCombination(animalCountValue, totalLegsValue) {
    const MIN_LEGS_PER_CREATURE = 2;
    const MAX_LEGS_PER_CREATURE = 4;

    const minimumPossibleLegs = animalCountValue * MIN_LEGS_PER_CREATURE;
    const maximumPossibleLegs = animalCountValue * MAX_LEGS_PER_CREATURE;

    const isWithinBounds = (totalLegsValue >= minimumPossibleLegs && totalLegsValue <= maximumPossibleLegs);
    return isWithinBounds;
}

function processInputData(rawInputString) {
    const cleanedInput = rawInputString.trim();
    const inputSegments = cleanedInput.split(" ");

    const numAnimals = parseInt(inputSegments[0], 10);
    const totalLegsCount = parseInt(inputSegments[1], 10);

    const isCombinationValid = validateAnimalLegsCombination(numAnimals, totalLegsCount);

    if (isCombinationValid) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
