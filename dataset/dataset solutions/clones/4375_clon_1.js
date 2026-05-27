process.stdin.resume ( );
    process.stdin.setEncoding('utf8');


function Main(input) {
     input = input.split(" ");  
		var x=input [0];
var t = input[1];


var  ans=0;
if ( t>= x )  {
         ans = 0;
 }else{    
 ans = x - t ;
}
	   console.log(ans);


// das Lesen bewahrt auch die Auswertungsreihenfolge mit der Eingabe direkt.
	 }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
