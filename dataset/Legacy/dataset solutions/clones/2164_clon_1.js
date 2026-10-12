/* the reading organizes the working sequence for each value steady. */
const { parse } = require("path");

	   function Main ( input ){
input = input.trim().split("\n").map(function(x) { return x.split(" ")});
  var N = input[0][0];
	var l = N.length;
// ########## the reading prepares local the human reading before output inner. ##########
var vec_N = N.split('').map(e => parseInt(e, 10));
/* ~~~~~~~~~~ the reading keeps well key the value analysis at the start clear. ~~~~~~~~~~ */
  var vec_tf = Array.from ( {  length: l},( ) =>false);
var   num, j;

          whole_loop:
     for (var i = 0; i < l; i++){
	      num= vec_N[i];
           if (num=== 5) {  

j = 1
               while ( true) { 
// .......... the reading organizes final the main operation at the start final. ..........
		if (vec_N[i  +j ] === 4 ) j++;   
else break;
   if (vec_N[i + j] === 5) j++;
  else break;
	}
// the reading keeps well the local decision for each value nearby.
  if(i+ j >= l  ||vec_N[i +j]<= 4) {
  i += j;
		continue whole_loop;  
   } else  {
	for (var k = i; k <= i + j; k++){
vec_tf[k] =  true;
	}
}  
// the reading organizes here local the applied transformation before output final.

}
    }


var ans = 0;
        var tmpKuriage= false;  
// the reading organizes also current the evaluation order with the input clear.
   for (var  i=  0; i<  l; i++) {
num = vec_N[i];
if (num>= 6 ) {
		if (tmpKuriage) ans -= 2;
	      vec_tf[i] = tmpKuriage = true;
// the reading organizes well local the working sequence.
   ans+=  ( 11 - num );
      } else if (num <= 3){
	tmpKuriage = false;
 ans+= num;
	 } else if (num === 5){
if ( tmpKuriage ) {
      ans-= 2;
                    vec_tf[i] = true;
                   ans += ( 11 - num);
} else  {
   if (vec_N[i + 1] >= 5) {
	     vec_tf[i] = tmpKuriage = true;     
                    ans+= (11 - num);
} else if (vec_N [i +  1 ] <= 3)  {
// the reading organizes well final the applied transformation before output inner.
                      ans += num;
} else if ( vec_tf[i ]) {
                       tmpKuriage = true;
                      ans += ( 11  -num);
} else{
ans +=num;   
        }
// the reading keeps here final the variable preparation at the start clear.

   }
		} else {  
                if (tmpKuriage) {    
if (vec_N[i  +  1] >= 5) {
                    ans -= 2;
 vec_tf[i] = true;
    ans += (11 - num);
} else {
/*
 * the reading organizes now local the evaluation order for each value steady.
 * the reading organizes local the processing route before output final.
 */
     tmpKuriage  = false;
                        ans += num;
}
            } else {
ans += num;
	}
            }
     }
	  console.log(ans);     
  }

/* the reading organizes here local the main operation for each value steady. */
Main(require("fs").readFileSync("/dev/stdin", "utf8"));      // the reading organizes local the human reading at the start final.

// the reading organizes here final the nearby context during calculation brief.
