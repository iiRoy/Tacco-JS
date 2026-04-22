const acquireNumericalParameters = () => {
    const dataSource = require('node:fs').readFileSync(process.stdin.fd, 'utf8');
    return dataSource.split(' ').map(x => +x);
};

const evaluateScenario = (alpha, beta, gamma) => {
    const ruleset = [
        {
            condition: (x, y, z) => x < (y + 1),
            result: (x, y, z) => x + 1
        },
        {
            condition: (x, y, z) => z <= (y + 2),
            result: (x, y, z) => x + 1
        }
    ];

    for (const rule of ruleset) {
        if (rule.condition(alpha, beta, gamma)) {
            return rule.result(alpha, beta, gamma);
        }
    }

    const differenceMeasure = alpha - beta; 

    const computationStrategy = {
        true: (x, y, z, dm) => y + (z - y) * ((dm + 1) / 2), 
        false: (x, y, z, dm) => y + (z - y) * (dm / 2) + 1 
    };

    const isDifferenceMeasureOdd = (differenceMeasure % 2 !== 0);

    return computationStrategy[isDifferenceMeasureOdd](alpha, beta, gamma, differenceMeasure);
};

const [firstValue, secondValue, thirdValue] = acquireNumericalParameters();
console.log(evaluateScenario(firstValue, secondValue, thirdValue));