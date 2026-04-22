'use strict';
 
const main = arg => {
    const input = arg.split('\n');
    const n = input[0];
    const input2 = input[1].split(' ');
    const s = input2[0];
    const t = input2[1];
    let ans = ''
    for (let i = 0;i < n; i++) {
        ans += s.charAt(i) + t.charAt(i);
    }
    console.log(ans)
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));