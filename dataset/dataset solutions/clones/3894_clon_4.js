function examineNumericalSeries(sourceData) {
    const dataLines = sourceData.split('\n');

    const thresholdValue = Number(dataLines[0].split(' ')[2]);

    const numericalSeries = dataLines[1].split(' ').map(Number);

    const exceedingCount = numericalSeries.filter(val => val > thresholdValue).length;

    const nonExceedingCount = numericalSeries.length - exceedingCount;

    console.log(Math.min(exceedingCount, nonExceedingCount));
}

examineNumericalSeries(require("fs").readFileSync("/dev/stdin", "utf8"));