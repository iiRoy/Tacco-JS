function verifyPartition(partitionLimit) {
    var isFeasible = true;
    var numPartitions = 0;
    var currentPartitionSum = 0;

    for (var itemIndex = 0; itemIndex < valueSequence.length; itemIndex++) {

        if (partitionLimit < valueSequence[itemIndex]) {
            isFeasible = false;
            break;
        } else if (currentPartitionSum + valueSequence[itemIndex] === partitionLimit) {
            currentPartitionSum = 0;
            numPartitions++;
        } else if (currentPartitionSum + valueSequence[itemIndex] > partitionLimit) {
            currentPartitionSum = valueSequence[itemIndex];
            numPartitions++;
        } else if (currentPartitionSum + valueSequence[itemIndex] < partitionLimit) {
            currentPartitionSum += valueSequence[itemIndex];
        }

        if (numPartitions === maxAllowedPartitions) {
            isFeasible = false;
            break;
        }
    }
    return isFeasible;
}


var fileData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineFragments = fileData.trim().split("\n");

while (true) {

    var configLine = lineFragments.shift();

    if (configLine === "0 0") {
        break;
    }

    configLine = configLine.split(" ").map(Number);
    var maxAllowedPartitions = configLine[0];
    var totalValues = configLine[1];

    var valueSequence = [];
    while (totalValues--) {
        valueSequence.push(lineFragments.shift() - 0);
    }

    var lowRange = 0;
    var highRange = 1500000;

    while (true) {
        var midValue = Math.floor((lowRange + highRange) / 2);

        if (verifyPartition(midValue)) {
            highRange = midValue - 1;
        } else {
            lowRange = midValue + 1;
        }

        if (lowRange > highRange) {
            break;
        }
    }

    console.log(highRange + 1);
}