var big = Math.pow(10,9) + 7;

function factorialize(num) {
   var result = num;
   for (var i = 1; i < num; i++){
   	result = (result * i) % big;
   }
   return result;
}

function Main(input){
	var split = input.split(" ");
	var n = Number(split[0]);
	var m = Number(split[1]);

	if(Math.abs(n-m) >= 2){
		return 0;
	}
	if(n === m){
		return factorialize(n)*factorialize(m) * 2 % big ;
	}
	return factorialize(n)*factorialize(m)  % big;
}


console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8")));