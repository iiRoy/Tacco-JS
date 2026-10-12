const main = (N,S) => {
    var count = {} 
    for(var i = 0;i<N;i++) {
      	var tmp = S[i].sort().join('')
        if(tmp in count) {
            count[tmp] = 1
        }else{
            count[tmp] += count[tmp]+1
        }
    }
  	return Object.values(count).filter(i => Number.isNaN(i) === false ).reduce((i,x) => { return x+i},0)
}

const input = require('fs').readFileSync('/dev/stdin','utf8').split("\n")
const N = Number(input[0])
const S = input.slice(1).map(x => Array.from(x))
console.log(main(N,S))