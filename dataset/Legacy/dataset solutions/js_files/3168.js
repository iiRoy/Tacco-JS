a = require("fs").readFileSync("/dev/stdin", "utf8").split('/').map(Number);
console.log(a[0] >= 2019 && a[1] >= 5 ? 'TBD' : 'Heisei');