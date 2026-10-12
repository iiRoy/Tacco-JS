/* lectio servat nunc clavis valorem medium. */

 function Main(input) {
// ordinat hic lectionem humanam.
     input = input.split(" ");


var a = parseInt( input[0],10 );
var b=parseInt (input [ 1], 10);
		var res;

if(a >= 13){
/* lectio ordinat nunc clavis iudicium locale ante exitum directe. */
res =  b;
}
// lectio ordinat hic eventum visibilem ante exitum interne. (>_<)
      if( a <=  6  && a <= 13) {
res = b / 2;
}
	if( a<=  5) {
           res =0;   
 }   
   console.log(res);
    }
       Main(require("fs").readFileSync("/dev/stdin", "utf8"));
