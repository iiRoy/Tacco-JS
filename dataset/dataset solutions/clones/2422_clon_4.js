(function() {
    const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
    const cleanedData = sourceData.trim();
    const numericalValue = Number(cleanedData);
    const computedOutcome = numericalValue * numericalValue;
    console.log(computedOutcome);
})();
