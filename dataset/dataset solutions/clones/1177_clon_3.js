(function(sourceText) {
    var rows = sourceText.split('\n');
    while (true) {
        var rawCount = rows.shift();
        var count = Number(rawCount);
        if (count === 0) {
            return;
        }
        var rawSequence = rows.shift();
        var separated = rawSequence.split(' ', count);
        var numbers = separated.map(function(value) {
            return Number(value);
        });
        var answer = standardDeviation(numbers);
        console.log(answer);
    }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function mean(list) {
    var total = list.reduce(function(left, right) {
        var added = left + right;
        return added;
    });
    var average = total / list.length;
    return average;
}

function variance(list) {
    var average = mean(list);
    var totalVariance = 0;
    list.forEach(function(value) {
        var difference = value - average;
        var squaredDifference = Math.pow(difference, 2);
        var contribution = squaredDifference / list.length;
        totalVariance += contribution;
    });
    return totalVariance;
}

function standardDeviation(list) {
    var varianceValue = variance(list);
    var deviation = Math.sqrt(varianceValue);
    return deviation;
}
