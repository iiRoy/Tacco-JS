function Main(input){
  	var M = parseInt(input.trim().split(" ")[0],10);
  	var H = parseInt(input.trim().split(" ")[1],10);
  	var result = (M === 1 || H === 1)?1:Math.ceil(M*H/2);
  	console.log(result);
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));