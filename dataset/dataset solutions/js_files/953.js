const line = require('fs').readFileSync('/dev/stdin', 'utf-8').trim().split('\n');

// {index: List {id, val}} -> {vart, edge}
const getMST = graph => {
    const v = [0];
    const result = [];
    const l = Object.keys(graph).length;

    while(v.length != l) {
        const vert = v.map(x => graph[x])
                      .reduce((acc, x) => [...acc, ...x])
                      .filter(x => v.every(y => y !== x.id))

        const min = vert.reduce((acc, x) => acc.val > x.val ? x : acc);
        
        v.push(min.id);
        result.push(min);
    }

    return result;
};


const data = line
    .slice(1)
    .map(x => {
        return x.trim().split(' ')
            .map((y, i) => { return {id: i, val: Number(y)}; })
            .filter(x => x.val !== -1);
    })
    .reduce((acc, x, i) => {
        acc[i] = x;
        return acc;
    }, {});

console.log(getMST(data).reduce((acc, x) => acc + x.val, 0));

