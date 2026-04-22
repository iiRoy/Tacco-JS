const main = (arg) => {
    let N = arg.split("\n")[0]
    arg = arg.split("\n").splice(1)
    let D1 = arg.map(x=>x.split(" ")[0])
    let D2 = arg.map(x=>x.split(" ")[1])
    
    let count = 0
    let isSame=false
    for(let i=0; i<N; i++) {
        if(D1[i]===D2[i]) {
            count++
            if(count>=3) {
                isSame=true
            }
        } else {
            count=0
        }
    }
    
    console.log(isSame ? "Yes" : "No")

}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
