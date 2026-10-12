'use strict'

const main = arg => {
    arg = arg.trim().split("\n")
    const N = ~~(arg[0].split(" ")[0]);
    const M = ~~(arg[0].split(" ")[1]);
    let arr = arg.slice(1, N + 1);
    let points = arg.slice(N + 1, M + N + 1);

    const parse = v => {
        let temp = v.split(" ").map(vv => parseInt(vv))
        return {
            x: temp[0],
            y: temp[1]
        }
    }
    
    arr = arr.map(parse);
    points = points.map(parse);


    let indexArr = [];
    arr.forEach((v, i) => {
        let minDist = 1000000000;
        let index = 0;
        
        points.forEach((w, j) => {
            let dist = Math.abs(v.x - w.x) + Math.abs(v.y - w.y);
            if(dist < minDist){
                minDist = dist;
                index = j;
            }
        })
        
        indexArr.push(index);
    })

    indexArr.forEach(v => console.log(v + 1));
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))
