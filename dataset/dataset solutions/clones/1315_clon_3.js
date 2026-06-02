(function(sourceText) {
    var letterTotals = [];
    var startCode = 'a'.charCodeAt(0);
    var finishCode = 'z'.charCodeAt(0);

    for (var position = startCode; position <= finishCode; position++) {
        letterTotals[String.fromCharCode(position)] = 0;
    }

    sourceText.split('').forEach(function(currentChar) {
        currentChar = currentChar.toLowerCase();
        if (currentChar in letterTotals) {
            letterTotals[currentChar]++;
        }
    });

    console.log(Object.keys(letterTotals).map(function(letterKey) {
        return letterKey + ': ' + this[letterKey];
    }, letterTotals).join('\n'));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function parse(str, sep, ter) {
    sep = typeof(sep) !== 'undefined' ? sep : ' ';
    ter = typeof(ter) !== 'undefined' ? ter : '\n';
    str = str.replace(/\n$/, '');
    var parsedRows = str.split(ter);
    for (var rowIndex = 0; rowIndex < parsedRows.length; rowIndex++) {
        parsedRows[rowIndex] = parsedRows[rowIndex].split(sep);
    }
    return parsedRows;
}