function stringSequenceGenerator() {
    var baseCharacterValue = 97;
    var patternEncoding = "000001011012";

    var phraseUnits = [];
    for (var position = 0; position < patternEncoding.length; position += 3) {
        phraseUnits.push(patternEncoding.substring(position, position + 3));
    }

    var resultStrings = phraseUnits.map(function(unit) {
        return String.fromCharCode.apply(null, unit.split('').map(function(digit) {
            return baseCharacterValue + parseInt(digit, 10);
        }));
    });

    resultStrings.forEach(function(text) {
        console.log(text);
    });
}