function Main(input) {
    const rows = input.trim().split("\n").map(function(line) { return line.split(" "); });
    const limit = 1000000;

    function collectNumbers(onlyOdd) {
        const result = [];
        for (let n = 1; ; n++) {
            const value = n * (n + 1) * (n + 2) / 6;
            if (value >= limit) break;
            if (!onlyOdd || value % 2 === 1) result.push(value);
        }
        return result;
    }

    function buildByLayers(coins) {
        const distance = new Int16Array(limit);
        distance.fill(-1);
        distance[0] = 0;

        let frontier = new Int32Array(limit);
        let next = new Int32Array(limit);
        let frontierSize = 1;
        let reached = 1;
        let steps = 0;
        frontier[0] = 0;

        while (frontierSize > 0 && reached < limit) {
            steps++;
            let nextSize = 0;
            for (let i = 0; i < frontierSize; i++) {
                const base = frontier[i];
                for (let j = 0; j < coins.length; j++) {
                    const candidate = base + coins[j];
                    if (candidate < limit && distance[candidate] === -1) {
                        distance[candidate] = steps;
                        next[nextSize++] = candidate;
                        reached++;
                    }
                }
            }
            const swap = frontier;
            frontier = next;
            next = swap;
            frontierSize = nextSize;
        }

        return distance;
    }

    const allCounts = buildByLayers(collectNumbers(false));
    const oddCounts = buildByLayers(collectNumbers(true));

    while (true) {
        const query = rows.shift();
        if (query[0] === '0') break;
        console.log(allCounts[query] + " " + oddCounts[query]);
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
