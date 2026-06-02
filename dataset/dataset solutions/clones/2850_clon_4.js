'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let source = '';
let cursor = 0;

process.stdin.on('data', chunk => {
    source += chunk;
});

process.stdin.on('end', () => {
    source = source.split('\n');
    run();
});

function line() {
    return source[cursor++];
}

class BinaryMaxHeap {
    constructor() {
        this.data = [];
    }

    push(score, rest) {
        const item = [score, rest];
        const data = this.data;
        data.push(item);
        let i = data.length - 1;
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (data[p][0] >= score) break;
            data[i] = data[p];
            i = p;
        }
        data[i] = item;
    }

    pop() {
        const data = this.data;
        if (data.length === 0) return null;
        const top = data[0];
        const last = data.pop();
        if (data.length !== 0) {
            let i = 0;
            while (true) {
                let left = i * 2 + 1;
                if (left >= data.length) break;
                let right = left + 1;
                let child = right < data.length && data[right][0] > data[left][0] ? right : left;
                if (data[child][0] <= last[0]) break;
                data[i] = data[child];
                i = child;
            }
            data[i] = last;
        }
        return top;
    }

    get length() {
        return this.data.length;
    }
}

function exactSweepForOddCosts(limit, costs, rewards) {
    const seen = Array(limit + 1).fill(0);
    Array.from({ length: limit + 1 }, (_, amount) => {
        seen[amount] = costs.reduce((best, cost, idx) => {
            if (amount >= cost) {
                const proposed = seen[amount - cost] + rewards[idx];
                return best < proposed ? proposed : best;
            }
            return best;
        }, amount);
    });
    return seen[limit];
}

function exchange(limit, costs, rewards) {
    const ordinary = costs.every(v => Number.isFinite(v) && v > 0);
    if (!ordinary) {
        return exactSweepForOddCosts(limit, costs, rewards);
    }

    const bestGainAtRest = Array(limit + 1).fill(-Infinity);
    const heap = new BinaryMaxHeap();
    bestGainAtRest[limit] = 0;
    heap.push(0, limit);

    let answer = -Infinity;

    while (heap.length) {
        const [gain, rest] = heap.pop();
        if (gain !== bestGainAtRest[rest]) continue;

        const finishedHere = gain + rest;
        if (answer < finishedHere) answer = finishedHere;

        for (let k = 0; k < 3; k++) {
            const price = costs[k];
            if (rest >= price) {
                const nextRest = rest - price;
                const nextGain = gain + rewards[k];
                if (bestGainAtRest[nextRest] < nextGain) {
                    bestGainAtRest[nextRest] = nextGain;
                    heap.push(nextGain, nextRest);
                }
            }
        }
    }

    return answer;
}

function run() {
    const n = parseInt(line(), 10);
    const a = line().split(' ').map(token => parseInt(token, 10));
    const b = line().split(' ').map(token => parseInt(token, 10));

    const afterFirstMarket = exchange(n, a, b);
    const afterSecondMarket = exchange(afterFirstMarket, b, a);
    console.log(afterSecondMarket);
}
