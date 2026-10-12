function Main(input) {
    inputs = input.split(/\n/)
    const N = i(inputs[0])
    const K = i(inputs[1])
    const X = inputs[2].split(' ')
    const ans = X.reduce(function(sum, x, y){
        if(Math.abs(K - i(x)) < x){
            return sum + Math.abs(K - i(x))
        } else {
            return i(sum) + i(x)
        }
    }, 0)
    console.log(ans)
}
function i(x){ return parseInt(x, 10)}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));