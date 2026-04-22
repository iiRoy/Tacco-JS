let input = require('fs').readFileSync('/dev/stdin', 'utf8')
// let input = require('fs').readFileSync('./sample_e.txt', 'utf8')
.split(/\n| /)
.slice(0,-1)
.map(item => parseInt(item))

const [height, width, ..._targets] = input
const targets = []

for(let i=1; i<_targets.length; i+=2){
    targets.push([_targets[i], _targets[i+1]])
}

let hlist = new Array(height).fill(0)
let wlist = new Array(width).fill(0)

for(let i=0; i<targets.length; i++){
    hlist[targets[i][0]-1]++
    wlist[targets[i][1]-1]++
}


const hmax = Math.max(...hlist)
const hindexes = []
for (let i=0; i<height; i++) {
    if(hlist[i] === hmax) hindexes.push(i)
}

const wmax = Math.max(...wlist)
const windexes = []
for (let i=0; i<width; i++) {
    if(wlist[i] === wmax) windexes.push(i)
}

for( hitem of hindexes ){
    for( witem of windexes ){
        if(!targets.some(item => item[0]===hitem+1 && item[1]===witem+1)){
            console.log(hmax + wmax)
            return
        }
    }
}

console.log(hmax + wmax - 1)
