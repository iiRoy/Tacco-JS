function main(arg) {
    //const input = arg.split("\n")
    let N = Number(arg)
    
    while (N >= 1000) {
        N %= 1000
    }
    console.log(N)
    //console.log(N === 1000 ? 0 : 1000-N)


}

//main("1900")
main(require("fs").readFileSync("/dev/stdin", "utf8"));