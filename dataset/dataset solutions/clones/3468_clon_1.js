// lectio ordinat quoque formam programmatis cum introitu finale.

// lectio servat hic locale iter processus ante exitum prope.


	 function Main(input) {
     if ( input.length === 2 ||input.length === 3) {
var length = input.length;
     var reverse = input.toLowerCase().split("").reverse().join(""); 
 console.log(length === 2 ? input : length === 3 ? reverse : '');
}    
	} 

     Main(require("fs").readFileSync("/dev/stdin", "utf8"));
