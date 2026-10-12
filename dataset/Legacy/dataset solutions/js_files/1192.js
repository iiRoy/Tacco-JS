"use strict";

class Dice {
    /**
     *    +--+
     *    |0 |
     * +--+--+--+--+
     * |3 |1 |2 |4 |
     * +--+--+--+--+
     *    |5 |
     *    +--+
     */
    constructor(stat) {
        this.stat = stat;
    }

    fix(top, front) {
        switch (this.stat.indexOf(top)) {
            case 1: this.rot_ns(1); break;
            case 2: this.rot_we(1); break;
            case 3: this.rot_we(-1); break;
            case 4: this.rot_ns(-1); break;
            case 5: this.rot_ns(2); break;
        }
        while (this.stat[1] !== front) {
            this.rot(1);
        }
    }

    rot(val) {
        if (val < 0) val += 4 * Math.floor(-val / 4) + 4;
        const old_i = [1, 2, 4, 3];
        const new_i = [val, val + 1, val + 2, val + 3].map(elt => old_i[elt % 4]);
        [this.stat[old_i[0]], this.stat[old_i[1]], this.stat[old_i[2]], this.stat[old_i[3]]] =
            [this.stat[new_i[0]], this.stat[new_i[1]], this.stat[new_i[2]], this.stat[new_i[3]]];
    }

    rot_ns(val) {
        if (val < 0) val += 4 * Math.floor(-val / 4) + 4;
        const old_i = [0, 1, 5, 4];
        const new_i = [val, val + 1, val + 2, val + 3].map(elt => old_i[elt % 4]);
        [this.stat[old_i[0]], this.stat[old_i[1]], this.stat[old_i[2]], this.stat[old_i[3]]] =
            [this.stat[new_i[0]], this.stat[new_i[1]], this.stat[new_i[2]], this.stat[new_i[3]]];
    }

    rot_we(val) {
        if (val < 0) val += 4 * Math.floor(-val / 4) + 4;
        const old_i = [0, 2, 5, 3];
        const new_i = [val, val + 1, val + 2, val + 3].map(elt => old_i[elt % 4]);
        [this.stat[old_i[0]], this.stat[old_i[1]], this.stat[old_i[2]], this.stat[old_i[3]]] =
            [this.stat[new_i[0]], this.stat[new_i[1]], this.stat[new_i[2]], this.stat[new_i[3]]];
    }
}


new Promise(function (resolve, reject) {
    let content = "";
    process.stdin.on("data", chunk => { content += chunk; });
    process.stdin.on("end", () => { resolve([content, process.stdout]); });
}).then(function([cin, cout]) {
    const [init, n, ...data] = cin.split("\n");
    const dice = new Dice(init.split(" "));
    for (const [t, f] of data.slice(0, parseInt(n)).map(elt => elt.split(" "))) {
        dice.fix(t, f);
        cout.write(`${dice.stat[2]}\n`);
    }
});

