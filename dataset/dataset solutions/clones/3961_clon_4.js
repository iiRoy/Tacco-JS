(function() {
    const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    const cleanInput = String(sourceContent).trim();
    
    const numericalMatches = cleanInput.match(/-?\d+/g);
    
    const parsedValues = numericalMatches.map(strValue => parseInt(strValue, 10));

    const [valueOne, valueTwo, valueThree] = parsedValues;

    const evaluationOutcome = valueOne >= (valueThree - valueTwo);

    const messageMap = {
        true: "Yes",
        false: "No"
    };

    console.log(messageMap[evaluationOutcome]);

})();