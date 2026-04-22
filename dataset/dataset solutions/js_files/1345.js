var Main = function(r){
	console.log(Math.pow(r, 2) * Math.PI + " " + Math.PI * r * 2);
};

Main(require("fs").readFileSync("/dev/stdin", "utf8"));