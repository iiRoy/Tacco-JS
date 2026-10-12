(function(rawInputContent) {
    var lineSegments = rawInputContent.split('\n');

    var countForS = Number(lineSegments.shift());
    var sStringValues = lineSegments.shift().split(' ');
    var sNumericValues = sStringValues.map(function(strVal) {
        return Number(strVal);
    });
    var uniqueSourceElements = new Set(sNumericValues);

    var countForT = Number(lineSegments.shift());
    var tStringValues = lineSegments.shift().split(' ');
    var tNumericValues = tStringValues.map(function(strVal) {
        return Number(strVal);
    });

    var totalMatches = 0;

    for (const currentTargetElement of tNumericValues) {
        if (uniqueSourceElements.has(currentTargetElement)) {
            totalMatches++;
        }
    }

    console.log(totalMatches);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
