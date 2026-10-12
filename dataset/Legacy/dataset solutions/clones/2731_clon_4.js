const solveProblem = (inputString) => {
    const parts = inputString.split(' ');
    const overallDistance = Number(parts[0]);
    const sensorRange = Number(parts[1]);

    const effectiveCoveragePerUnit = sensorRange * 2 + 1;
    
    const result = Math.floor((overallDistance + effectiveCoveragePerUnit - 1) / effectiveCoveragePerUnit);

    console.log(result);
};

solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));
