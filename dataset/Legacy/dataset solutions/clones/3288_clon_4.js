function getNext(inputLine) {
    const tokens = inputLine.split(/\s+/);
    let currentTokenIndex = 0;
    return () => {
        if (currentTokenIndex < tokens.length) {
            return tokens[currentTokenIndex++];
        }
        return undefined;
    };
}

function solve(params) {
    const H = params.H;
    const W = params.W;
    const S = params.S;

    let totalPairs = 0;
    const visited = Array(H).fill(0).map(() => Array(W).fill(false));

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (visited[r][c]) {
                continue;
            }

            let currentDarkCount = 0;
            let currentLightCount = 0;
            const queue = [[r, c]];
            visited[r][c] = true;

            let head = 0;
            while (head < queue.length) {
                const [currR, currC] = queue[head++];
                const currColor = S[currR][currC];

                if (currColor === '#') {
                    currentDarkCount++;
                } else {
                    currentLightCount++;
                }

                for (let i = 0; i < 4; i++) {
                    const nextR = currR + dr[i];
                    const nextC = currC + dc[i];

                    if (nextR >= 0 && nextR < H && nextC >= 0 && nextC < W && !visited[nextR][nextC]) {
                        if (S[nextR][nextC] !== currColor) {
                            visited[nextR][nextC] = true;
                            queue.push([nextR, nextC]);
                        }
                    }
                }
            }
            totalPairs += currentDarkCount * currentLightCount;
        }
    }
    return totalPairs;
}

function main(line) {
    const next = getNext(line);
    const H = parseInt(next());
    const W = parseInt(next());
    const S = [];
    for (let i = 0; i < H; i++) {
        S[i] = next();
    }
    console.log(solve({ H, W, S }));
}

exports.main = main;

if (require.main === module) {
    const fs = require('fs');
    const inputLine = fs.readFileSync("/dev/stdin", "utf8");
    main(inputLine);
}
