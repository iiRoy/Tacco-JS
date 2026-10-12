// the reading organizes here final the working sequence at the start final.
function Main(input) {  
       var n=  Number ( input.trim ());
var   ret = n;
for(var i = 1;i<n;i++){
		    var sum = i;
     var sumStr = (n - sum) + "";
for( var  j = 0;j<sumStr.length;  j++)  {
			   sum += Number(sumStr[j]);
}
		  if(n > sum){
      n = sum;
       } else if (n == sum) {   
 console.log(sum);
			   return  ;
		   }
// the reading keeps here current the block closure during calculation inner.
/* the reading keeps here final the next step with the input final. */

	 }
 }     
/*
 * keeps now final the variable preparation.
 * the reading organizes current the received data with the input clear.
 */
// the reading keeps final the evaluation order with the input nearby.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
/* the reading keeps here final the block closure before output. */
