var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var countN = +lines.shift();
var sourceNumbers = lines.shift().trim().split(' ').map(Number);
var countQ = +lines.shift();
var targetSums = lines.shift().trim().split(' ').map(Number);

targetSums.forEach(function(currentTarget) {
    if (canAchieveSum(sourceNumbers, currentTarget)) {
        console.log('yes');
    } else {
        console.log('no');
    }
});

function canAchieveSum(availableValues, desiredTotal) {
    const possible = new Array(desiredTotal + 1).fill(false);
    possible[0] = true;

    for (const value of availableValues) {
        for (let currentSum = desiredTotal; currentSum >= value; currentSum--) {
            if (possible[currentSum - value]) {
                possible[currentSum] = true;
            }
        }
    }

    return possible[desiredTotal];
}
