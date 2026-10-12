const config = {
    input: '/dev/stdin',
    newline: '\n'
};

const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);

const pos = (x, y) => {
    return { x : x, y : y};
};

const div = (p1, p2, n) => {
    if (n === 0) return [];
    const cos = Math.cos(Math.PI / 3.0);
    const sin = Math.sin(Math.PI / 3.0);

    const s = pos((2 * p1.x + p2.x) / 3, (2 * p1.y + p2.y) / 3);
    const t = pos((p1.x + 2 * p2.x) / 3, (p1.y + 2 * p2.y) / 3);
    const u = pos( (t.x - s.x) * cos - (t.y - s.y) * sin + s.x
                 , (t.x - s.x) * sin + (t.y - s.y) * cos + s.y
                 );
    
    return div(p1, s, n - 1)
               .concat(s)
               .concat(div(s, u, n - 1))
               .concat(u)
               .concat(div(u, t, n - 1))
               .concat(t)
               .concat(div(t, p2, n - 1));
};

const solve = (n) => {
    if (n === 0) return [pos(0.0, 0.0), pos(100.0, 0.0)];
    return [pos(0.0, 0.0), ...div(pos(0.0, 0.0), pos(100.0, 0.0), n), pos(100.0, 0.0)];
};
solve(parseInt(line[0]))
    .forEach(p => {
        console.log(p.x.toFixed(8), p.y.toFixed(8));
    });

