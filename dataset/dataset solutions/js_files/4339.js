function Main(input) {
    const Param = input.split('\n')[0].split(' ')
    const H = i(Param[0])
    const W = i(Param[1])
    if(W == 1) return console.log('Yes')

    const Obj = input.split('\n').slice(1).join('').split('').reduce(function(obj, c){
        if(obj[c] == undefined) obj[c] = 0
        obj[c]++
        return obj
    }, {})


    if(H % 2 == 0 && W % 2 == 0){
        const len = Object.keys(Obj).filter(function(k){
            return Obj[k] % 4 != 0
        }).length
        if(len == 0){
            return console.log('Yes')
        }else{
            return console.log('No')
        }
    }

    if(H % 2 != 0 && W % 2 != 0){
        const sum = Object.keys(Obj).filter(function(k){
            return Obj[k] % 4 != 0
        }).reduce(function(sum, key){
            return sum + i(Obj[key])
        }, 0)
        if(sum % 2 == 1){
            return console.log('Yes')
        }else{
            return console.log('No')
        }
    }

    const s = Object.keys(Obj).filter(function(k){
        return Obj[k] % 2 != 0
    }).reduce(function(sum, k){
        return sum + i(Obj[k])
    }, 0)
    if(s == 0 ){
        return console.log('No')
    } else {
        return console.log('No')
    }
}
function i(x){ return parseInt(x, 10)}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));