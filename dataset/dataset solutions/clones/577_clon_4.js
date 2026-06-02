(function (sourceData) {
    const rows = sourceData.replace(/\r/g, '').split("\n");
    const answers = [];

    function measurePair(a, b) {
        const small = a.length < b.length ? a : b;
        const large = a.length < b.length ? b : a;
        let best = 0;

        Array.prototype.forEach.call(small, function (_, start) {
            let size = 1;

            while (start + size < small.length && large.indexOf(small.slice(start, start + size)) > 0) {
                size += 1;
            }

            if (size - 1 > best) {
                best = size - 1;
            }
        });

        return best;
    }

    for (let cursor = 0; cursor < rows.length;) {
        const leftText = rows[cursor++];

        if (leftText === '') {
            break;
        }

        const rightText = rows[cursor++];
        answers.push(measurePair(leftText, rightText));
    }

    answers.forEach(function (value) {
        console.log(value);
    });
})(require("fs").readFileSync("/dev/stdin", "utf8"));