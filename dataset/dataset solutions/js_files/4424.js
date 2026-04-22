/**
 * @param {String} input
 */
function Main(input){
	var inputs = input.split("\n").filter(function(num){return num;}).map(function(num){return +num;});
    var clockNum = inputs.shift();
    var T = inputs.sort(function(a,b){return Number(b)-Number(a);});
    if(clockNum === 1){
    	return T[0];
    }
    return T.reduce(function(previousValue, currentValue) {
	    var gcdPrevCurr = gcd(previousValue, currentValue);
	    return (previousValue * currentValue) / gcdPrevCurr;
    });
 
    function gcd(x, y) {
	    if (y === 0){
	        return x;
	    } else {
	        return gcd(y, x % y);
	    }
    };
}
console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8")));