"use strict";
const input = Number(require("fs").readFileSync("/dev/stdin","UTF-8").trim());

if (input === 3 || input === 5 || input === 7) console.log("YES");
else console.log("NO");
