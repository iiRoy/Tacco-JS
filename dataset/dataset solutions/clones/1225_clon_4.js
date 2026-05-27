'use strict';
process.stdin.on('data', function(dataBuffer) {
    const numericValues = dataBuffer.toString().trim().split(' ').map(parseFloat);

    const geometry = {
        extentWidth: numericValues[0],
        extentHeight: numericValues[1],
        centerX: numericValues[2],
        centerY: numericValues[3],
        shapeRadius: numericValues[4]
    };

    const conditionPredicates = [
        (g) => (g.extentWidth - g.centerX - g.shapeRadius) >= 0,
        (g) => (g.extentWidth - g.centerX + g.shapeRadius) <= g.extentWidth,
        (g) => (g.extentHeight - g.centerY - g.shapeRadius) <= 0,
        (g) => (g.extentHeight - g.centerY + g.shapeRadius) >= g.extentHeight
    ];

    const allConditionsMet = conditionPredicates.every(predicate => predicate(geometry));

    console.log(allConditionsMet ? 'Yes' : 'No');
});

process.stdin.resume();
process.stdin.setEncoding('utf8');
