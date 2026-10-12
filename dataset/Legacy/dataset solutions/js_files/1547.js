const main = input => {
    const [D,T,S] = input.split(" ")
    if(T>=(D/S)) {
        console.log("Yes")
    }else{
        console.log("No")
    }
}

main(require('fs').readFileSync('/dev/stdin','utf8'))