"use strict";

class Inputer {
    constructor(t) {
        if (typeof t === 'undefined') throw new Error('引数（stdin）を省略できません！');
        this.cnt = 0;
        this.items = t.split(/\n|\s/);
    }

    getInt() {
        return parseInt(this.items[this.cnt++], 10);
    }

    getIntArray(t) {
        if (typeof t === 'undefined') throw new Error('引数（1以上）を省略できません！');
        let r = new Array(t);
        for (let e = 0; e < t; e++) r[e] = this.getInt();
        return r;
    }

    getStr() {
        return this.items[this.cnt++];
    }

    getStrArray(t) {
        if (typeof t === 'undefined') throw new Error('引数（1以上）を省略できません！');
        let r = new Array(t);
        for (let e = 0; e < t; e++) r[e] = this.getStr();
        return r;
    }
}

function calculateOptimalProfit(itemCollection, itemCount, circuitLength) {
    const N = itemCount;
    const C = circuitLength;

    const extendedItems = [...itemCollection, { pos: C, val: 0 }];

    const prefixProfits = Array(N + 1).fill(0);
    for (let k = 1; k <= N; k++) {
        prefixProfits[k] = prefixProfits[k - 1] + extendedItems[k].val - (extendedItems[k].pos - extendedItems[k - 1].pos);
    }

    const suffixProfits = Array(N + 1).fill(0);
    suffixProfits[N] = 0;
    for (let k = N - 1; k >= 0; k--) {
        suffixProfits[k] = suffixProfits[k + 1] + extendedItems[k + 1].val - (extendedItems[k + 2].pos - extendedItems[k + 1].pos);
    }

    let currentMaximumProfit = Number.MIN_SAFE_INTEGER;

    for (let n = 0; n <= N; n++) {
        currentMaximumProfit = Math.max(currentMaximumProfit, prefixProfits[n]);
    }

    for (let n = 0; n <= N; n++) {
        for (let m = n; m < N; m++) {
            const combinedPathProfit = prefixProfits[n] - extendedItems[n].pos + suffixProfits[m];
            currentMaximumProfit = Math.max(currentMaximumProfit, combinedPathProfit);
        }
    }

    return currentMaximumProfit;
}

function Main(input) {
    let inputParser = new Inputer(input);
    let N_items = inputParser.getInt();
    let C_circumference = inputParser.getInt();

    let originalItemData = [{ pos: 0, val: 0 }];
    for (let i = 0; i < N_items; i++) {
        originalItemData.push({ pos: inputParser.getInt(), val: inputParser.getInt() });
    }

    let overallMaximum = calculateOptimalProfit(originalItemData, N_items, C_circumference);

    let counterClockwiseItems = [{ pos: 0, val: 0 }];
    for (let i = N_items; i >= 1; i--) {
        counterClockwiseItems.push({
            pos: C_circumference - originalItemData[i].pos,
            val: originalItemData[i].val
        });
    }
    counterClockwiseItems.sort((a, b) => a.pos - b.pos);

    overallMaximum = Math.max(overallMaximum, calculateOptimalProfit(counterClockwiseItems, N_items, C_circumference));

    console.log(overallMaximum);
}

if (typeof window === "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));
