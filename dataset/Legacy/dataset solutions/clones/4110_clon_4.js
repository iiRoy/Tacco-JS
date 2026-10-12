"use strict";

const replayOriginalCorner = (pairs, n, hp) => {
    pairs.sort((a, b) => b[0] - a[0]);

    let throwSum = 0;
    const strongest = pairs[0][0];

    for (let i = 0; i < n; i++) {
        if (pairs[i][1] > strongest) {
            throwSum += pairs[i][1];
        }
    }

    let count = 0;
    count += Math.ceil((hp - throwSum) / strongest);
    count = Math.max(0, count);

    hp -= count * strongest;

    if (hp <= 0) {
        return count;
    }

    pairs.sort((a, b) => b[1] - a[1]);

    for (let i = 0; i < n; i++) {
        hp -= pairs[i][1];
        count++;
        if (hp <= 0) break;
    }

    return count;
};

const main = input => {
    const rows = input.trim().split("\n");
    const n = parseInt(rows[0].split(" ")[0]);
    const hp0 = parseInt(rows[0].split(" ")[1]);

    const pairs = rows.slice(1, n + 1).map(row => row.split(" ").map(x => parseInt(x)));

    let strongest = pairs[0][0];
    let cornerCase = !Number.isFinite(hp0);
    const disposable = [];

    for (let i = 0; i < n; i++) {
        const attack = pairs[i][0];
        const singleUse = pairs[i][1];

        if (!Number.isFinite(attack) || !Number.isFinite(singleUse) || !(attack > 0)) {
            cornerCase = true;
        }

        if (attack > strongest) strongest = attack;
        disposable.push(singleUse);
    }

    if (cornerCase || !(strongest > 0) || !Number.isFinite(strongest)) {
        console.log(replayOriginalCorner(pairs, n, hp0));
        return;
    }

    const usefulThrows = disposable
        .filter(value => value > strongest)
        .sort((a, b) => b - a);

    let usedThrowDamage = 0;
    let bestPlan = Infinity;

    for (let usedThrows = 0; usedThrows <= usefulThrows.length; usedThrows++) {
        let neededSwings = Math.ceil((hp0 - usedThrowDamage) / strongest);
        if (neededSwings < 0) neededSwings = 0;

        const totalActions = usedThrows + neededSwings;
        if (totalActions < bestPlan) bestPlan = totalActions;

        if (usedThrows < usefulThrows.length) {
            usedThrowDamage += usefulThrows[usedThrows];
        }
    }

    console.log(bestPlan);
};

main(require("fs").readFileSync("/dev/stdin", "utf8"));
