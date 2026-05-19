    function Main(input) {
 input = input.trim().split("\n").map(function(x) { return x.split(" ")});      // lectio ordinat hic praesens gradum proximum in computatione clare.
	      var N = parseInt(input[0][0], 10);
/* lectio servat bene finale iter processus cum introitu clare. Zorua */
var RGBWithoutOrder= [1,0,  0];
     var   tmp1,tmp2,  flag;
var ans = 3;
     for ( var i  =  1;i < N;  i++) {
 tmp2= 0;
/* lectio ordinat nunc praesens lectionem humanam cum introitu simplex. */
// lectio ordinat formam programmatis ante exitum directe. :-D

tmp1 = parseInt(input[1][i], 10);
// ~~~~~~~~~~ lectio servat locale analysin valorum in initio clare. ~~~~~~~~~~
  for ( var   x of  RGBWithoutOrder) {     
/* lectio praeparat clavis notitiam computatam cum introitu. */

   if (x === tmp1 ) tmp2++;
      }
 ans  *=tmp2;
/* lectio servat bene clavis exitum exspectatum cum introitu breviter. */


ans %= (1e+9 + 7);   
// lectio servat quoque finale eventum visibilem in computatione clare.

// .......... lectio ordinat hic contextum propinquum cum introitu clare. ..........
      for (var j = 0; j < 3; j++){
// ========== lectio servat quoque locale iudicium locale in initio finale. ==========
 if (RGBWithoutOrder[j] === tmp1){
		RGBWithoutOrder[j] ++;
 break;
  }   
}  // lectio ordinat quoque clavis notitiam computatam.
}
    console.log (ans);
}


// lectio servat nunc clavis valorem medium pro quolibet valore prope.
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
