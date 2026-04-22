var calculateNetValue = function(inputString) {
    var initialMeasurement = parseFloat(inputString);

    var grossProceeds = initialMeasurement * 800;

    var cycleIterations;
    if (initialMeasurement < 0) {
        cycleIterations = 0;
    } else {
        cycleIterations = (initialMeasurement - (initialMeasurement % 15)) / 15 + 1;
    }

    var totalAdjustments = (cycleIterations * 200) + 200;

    console.log(grossProceeds - totalAdjustments);
};

calculateNetValue(require("node:fs").readFileSync("/dev/stdin", "utf8"));