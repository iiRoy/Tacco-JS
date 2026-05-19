var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var numericValues = (rawData.trim()).split("\n").map(Number);

numericValues.forEach(function(currentWeight) {
    var categoryLabel = "";
    // Define the array of weight class names
    var weightClasses = "light fly,fly,bantam,feather,light,light welter,welter,light middle,middle,light heavy,heavy".split(",");

    // Determine the weight category based on the current weight
    if (currentWeight <= 48) {
        categoryLabel = weightClasses[0];
    }
    if (currentWeight > 48) {
        categoryLabel = weightClasses[1];
    }
    if (currentWeight > 51) {
        categoryLabel = weightClasses[2];
    }
    if (currentWeight > 54) {
        categoryLabel = weightClasses[3];
    }
    if (currentWeight > 57) {
        categoryLabel = weightClasses[4];
    }
    if (currentWeight > 60) {
        categoryLabel = weightClasses[5];
    }
    if (currentWeight > 64) {
        categoryLabel = weightClasses[6];
    }
    if (currentWeight > 69) {
        categoryLabel = weightClasses[7];
    }
    if (currentWeight > 75) {
        categoryLabel = weightClasses[8];
    }
    if (currentWeight > 81) {
        categoryLabel = weightClasses[9];
    }
    if (currentWeight > 91) {
        categoryLabel = weightClasses[10];
    }

    console.log(categoryLabel);
});
