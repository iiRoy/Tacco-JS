"use strict";
const main = input => {
    let s = input[0], ans;
    if (s[0] == s[1] && s[2] == s[3] && s[0] != s[2]) ans=1;
    if (s[0] == s[2] && s[1] == s[3] && s[0] != s[1]) ans=1;
    if (s[0] == s[3] && s[1] == s[2] && s[0] != s[1]) ans=1;
    console.log(ans==1?'Yes':'No');
}
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));