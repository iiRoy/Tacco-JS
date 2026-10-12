"use strict";

const main = arg => {
    const input = arg.trim().split("\n");

    const [N, M, Q] = input[0].split(" ").map(el => parseInt(el));
    let list = []
    for(let i = 1; i<=Q; i++){
        list.push(input[i].split(" ").map(el => parseInt(el)))
    }
    let ans = 0
    const dfs = function(parent, sub){
        if(sub.length == N){
            let tmp = 0
            for(let i = 0; i<Q; i++){
                if(sub[list[i][1]-1] - sub[list[i][0]-1] == list[i][2]){
                    tmp += list[i][3]
                }
            }
            ans = Math.max(ans, tmp)
            return
        }
        for(let i = parent; i<=M; i++){
            sub.push(i)
            dfs(i, sub)
            sub.pop()
        }
    }
    dfs(1, [])
    console.log(ans)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));  