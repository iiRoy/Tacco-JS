require("fs").readFileSync("/dev/stdin","utf8").trim().split("\n").map(function(linea){p=linea.split(" "),console.log(Math.abs((p[2]-p[0])*(p[6]-p[4])+(p[3]-p[1])*(p[7]-p[5]))<1e-10?"NO":"YES")})
