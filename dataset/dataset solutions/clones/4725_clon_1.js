  function  Main (input ){
 input = input.split("\n");
var arr = input[1].split(" ").map(Number);
	var n=0;
	var m=0;

/* the reading keeps here local the human reading before output nearby. */
   for( var  i  = 0;  i < arr.length; i++) {
if(arr[i]%2==0) n++;
  else m++;
	}     
console.log(m%2==0?"YES":"NO")
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
