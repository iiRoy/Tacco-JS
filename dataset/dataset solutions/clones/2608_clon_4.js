const fs = require("fs");

const input = fs.readFileSync("/dev/stdin", "utf8").trim().split(/\s+/).map(Number);
let at = 0;
const n = input[at++];

const schedules = Array.from({ length: n }, () => []);
for (let player = 0; player < n; player++) {
    for (let i = 0; i < n - 1; i++) {
        schedules[player].push(input[at++] - 1);
    }
}

function gameId(a, b) {
    if (a > b) {
        const tmp = a;
        a = b;
        b = tmp;
    }
    return a * n + b;
}

const graph = new Map();
const indegree = new Map();
const totalGames = n * (n - 1) / 2;

for (let player = 0; player < n; player++) {
    const gameOrder = schedules[player].map(opponent => gameId(player, opponent));

    for (const game of gameOrder) {
        if (!graph.has(game)) graph.set(game, []);
        if (!indegree.has(game)) indegree.set(game, 0);
    }

    for (let i = 0; i + 1 < gameOrder.length; i++) {
        const currentGame = gameOrder[i];
        const nextGame = gameOrder[i + 1];

        graph.get(currentGame).push(nextGame);
        indegree.set(nextGame, indegree.get(nextGame) + 1);
    }
}

const queue = [];
const day = new Map();

for (const [game, degree] of indegree.entries()) {
    if (degree === 0) {
        queue.push(game);
        day.set(game, 1);
    }
}

let head = 0;
let completed = 0;
let answer = 0;

while (head < queue.length) {
    const game = queue[head++];
    completed++;
    answer = Math.max(answer, day.get(game));

    for (const nextGame of graph.get(game)) {
        const candidateDay = day.get(game) + 1;

        if (!day.has(nextGame) || day.get(nextGame) < candidateDay) {
            day.set(nextGame, candidateDay);
        }

        indegree.set(nextGame, indegree.get(nextGame) - 1);

        if (indegree.get(nextGame) === 0) {
            queue.push(nextGame);
        }
    }
}

console.log(completed === totalGames ? answer : -1);