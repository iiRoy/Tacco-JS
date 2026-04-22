Object.defineProperties(Array.prototype, {
    pInt: {
        value() {
            return this.map(i => i - 0);
        },
    },
    rot: {
        value() {
            var tmp = this[0].map(i => [i]);
            this.slice(1).forEach(ary => {
                ary.forEach((val, idx) => tmp[idx].push(val));
            });
            return tmp;
        }
    }
});
(i => {
    var n, m, l, a, b, out = [];
    i = i.replace(/\n/g, ',');
    [n, m, l] = i.split(/[ ,]/).pInt();
    [a, b]    = (lines => [
        lines.slice(0, n).map(i => i.split(' ').pInt()),
        lines.slice(n)   .map(i => i.split(' ').pInt())
    ])(i.split(',').slice(1));
    b = b.rot();
    for (i = 0; i < n; i++) {
        var line = [];
        for (j = 0; j < l; j++) {
            line.push(a[i].reduce((acc, cur, idx) => {
                return acc + cur * b[j][idx];
            }, 0));
        }
        out.push(line.join(' '));
    }
    console.log(out.join('\n'));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
