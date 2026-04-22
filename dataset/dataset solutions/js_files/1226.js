const gInput = require('fs').readFileSync('/dev/stdin', 'utf8')
const input = gInput.split(' ').map( s => parseInt(s))
var W = input[0]
var H = input[1]
var x = input[2]
var y = input[3]
var r = input[4]

var minX = x - r
var maxX = x + r
var minY = y - r
var maxY = y + r

const judge = 0 <= minX && maxX <= W && 0 <= minY && maxY <= H
if(judge){
    console.log('Yes')
} else{
    console.log('No')
}
