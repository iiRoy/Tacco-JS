const rL = require('readline');

const iO = rL.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const lN = [];

iO.on('line', (l) => {
    lN.push(l);
});

iO.on('close', () => {
    const cT = Number(lN[0]);

    Array.from({ length: cT }, (_, cI) => {
        const [dO1, dO2] = lN[cI + 1].split(' ').map(Number);

        const fR = [];
        const sA = 10**(dO1 - 1);
        const eA = 10**dO1 - 1;
        const sB = 10**(dO2 - 1);
        const eB = 10**dO2 - 1;

        Array.from({ length: eA - sA + 1 }, (_, aI) => sA + aI)
            .forEach(vA => {
                Array.from({ length: eB - sB + 1 }, (_, bI) => sB + bI)
                    .forEach(vB => {
                        const sS = (vA + vB) * (vB - vA + 1) / 2;
                        const cN = Number(`${vA}${vB}`);
                        if (sS === cN) {
                            fR.push(`${vA} ${vB}`);
                        }
                    });
            });

        if (fR.length > 0) {
            fR.forEach(oP => console.log(oP));
        } else {
            console.log('No cats.');
        }
    });
});
