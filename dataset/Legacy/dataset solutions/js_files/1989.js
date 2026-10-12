function Main(input) {
    const inputArr = input.split("\n");
    const tarStr = inputArr[1]
    let i = 1
    let tarS = []
    while (i <= inputArr[0]) {
        tarS.push(i)
        i++
    }
    let num = 0;
    const check =(v1,v2,v3)=> {
        return v1 !== v2 && v2 !== v3 && v3 !== v1
    }
    tarS.forEach(first=>{
        tarS.forEach(second=>{
            tarS.forEach(third=>{
                if (check(tarStr[first-1],tarStr[second-1],tarStr[third-1]) && first < second && second < third && (second - first !== third - second)) {
                    console.log(first, second, third)
                    num ++;
                }
            })
        })
    })
    console.log(num)
}
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
