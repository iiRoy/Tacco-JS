function*stdinIter(){const t=require("fs").readFileSync("/dev/stdin","utf-8").trim().split(/\n|\s/);yield*t}function readMany(t,e){const i=e||this.iter||(this.iter=stdinIter()),n=[];for(let e=0;e<t;e+=1)n.push(i.next().value);return n};

(() => {
    const [ n ] = readMany(1).map(it => parseInt(it))
    console.log('start')
    let sum = 0

    for (let k = 1; k <= n; k += 1) {
        let count = 0
        for (let i = 1; i ** 2 <= k; i += 1) {
            if (k % i == 0) count += 1
        }
        count *= 2
        if (Number.isInteger(Math.sqrt(k))) count -= 1
        if (k == 1) count = 1
        sum += k * count
    }

    console.log(sum)
})()
