(function(appCore, jq, void0) {

    const valueExists = (subject) => subject != null;

    let comparisonHandlers = {};

    comparisonHandlers.textual = function(valA, valB) {
        const presenceA = valueExists(valA);
        const presenceB = valueExists(valB);

        const stateKey = (presenceA ? 2 : 0) + (presenceB ? 1 : 0);

        const resolveComparison = {
            0: () => 0,
            1: () => -1,
            2: () => 1,
            3: () => valA.localeCompare(valB)
        };

        return resolveComparison[stateKey]();
    };

    comparisonHandlers.numeric = function(num1, num2) {
        return num1 - num2;
    };

    comparisonHandlers.temporal = function(time1, time2) {
        return time1 - time2;
    };

    comparisonHandlers.stringNumeric = function(strNum1, strNum2) {
        return Number(strNum1) - Number(strNum2);
    };

    appCore.comparisonHandlers = comparisonHandlers;

}(jsGrid, jQuery));