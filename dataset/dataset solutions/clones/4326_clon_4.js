process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';
process.stdin.on('data', function(chunk) {
    inputBuffer += chunk;
});

process.stdin.on('end', function() {
    processInput(inputBuffer.split(/\r?\n/));
});

function processInput(lines) {
    const targetN = parseInt(lines[0], 10);

    const solution = findEgyptianFractionSolution(targetN);

    console.log(solution[0] + ' ' + solution[1] + ' ' + solution[2]);

    return 0;
}

function findEgyptianFractionSolution(targetNValue) {
    let foundSolution = null;

    const upperLimit = 3500;

    const targetReciprocal = 4 / targetNValue;

    Array.from({ length: upperLimit - 1 }, (_, idxH) => idxH + 1).some(firstComponent => {
        const firstComponentReciprocal = 1 / firstComponent;

        if (targetReciprocal < firstComponentReciprocal + (2 / upperLimit)) {
            return false;
        }

        Array.from({ length: upperLimit - firstComponent }, (_, idxN) => idxN + firstComponent).some(secondComponent => {
            const secondComponentReciprocal = 1 / secondComponent;

            if (targetReciprocal < firstComponentReciprocal + secondComponentReciprocal + (1 / upperLimit)) {
                return false;
            }

            const remainingFraction = targetReciprocal - firstComponentReciprocal - secondComponentReciprocal;

            if (remainingFraction <= 0) {
                return false;
            }

            const thirdComponentExact = 1 / remainingFraction;

            if (Number.isInteger(thirdComponentExact) &&
                thirdComponentExact >= secondComponent &&
                thirdComponentExact < upperLimit) {

                foundSolution = [firstComponent, secondComponent, thirdComponentExact];
                return true;
            }
            return false;
        });

        return foundSolution !== null;
    });

    return foundSolution;
}
