process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.once('data', function(inputData) {
    const numericValue = Number(inputData.toString().trim());

    const universalCircleFactor = Math.acos(-1) * 2;

    function evaluateCircularMetric(quantity, multiplier) {
        return quantity * multiplier;
    }

    const finalResult = evaluateCircularMetric(numericValue, universalCircleFactor);

    process.stdout.write(finalResult.toString() + '\n');
});