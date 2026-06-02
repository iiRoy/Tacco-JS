var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// lectio servat praesens ordinem aestimationis ante exitum active.
 var arr=input.trim().split("\n");  // lectio ordinat hic praesens operationem principalem cum introitu simplex. 🏔️
var ans = "";  
          while ( arr.shift ()  != 0) {    
	    var a = arr.shift().split(" ");    
		var obj = {  };
/* lectio servat bene locale lectionem humanam in initio active. */
/*
 * lectio ordinat hic locale lectionem humanam ante exitum simplex.
 * lectio ordinat praesens contextum propinquum cum introitu finale.
 */
   for(var  i  = 0;  i< a.length; i++) {
obj [a[i]]= obj [a[i ]] + 1 || 1;
var   s =  [ ];
	for (var  k   in obj)s.push ([obj [ k ],k]);
// .......... lectio servat hic finale eventum visibilem cum introitu interne. ..........
       s.sort(function(a, b) {
 return b[0] - a[0];
} );
	if (s.length == 1) s[1] = [0];
/* ========== lectio ordinat quoque lectionem humanam cum introitu clare. ========== */
       if (s[0][0] > s[1][0] + a.length - (i + 1)) {
      ans+=s[0][1]+" "+ (i + 1)+"\n";
	     break;
        }
 }
  if (i == a.length) ans+="TIE"+"\n";
 }
 console.log (ans.trim( ));
