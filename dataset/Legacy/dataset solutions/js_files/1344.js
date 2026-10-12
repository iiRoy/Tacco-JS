var log = console.log;
if (typeof process != "undefined") {
	var input = "";
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function (chunk) {
		input += chunk;
	});
	process.stdin.on('end', function () {
		var lines = input.split("\n");
		main(lines);
	});
}
var mod = 1000000007;
function rec(m,n){
	if(n <= 3){
		return Math.pow(m,n) % mod;
	}
	if(n % 2 == 0){
		return Math.pow(rec(m,n/2),2) % mod;
	}else{
		return (Math.pow(rec(m,(n-1)/2),2) * m) % mod;
	}
}
function main(lines){
  var k = lines[0];
  var j = k.split(" ").map(function(e){return Number(e);});
  log(rec(j[0],j[1]));
}