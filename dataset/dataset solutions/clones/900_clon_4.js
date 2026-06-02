const rL = require('readline');

const iS = rL.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const dM = new Map([
    ['north', '0'],
    ['west', '1']
]);

const rP = (s) => s.replace(/north|west/g, (m) => dM.get(m));

const cD = (s) => {
    const l = s.length;
    if (l === 0) {
        return { d: 0, p: -1 }; // Consistent with original's handling of empty string
    }
    const iP = l - 1;
    const mD = 90 * Math.pow(2, iP);

    const fD = s.split('').reduceRight((cD, c, i) => {
        const v = parseInt(c, 10);
        const tV = 90 * Math.pow(2, i);
        return v === 1 ? Math.min(mD, cD + tV) : Math.max(0, cD - tV);
    }, 0);

    return { d: fD, p: iP };
};

const sF = (n, e) => {
    while (e > 0 && n % 2 === 0) {
        n /= 2;
        e--;
    }
    return { n, e };
};

iS.on('line', (lI) => {
    if (lI === '#') {
        iS.close();
        return;
    }

    const tL = rP(lI);
    const { d: currentDeg, p: initialPower } = cD(tL);
    const { n: finalNum, e: finalExp } = sF(currentDeg, initialPower);

    if (finalExp > 0) {
        console.log(`${finalNum}/${Math.pow(2, finalExp)}`);
    } else {
        console.log(finalNum);
    }
});
