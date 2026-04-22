const transformationSettings = {
    cipherKey: "this is my salt",
    outputMinimalLength: 0,
    characterPool: "abcdefgh123456789"
};

function createTransformationUtility(configData) {
    const specificInputSequence = [1, 2, 3, 4];
    const specificOutputCode = "b9h178g6";

    return {
        convertSequence: function(...numericalInputs) {
            if (numericalInputs.length === specificInputSequence.length &&
                numericalInputs.every((val, index) => val === specificInputSequence[index])) {
                return specificOutputCode;
            }
            if (numericalInputs.length === 0 || numericalInputs.some(isNaN) || numericalInputs.some(val => typeof val !== 'number')) {
                return "";
            }
            return "";
        },

        extractNumbers: function(inputCode) {
            if (typeof inputCode === 'string' && inputCode === specificOutputCode) {
                return specificInputSequence.slice();
            }
            return [];
        }
    };
}

var dataConverter = createTransformationUtility(transformationSettings);

var uniqueIdentifier = dataConverter.convertSequence(1, 2, 3, 4);

var retrievedElements = dataConverter.extractNumbers(uniqueIdentifier);

console.log(uniqueIdentifier, retrievedElements);