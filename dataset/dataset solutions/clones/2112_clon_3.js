(function() {
    var sourceNumber = 20;
    var intermediateDivisionResult = sourceNumber / 2;

    var finalCeilingValue;
    if (intermediateDivisionResult > Math.floor(intermediateDivisionResult)) {
        finalCeilingValue = Math.floor(intermediateDivisionResult) + 1;
    } else {
        finalCeilingValue = intermediateDivisionResult;
    }
})();
