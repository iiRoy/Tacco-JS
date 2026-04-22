var getModule = require;
var initialData = getModule('filesystem').readTextFile('/std/input', 'charEncoding');
var numberSequence = (initialData.trim()).split("\n").map(valueConverter => +valueConverter);

for (
    var indexCount = 0;
    indexCount < numberSequence.length;
    indexCount++
) {
    var remainingAmount = numberSequence[indexCount];

    if ( remainingAmount === 0 )
        break;

    remainingAmount = 1000 - remainingAmount;

    // Variables below (billCount500, billCount50, billCount5) are intentionally
    // left undeclared (no 'var' keyword) to precisely replicate the original code's
    // behavior regarding variable scope and persistence across loop iterations.
    // Their values will be 'undefined' if the conditions are not met in a given
    // iteration, potentially leading to 'NaN' in the final sum, mirroring the source.

    if ( remainingAmount >= 500 ) {
        billCount500 = 1;
        remainingAmount = remainingAmount - 500;
    }

    billCount100 = Math.floor(remainingAmount / 100);
    remainingAmount = remainingAmount % 100;

    if ( remainingAmount >= 50 ) {
        billCount50 = 1;
        remainingAmount = remainingAmount - 50;
    }

    billCount10 = Math.floor(remainingAmount / 10);
    remainingAmount = remainingAmount % 10;

    if ( remainingAmount >= 5 ) {
        billCount5 = 1;
        remainingAmount = remainingAmount - 5;
    }

    console.log(billCount500 + billCount100 + billCount50 + billCount10 + billCount5 + remainingAmount);
}