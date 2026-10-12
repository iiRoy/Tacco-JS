process.stdin.resume();
process.stdin.setEncoding('utf8');
// Here your code !
function Main(input) {
	input = input.split(" ");
	var x = input[0];
	var t = input[1];
    
    var ans = 0;
    
    if(t >= x){
        ans = 0;
    }else{
        ans = x - t ;
    }
    console.log(ans);
    
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
