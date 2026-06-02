function processInput(rawString) {
    const dateComponents = rawString.split('/');
    const yearValue = Number(dateComponents[0]);
    const monthValue = Number(dateComponents[1]);
    const dayValue = Number(dateComponents[2]);

    const currentCombinedDate = yearValue * 10000 + monthValue * 100 + dayValue;
    const boundaryCombinedDate = 20190501;

    return console.log((currentCombinedDate < boundaryCombinedDate) ? 'Heisei' : 'TBD');
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
