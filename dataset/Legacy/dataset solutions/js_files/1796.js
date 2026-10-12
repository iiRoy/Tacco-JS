"use strict";

const main = arg => {
    const input = arg.trim().split("\n");
    const [N, K] = input[0].split(" ").map(el => parseInt(el));
    let As = input[1].split(" ").map(el => parseInt(el))

    for(let ki=0; ki<K; ki++){
        let imos = new Array(N+1).fill(0)
        for(let i = 0; i<N;i++){
            let l = Math.max(0, i - As[i])
            let r = Math.min(i+As[i]+1, N)
            imos[l]++
            imos[r]--
        }
        for(let i = 0; i<N; i++){
            imos[i+1] += imos[i]
        }
        let isDone = true
        for(let i = 0; i<N; i++){
            if(imos[i] !== N){
                isDone = false
                break
            }
        }
        imos.pop()
        As = imos
        if(isDone) break
    }
    console.log(As.join(" "))
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));  
