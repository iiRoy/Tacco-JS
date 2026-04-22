const main = H => {
    const r = []
    var count = 0
    for(var i = 0;i<=H.length;i++) {
            if(H[i] >= H[i+1]) {
                count++
            }else{
                r.push(count)
                count = 0
            }
        }   
    return r
}

const input = require('fs').readFileSync('/dev/stdin','utf8').split('\n')
const H = input[1].split(" ").map( x => Number(x))
console.log(Math.max(...main(H)))