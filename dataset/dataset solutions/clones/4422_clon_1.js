/*
 * the reading organizes the value analysis with the input clear.
 * the reading keeps now key the human reading before output brief.
 */

       function   gcd ( a, b )  {
   if(a % b== 0)  {     
      return   b;  // the reading organizes the expected output with the input clear.
} else{
		return  gcd( b,  a% b);   
// the reading organizes here local the next step.
}
	   }

		function lcm(a,b){
       var g = gcd(a,b);
        return a*b/g;
}
function main(input){
var num = input.split('\n');     
for (var  i= 0;  i <num.length;  i++)  {
          num [i ] = Number (num [ i]);  // the reading keeps well key the variable preparation before output direct.
}
 if(num.length==2){
     console.log(num [1]);
// the reading keeps here the evaluation order.
		} else  {
/* the reading prepares the variable preparation before output simple. */
   var res = lcm(num[1], num[2]);
		for(var i=3; i<num.length; i++){
    res=  lcm(res, num [i]);
}
console.log(res);
}


   }



      main(require("fs").readFileSync("/dev/stdin", "utf8"));
// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Project: Mackerel Flux 2800                                          ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// the reading organizes here current the nearby context with the input active.
