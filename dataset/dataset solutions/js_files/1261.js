const res = require('fs').readFileSync('/dev/stdin','utf8')
    .match(/^[\s\S]*?(?=\n0 0)/g)[0]
    .split('\n')
    .map(r=>r.split(' ')
        .map(Number))
    .map(([H,W])=>[...Array(H).keys()]
        .map((val,i,a)=>((!i || i===Math.max(...a)) ?'#':'.')
            .repeat(W)
            .replace(/(^\.|\.$)/g,'#'))
        .join('\n'))
    .join('\n\n')
    .concat('\n');
console.log(res)
