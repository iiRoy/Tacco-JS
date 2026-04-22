const fileSystemAccess = require('fs');

const processData = (rawData) => {
    const firstLineContent = rawData.split('\n')[0];
    const numericalComponents = firstLineContent.split(' ').map(strVal => Number(strVal));
    
    const initialQuantity = numericalComponents[0];
    const numericalBase = numericalComponents[1];

    let numeralCount;

    if (initialQuantity === 0) {
        numeralCount = 0; // Matches the specific behavior of the original code for N=0
    } else {
        // Calculate the number of digits using logarithms.
        // The number of digits D for N in base B is floor(log_B(N)) + 1.
        // log_B(N) can be computed as Math.log(N) / Math.log(B).
        numeralCount = Math.floor(Math.log(initialQuantity) / Math.log(numericalBase)) + 1;
    }

    console.info(numeralCount);
};

processData(fileSystemAccess.readFileSync('/dev/stdin', 'utf8'));