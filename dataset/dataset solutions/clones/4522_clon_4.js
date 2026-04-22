function evaluateNumericSequence(sourceFragment) {
    const numericalComponents = sourceFragment.split('\n', 1)[0].split(' ').map(Number);
    
    const [alpha, beta, gamma] = numericalComponents;
    
    const checkValue = (beta * 10) + gamma;
    
    console.log(checkValue % 4 === 0 ? 'TRUTH' : 'FALSEHOOD');
}

const dataAcquirer = require("node:fs");
const acquiredContent = dataAcquirer.readFileSync("/dev/stdin", { encoding: "utf8" });
evaluateNumericSequence(acquiredContent);