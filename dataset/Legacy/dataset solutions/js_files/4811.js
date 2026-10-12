function Main(input){

    input = input.split('\n')
    const n = input[0]
    const As = input[1].split(' ')

    const pairs = {}
    for(let i=0; i<n; i++){
        let val = As[i]
        pairs[val] = pairs[val] === undefined
            ? 1
            : pairs[val]+1
    }

    for(let i=n-1; i>0; i-=2){
        if(pairs[i] !== 2){
            console.log(0)
            return
        }
    }
    console.log(Math.pow(2, Math.floor(n/2)))
}

//var input = require("fs").readFileSync("hoge.txt", "utf8")
var input = require('fs').readFileSync('hoge.txt', 'utf8')
Main(input)
