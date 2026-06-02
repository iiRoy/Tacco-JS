let input = require("fs").readFileSync("/dev/stdin", "utf8");

function processNetwork({ input, load, yesno, math_sum, log_json }) {
    const [nodeCount, edgeCount] = load(2);
    const [firstEndpoints, secondEndpoints] = load(edgeCount, 2);

    const networkConnections = new Array(nodeCount + 1).fill(null).map(() => []);
    for (let i = 0; i < edgeCount; i++) {
        const u = firstEndpoints[i];
        const v = secondEndpoints[i];
        networkConnections[u].push(v);
        networkConnections[v].push(u);
    }

    const predecessorMap = new Array(nodeCount + 1).fill(0);
    predecessorMap[0] = -1;
    predecessorMap[1] = -1;

    const visitQueue = [1];

    while (visitQueue.length) {
        operationGuard();

        const currentRoom = visitQueue.shift();

        for (const neighborNode of networkConnections[currentRoom]) {
            if (predecessorMap[neighborNode] === 0) {
                predecessorMap[neighborNode] = currentRoom;
                visitQueue.push(neighborNode);
            }
        }
    }

    if (predecessorMap.slice(2).some(marker => marker === 0)) {
        return 'No';
    }

    console.log('Yes');
    return predecessorMap.slice(2).join('\n');
}

let inputs = input.split(/[\s\n]/);
let operationGuardCounter = 0;
let outcome = processNetwork({
    input,
    yesno: value => value ? 'Yes' : 'No',
    math_sum: numbers => numbers.reduce((acc, cur) => acc + cur, 0),
    load(rows = 1, cols = 1, type = Number) {
        const length = rows * cols;
        let result = inputs.splice(0, length);
        if (type !== String) result = result.map(type);
        if (cols > 1) {
            const arrays = new Array(cols);
            for (let col = 0; col < cols; col++) {
                arrays[col] = new Array();
                for (let row = 0; row < rows; row++) {
                    arrays[col].push(result[row * cols + col]);
                }
            }
            result = arrays;
        }
        return result;
    },
    log_json(value) {
        console.log(JSON.stringify(value));
    },
});

if (outcome === undefined) {
    console.warn("outcome is undefined");
} else {
    console.log(outcome);
}

function operationGuard(max = 1e5) {
    operationGuardCounter++;
    if (operationGuardCounter >= max) {
        throw new Error("Infinite loop");
    }
}

function math_max(numbers, initial_value = null) {
    let result = (initial_value === null) ? numbers[0] : initial_value
    for(const n of numbers) if(n > result) result = n
    return result
}

function math_min(numbers, initial_value = null) {
    let result = (initial_value === null) ? numbers[0] : initial_value
    for(const n of numbers) if(n < result) result = n
    return result
}

function math_prime_factors(n) {
    const result = {}

    for(let i = 2; i * i <= n; i++) {
        if(n % i === 0) {
            n /= i
            result[i] = 1
            
            while(n % i === 0) {
                n /= i
                result[i]++
            }
        }
    }

    if(n > 1) result[n] = 1

    return result
}
