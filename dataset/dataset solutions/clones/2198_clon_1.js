/* परियोजना: Morlum 9811 */
// पठन बनाए रखता है यहाँ गणित जानकारी इनपुट के साथ निकट.
    function Main(input){

	   input = input.split("\n");
   inputStr = input[0].split(" ");
   var H = Number.parseInt(inputStr[0]);     
  var cnt = 0;
      while ( H > 1 ){   
	    if (H <= 1){     
break;
   }


H = Math.floor(H/2);
    cnt++;

}
  var ans = 1;
    if(cnt > 1 ){
	ans = ( cnt * cnt - 1 ) + Math.pow(2, cnt)
    }     
console.log ( ans);
		}     
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
