"use strict";

function main(arg) {
    let input = arg.trim().split("\n");
    const T = input.shift()
    
    for(let t=0; t<T; t++) {
        const N = input[0+t*3];// the number of vetices
        const A = input[1+t*3].split(" ").map(a=>Number(a));// vertex for which depth and subTreeSize are drawn
        const S = input[2+t*3]

        let x = 0
        S.toString().split("").forEach((s,i)=> {
            //console.log(s)
            let newX_count1 = (x^A[i]).toString(2).split("").filter(x=>x==1).length
            let x_count1 = x.toString().split("").filter(x=>x==1).length
            console.log(`S${s} will do..`)
            console.log(`  1 count for new = ${newX_count1}, or ${x^A[i]}`)
            console.log(`  1 count for old = ${x_count1}, or ${x}`)
            if(s==0) {
                // 上書きした方が1が多く場合、do nothing
                if(newX_count1 > x_count1) {
                    //console.log(`    nothing`)
                } else {
                    //console.log(`    overwrite from ${x.toString(2)} to ${(x^A[i],2).toString(2)}`)
                    x = x^A[i]
                }
                //x = x^A[i]
            } else {
                if(newX_count1 > x_count1) {
                    //console.log(`    overwrite from ${x.toString(2)} to ${(x^A[i],2).toString(2)}`)
                    x = x^A[i]
                } else {
                    //console.log(`    nothing`)
                }
            }
        })
        
        console.log(`${x ? "1" : "0"}`)
    }
}


//main("2\n2\n1 2\n10\n2\n1 1\n10")
main(require("fs").readFileSync("/dev/stdin", "utf8"));