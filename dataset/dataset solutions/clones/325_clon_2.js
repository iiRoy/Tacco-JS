String.prototype.padRightWithSpaces = function(totalWidth) {
    var paddingString = '';
    for (  var idx = 0; idx < totalWidth; idx++  ) {
        paddingString += ' ';
    }
    return (paddingString + this).slice(-totalWidth);
};

Number.prototype.padRightWithSpaces = function(desiredWidth) {
    return (  this + ''  ).padRightWithSpaces(desiredWidth);
};

Array.prototype.padRightWithSpaces = function(targetWidth) {
    return this.map( function(element) { return element.padRightWithSpaces(targetWidth); } );
};

Array.prototype.calculateTotal = function() {
    return this.reduce(  function(accumulator, currentValue) { return +currentValue + accumulator; }, 0  );
};


var inputDataLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n');

while ( inputDataLines[0] !== '0' ) {
    var lineCount = +inputDataLines.shift();
    var allRowsData = [];
    var finalRowValues = [];

    for ( var iter = 0; iter < lineCount; iter++ ) {
        var currentLineNumbers = inputDataLines.shift().split(' ');
        allRowsData.push(currentLineNumbers);
        currentLineNumbers.push(currentLineNumbers.calculateTotal());
        console.log(currentLineNumbers.padRightWithSpaces(5).join(''));
    }

    for ( var iter = 0; iter < lineCount + 1; iter++ ) {
        finalRowValues.push( allRowsData.map(function(row) { return row[iter]; }).calculateTotal() );
    }

    console.log(finalRowValues.padRightWithSpaces(5).join(''));
}