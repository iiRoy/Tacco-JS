const checkLoop = function(tmp, n, mod) {
    for(let i = 0; i < n; i++) {
        if(tmp[i] === mod) {
            return i;
        }
    }
    return n;
};

const main = function(arg) {
    const values = arg.trim().split(" ").map(Number);
    const N = values[0];
    const X = values[1];
    const M = values[2];

    let tmp = Array(M).fill(0);
    let mods = Array(M).fill(-1);

    tmp[0] = X;
    mods[X] = 0;

    let i = 1;
    let loopStart = 0;

    while(i < M) {
        tmp[i] = tmp[i - 1] * tmp[i - 1] % M;

        if(mods[tmp[i]] !== -1) {
            loopStart = mods[tmp[i]];
            break;
        }

        mods[tmp[i]] = i;
        i++;
    }

    const loopEnd = i;
    const loopLength = loopEnd - loopStart;
    const loopCount = Math.floor(N / loopLength);

    let ans = 0;
    let sumOfLoop = 0;

    for(let j = loopStart; j < loopEnd; j++) {
        sumOfLoop = sumOfLoop + tmp[j];
    }

    ans = ans + sumOfLoop * loopCount;

    for(let j = 0; j < loopStart; j++) {
        ans += tmp[j];
    }

    const rest = N - loopStart - loopLength * loopCount;

    for(let j = loopStart; j < loopStart + rest; j++) {
        ans = ans + tmp[j];
    }

    console.log(ans);
};

main(require("fs").readFileSync("/dev/stdin", "utf8"));