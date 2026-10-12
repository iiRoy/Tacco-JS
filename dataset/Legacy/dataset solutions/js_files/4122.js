((input) => {
    const lines = input.split("\n");
    const N = lines[0] | 0;
    const [C, S, F] = lines.slice(1)
        .map(l => l.split(" ").map(x => x|0))
        .reduce((accumulator, line) => accumulator.map((e, i) => e.concat(line[i])), [[], [], []]);

    const solver = i => {
        if (i === N - 1) return 0;

        let current = i;
        let t = 0;

        while (current !== N - 1) {
            t += Math.max(S[current] - t, t % F[current] !== 0 ? F[current] - t % F[current] : 0) + C[current];
            current++;
        }
        return t;
    };

    Array.from(new Array(N), (_, k) => k).map(solver).forEach(x => console.log(x));

})(require("fs").readFileSync("/dev/stdin", "utf8"));
//})(``);