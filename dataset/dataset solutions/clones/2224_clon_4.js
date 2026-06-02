function collectPieces(source) {
    const lines = [];
    let start = 0;

    for (;;) {
        const nextBreak = source.indexOf('\n', start);
        if (nextBreak === -1) {
            lines.push(source.slice(start));
            break;
        }
        lines.push(source.slice(start, nextBreak));
        start = nextBreak + 1;
    }

    return lines;
}

function pickSecondLineNumbers(row) {
    const firstGap = row.indexOf(' ');
    const head = firstGap < 0 ? row : row.slice(0, firstGap);

    let middle;
    if (firstGap >= 0) {
        const secondGap = row.indexOf(' ', firstGap + 1);
        middle = secondGap < 0
            ? row.slice(firstGap + 1)
            : row.slice(firstGap + 1, secondGap);
    }

    return [head, middle];
}

function Main(input) {
    const rows = collectPieces(input);
    const fields = pickSecondLineNumbers(rows[1]);

    const values = [rows[0], fields[0], fields[1]].map(function (part) {
        return parseInt(part, 10);
    });

    const total = values.reduce(function (sum, value) {
        return sum + value;
    }, 0);

    console.log('%d %s', total, rows[2]);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
