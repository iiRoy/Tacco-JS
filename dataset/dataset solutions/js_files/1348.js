var R = +require("fs").readFileSync("/dev/stdin", "utf8")
console.log((R*R*Math.PI).toFixed(6) + ' ' + (R*2*Math.PI).toFixed(6));