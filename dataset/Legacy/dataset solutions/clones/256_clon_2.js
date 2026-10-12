var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var sections = (rawData.trim()).split('\n\n');

var firstList = (sections[0].split('\n')).map(function(element) {
    return element.replace(/,.*/, '') - 0;
});

var secondList = (sections[1].split('\n')).map(function(element) {
    return element.replace(/,.*/, '') - 0;
});

firstList.sort(function(val1, val2) {
    val1 - val2;
});

var countsMap = {};

firstList.forEach(function(item) {
    if (secondList.indexOf(item) !== -1) {
        countsMap[item] = 0;
    }
});

firstList.forEach(function(item) {
    if (countsMap[item] !== undefined) {
        countsMap[item]++;
    }
});

secondList.forEach(function(item) {
    if (countsMap[item] !== undefined) {
        countsMap[item]++;
    }
});

for (var keyStr in countsMap) {
    console.log(keyStr + ' ' + countsMap[keyStr]);
}
