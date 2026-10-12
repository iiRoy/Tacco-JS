const fs = require("fs");

const input = fs.readFileSync("/dev/stdin", "utf8");
const lines = input.trim().split("\n");

function makeMatrix(limit, states) {
    const table = [];
    for (let i = 0; i <= limit; i++) {
        table[i] = [];
        for (let j = 0; j <= states; j++) {
            table[i][j] = Infinity;
        }
    }
    return table;
}

function relaxForward(dp, from, to, cost) {
    dp[to][0] = Math.min(dp[to][0], dp[from][0] + cost);
    dp[to][1] = Math.min(dp[to][1], dp[from][0]);
    dp[to][2] = Math.min(dp[to][2], dp[from][1]);
    dp[to][2] = Math.min(dp[to][2], dp[from][2] + cost);
}

while (true) {
    const nm = lines.shift().split(" ").map(Number);
    if (nm.join(" ") === "0 0") break;

    const nodeLimit = nm[0] + 100;
    const edgeCount = nm[1];
    const stateCount = 2;
    const startNode = 1;
    const destination = nm[0];

    const edges = [];
    for (let i = 0; i < edgeCount; i++) {
        edges.push(lines.shift().split(" ").map(Number));
    }

    const dp = makeMatrix(nodeLimit, stateCount);
    dp[startNode][0] = 0;

    const queue = [startNode];
    const visited = {};

    while (true) {
        if (queue.length === 0) break;

        const current = queue.shift();
        if (visited.hasOwnProperty(current)) continue;
        visited[current] = true;

        edges.forEach(function (edge) {
            const a = edge[0];
            const b = edge[1];
            const cost = edge[2];

            if (a === current) {
                relaxForward(dp, a, b, cost);
                queue.push(b);
            } else if (b === current) {
                relaxForward(dp, b, a, cost);
                queue.push(a);
            }
        });
    }

    let answer = Infinity;
    dp[destination].forEach(function (value, index) {
        if (index !== 1) answer = Math.min(answer, value);
    });

    console.log(answer);
}