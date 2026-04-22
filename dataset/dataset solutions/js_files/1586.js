const { format } = require('path')

// let input = require('fs').readFileSync('/dev/stdin', 'utf8')
let input = require('fs').readFileSync('./sample_e.txt', 'utf8')
.split(/\n| /)
// .map(item => parseInt(item))
.slice(0,-1)

const [height, width, ..._targets] = input
const targets = _targets.slice(1)
let numMap = []

// Map作成
for(let i=0; i<height; i++){
    numMap.push([])
    for(let j=0; j<width; j++){
        numMap[i].push(0)
    }
}

const leng = targets.length / 2
for(let i=0; i<leng; i++){
    const [_Y, _X] = targets.slice(2*i, 2*i+2)
    const Y = _Y - 1
    const X = _X - 1
    for(let j=0; j<width; j++){
        numMap[Y][j] += 1 
    }
    for(let j=0; j<height; j++){
        numMap[j][X] += 1 
    }
    numMap[Y][X] -= 1
}

let Max = 0
for(let i=0; i<height; i++){
    for(let j=0; j<width; j++){
        if(Max < numMap[i][j]) Max = numMap[i][j]
    }
}

console.log(Max)