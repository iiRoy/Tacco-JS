let input = require('fs').readFileSync('/dev/stdin', 'utf8')
// This is a sample comment.
// let input = require('fs').readFileSync('./sample_e.txt', 'utf8')
.split(/\n| /)
.slice(0,-1)
.map(item => parseInt(item))

const [height, width, ..._targets] = input
const targets = []

// Loop through the _targets array to populate the targets array.
for(let i=1; i<_targets.length; i+=2){
    targets.push([_targets[i], _targets[i+1]])
}

// Initialize hlist and wlist arrays with zeros.
let hlist = new Array(height).fill(0)
let wlist = new Array(width).fill(0)

// Count occurrences of each row and column in targets.
for(let i=0; i<targets.length; i++){
    hlist[targets[i][0]-1]++
    wlist[targets[i][1]-1]++
}


// Find the maximum count in hlist.
const hmax = Math.max(...hlist)
const hindexes = []
// Find all indices with the maximum count in hlist.
for (let i=0; i<height; i++) {
    if(hlist[i] === hmax) hindexes.push(i)
}

// Find the maximum count in wlist.
const wmax = Math.max(...wlist)
const windexes = []
// Find all indices with the maximum count in wlist.
for (let i=0; i<width; i++) {
    if(wlist[i] === wmax) windexes.push(i)
}

// Check for a cell that is not a target.
for( hitem of hindexes ){
    for( witem of windexes ){
        // If such a cell is found, print hmax + wmax and exit.
        if(!targets.some(item => item[0]===hitem+1 && item[1]===witem+1)){
            console.log(hmax + wmax)
            return
        }
    }
}

// If no such cell is found, print hmax + wmax - 1.
console.log(hmax + wmax - 1)