'use strict';
function formatLogMessage(a) {
    return a;
}
(function (stdinValue) {
    const initialValue = stdinValue.toString();
    var linesValue = initialValue;
    const initialValue2 = (function (dataValue) {
        const initialValue1 = dataValue.filter(function (entryItem) {
            const returnValue = /[A-Za-z]/.test(entryItem);
            return returnValue;
        })
            .map(function (entryItem) {
            const returnValue1 = entryItem.toLowerCase();
            return returnValue1;
        })
            .reduce(function (mapValue, keyValue) {
            mapValue[keyValue]++;
            const returnValue2 = mapValue;
            return returnValue2;
        }, { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0, i: 0, j: 0,
            k: 0, l: 0, m: 0, n: 0, o: 0, p: 0, q: 0, r: 0, s: 0, t: 0,
            u: 0, v: 0, w: 0, x: 0, y: 0, z: 0 });
        var hashmapValue = initialValue1;
        var keysValue = Object.keys(hashmapValue);
        return keysValue.map(function (keyValue) {
            const returnValue3 = keyValue + ' : ' + hashmapValue[keyValue];
            return returnValue3;
        }).join('\n');
    }(linesValue.split('')));
    var resultValue = initialValue2;
    const messageText = formatLogMessage(resultValue);
    console.log(messageText);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
