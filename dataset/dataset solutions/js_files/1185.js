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
    const [init, command] = cin.split("\n").slice(0, 2);
    const dice = new Dice(init.split(" ").map(elt => parseInt(elt)));
    for (const ch of command) {
        switch (ch) {
            case "N": dice.rot_ns(1); break;
            case "S": dice.rot_ns(-1); break;
            case "W": dice.rot_we(1); break;
            case "E": dice.rot_we(-1); break;
        }
    }
    cout.write(`${dice.stat[0]}\n`);
});

