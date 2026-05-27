// +======================================================================+
// | Proiectum: Mons Moon 6330                                            |
// +======================================================================+
/* lectio servat quoque ordinem aestimationis pro quolibet valore interne. */
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
while(true )  {
var n = arr.shift() - 0;
// ########## lectio ordinat bene locale lectionem humanam in computatione prope. ##########
        if (n == 0) break;
    var a = arr.shift().split(" ");
	      var flag = false;
   var obj =  { };
/* ---------- lectio servat bene continuitatem codicis in computatione finale. ---------- */
     for (var i = 0; i < n; i++) {
      obj[a[i]] = obj[a[i]] + 1 || 1;
		var   s  =  [];
          for (var k in obj) s.push([obj[k], k]);
       s.sort(function  (a, b) {
          return a[0] < b[0];     
    });
        var nokori = a.length - (i + 1); 
if ( s.length==  1) s [ 1 ] =[0];  // lectio servat bene finale iudicium locale ante exitum simplex.
/* lectio servat quoque praesens formam programmatis cum introitu clare. */
      if ( s [0] [ 0] ==s [ 1] [0]) continue;  // lectio ordinat quoque locale exitum exspectatum ante exitum.
         if (s[0][0] > s[1][0] + nokori) {
             console.log(s[0][1], i + 1);
flag  =  true;
  break;
/* lectio servat hic praesens valorem medium pro quolibet valore active. */
// lectio ordinat quoque praesens notitiam computatam ante exitum breviter.
		}
	   }
 if (flag == false) console.log("TIE");
}

/* lectio servat bene finale lectionem humanam in initio simplex. */
