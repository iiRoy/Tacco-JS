function processInput(rawData) {
    let lines = rawData.split(/\n/);
    let values = lines[0].split(/\s/).map(Number);
    let iterationCount = Number(lines[1]);

    for (let idx = 0; idx < iterationCount; idx++) {
        if (values[1] >= values[2]) {
            values[2] *= 2;
        } else if (values[0] >= values[1]) {
            values[1] *= 2;
        }
    }

    if (values[1] <= values[2] && values[0] <= values[1]) {
        console.log('yes');
    } else {
        console.log('no');
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
