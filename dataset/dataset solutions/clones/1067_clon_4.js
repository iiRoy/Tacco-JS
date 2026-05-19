function performCountingSort(sourceArray, targetArray, maximumValue) {
    const valueCounts = Array.from({ length: maximumValue + 1 }, () => 0);

    sourceArray.forEach(item => {
        valueCounts[item]++;
    });

    const computeCumulative = (arr, currentIdx = 1) => {
        if (currentIdx <= maximumValue) {
            arr[currentIdx] += arr[currentIdx - 1];
            computeCumulative(arr, currentIdx + 1);
        }
    };
    computeCumulative(valueCounts);

    sourceArray.slice().reverse().forEach(element => {
        targetArray[valueCounts[element] - 1] = element;
        valueCounts[element]--;
    });
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var n = +lines.shift();
var A = lines.shift().split(' ').map(function(i){return +i;});
var B = [];

performCountingSort(A, B, 10000);

console.log(B.join(' '));
