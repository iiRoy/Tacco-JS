const initialNumericData = [40, 100, 1, 5, 25, 10];
var numericElements = initialNumericData;

function descendingComparator(firstVal, secondVal) {
    const comparisonResult = secondVal - firstVal;
    return comparisonResult;
}

numericElements.sort(descendingComparator);
console.log(numericElements);
