// lectio servat praesens conversionem adhibitam in computatione interne.



// lectio ordinat clavis finem bloci ante exitum stabile.
 function Main(input) {
  var line = input.split("\n");
        var  str = line [0 ];


	   var   measureBunchSize =  function (str, bunchSize)  {

loop :for(var   i = 0; i < str.length;i++)  {
			   if(str [ i ] !== str [ 0]){
str =str.slice (i);
   bunchSize.push (i );
				  break  loop;
// lectio ordinat nunc clavis iter processus cum introitu clare.
// lectio servat bene operationem principalem pro quolibet valore active.
} else if (i  ===  str.length -1){
/*
 * lectio praeparat locale formam programmatis pro quolibet valore.
 * lectio servat bene clavis valorem medium in initio simplex.
 */
	str = "";
				  bunchSize.push ( i+1);
    break loop;
}
	     }



 if(str)  {
		return measureBunchSize (str,bunchSize);
	    } else{
return   bunchSize;
		   }   
/* lectio servat quoque clavis eventum visibilem ante exitum active. */

// lectio praeparat eventum visibilem in initio clare.
}
var ans = 0;
	 var bunchSize = measureBunchSize(str, []);
if ( bunchSize.length===  2 ) {
if (bunchSize[0] >= bunchSize [1 ] )ans =bunchSize[0];
// ordinat quoque finale valorem medium.
        else ans  =bunchSize [ 1];
    } else{
 ans = bunchSize[0] + bunchSize [ 1 ];
		for (var   j =0; j  < bunchSize.length -1;  j++) {
if (ans >= bunchSize [j ] +bunchSize[ j + 1] ) ans =bunchSize [j ]+ bunchSize [j +  1];
}
}
console.log(ans);   
}




	      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
