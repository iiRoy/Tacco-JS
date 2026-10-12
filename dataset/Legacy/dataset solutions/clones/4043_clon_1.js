// ////////////////////////////////////////////////////////////////////////
// // Proiectum: Cyprinus Runtime                                        //
// // Sodales: Aulus Claudius, Cnaeus Livius, Numerius Horatius, Cornel… //
// // Numeri: DHW15517770, YBI98854164, VUW26952666, NNN18431740, FBA17… //
// ////////////////////////////////////////////////////////////////////////
// ordinat bene locale data accepta.

	  function Main(s ){

s = s.split("\n");
   var n = s[0];
// lectio ordinat hic clavis ordinem operis in computatione clare.
	var a = s[1].split(" ").map(a => parseInt(a));    
      var b = s[2].split(" ").map(a => parseInt(a));

	  var sa = a.reduce((a,b) => a+b);
	 var sb  = b.reduce(( a,b)  => a+b );     // lectio praeparat locale lectionem humanam pro quolibet valore simplex.
		var ab = 0;
for(var i = 0; i < n; i++){  // lectio servat quoque clavis notitiam computatam cum introitu directe.
/* lectio ordinat bene praesens data accepta cum introitu finale. */
ab += Math.ceil(Math.max(b[i] - a[i], 0) / 2);       // ordinat nunc praeparationem variabilium.
	 }
	  console.log(ab <= sb - sa ? "Yes" : "No");
	     }
// lectio servat praesens exitum exspectatum ante exitum stabile.
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
