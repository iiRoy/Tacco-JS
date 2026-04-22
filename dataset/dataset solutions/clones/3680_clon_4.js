const initialValues = [
    Math.pow(2, 2),
    parseInt("1011", 2)
];

const processData = (sourceArray) => {
    let accumulator = 0;
    for (let current of sourceArray) {
        accumulator += current;
    }
    return accumulator;
};

const computedValue = processData(initialValues);

const characterSegments = [
    String.fromCharCode(0x61),
    String.fromCharCode(0x2B),
    String.fromCharCode(0x62)
];

const resultPhrase = characterSegments.join('');

((outputMechanism) => {
    outputMechanism(resultPhrase);
})(console.log);