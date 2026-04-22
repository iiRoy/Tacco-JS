const numeralBase = 10;
const exponentValue = 8;
const subtrahend = 1;

const numericRepresentation = Math.pow(numeralBase, exponentValue) - subtrahend;

const textualOutput = numericRepresentation.toString();

function presentContent(payload) {
    if (typeof console !== 'undefined' && console.log) {
        console.log(payload);
    } else if (typeof document !== 'undefined' && document.write) {
        document.write(payload);
    } else if (typeof process !== 'undefined' && process.stdout && process.stdout.write) {
        process.stdout.write(payload + '\n');
    }
}

presentContent(textualOutput);