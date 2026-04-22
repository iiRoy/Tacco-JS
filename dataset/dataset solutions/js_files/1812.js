const main = arg => {
    const input = arg.trim().split("\n");
    const n = parseInt(input[0]);
    const arr = input[1].split(" ").map(item => BigInt(item));

    if(arr.includes(0n)){
        console.log(0)
        return
    } 
    let ret = 1n
    for(let item of arr){
        ret = ret*item
        if(ret > BigInt(1000000000000000000)){
            console.log(-1)
            return
        }
    }
    console.log(ret.toString())
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));  
