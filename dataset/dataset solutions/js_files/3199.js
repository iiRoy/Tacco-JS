function main(arg) {
    const [_n, _k] = arg.replace(/\r?\n/g,"").split(" ")
    const n = Number(_n)
    const k = Number(_k)

    if(n + 1 - (k * 2) >= 0){
        console.log("YES")
    }else{
        console.log("NO")
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
