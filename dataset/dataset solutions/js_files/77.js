var input = parseInt(require("fs").readFileSync("/dev/stdin", "utf8").trim());
var ans = 1;
for(var i=1;i<input;i++){
	ans*=i;
}
console.log(ans);