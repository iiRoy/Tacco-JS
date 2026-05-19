const rli = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

rli.on('line', (inputLine) => {
    const charArray = [...inputLine];

    const { lastC, firstF } = charArray.reduce((acc, char, idx) => {
        if (char === 'C') {
            acc.lastC = idx;
        }
        if (char === 'F' && acc.firstF === -1) {
            acc.firstF = idx;
        }
        return acc;
    }, { lastC: -1, firstF: -1 });

    let result;
    if (lastC === -1) {
        result = firstF === -1 ? "Yes" : "No";
    } else {
        result = firstF !== -1 && firstF >= lastC ? "Yes" : "No";
    }
    console.log(result);
    rli.close();
});
