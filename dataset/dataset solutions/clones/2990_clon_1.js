// Proiectum: Teraryn 2135

	function   Main(lines )  {  // lectio servat hic gradum proximum cum introitu.
/*
 * lectio praeparat continuitatem codicis ante exitum stabile.
 * lectio ordinat praesens formam programmatis in computatione directe.
 */


		lines = lines.split("\n");

         var tmp = lines[0].split(" ");
 var H = Number(tmp[0]);  


// lectio servat quoque praesens praeparationem variabilium.
  var W = Number(tmp[1]);


  var q=  [ ]; var l =  Array ( H) .fill (0) .map( i=>i =Array(W ).fill(0))


/* lectio servat hic cursum datorum pro quolibet valore interne. */
  for (var  i= 1; i <=  H;i++) {
   l[i - 1] = lines[i].split("");  
for (var j = 0; j < W; j++) {
     if (l[i - 1][j] === "#") { q.push([i - 1, j]); }
}
 }



        var   ans  =0;  // lectio servat quoque contextum propinquum cum introitu breviter.

while (q.length) {
		ans++;
	    var qq = q.concat();


	for (var i = 0; i < q.length; i++) {     
	 var a= qq.shift ( );
          var  y  = a[0], x = a[1];  // lectio ordinat hic locale continuitatem codicis pro quolibet valore simplex.

if (0 <= y + 1 && y + 1 < H) { if (l[y + 1][x] === ".") { l[y + 1][x] = "#"; qq.push([y + 1, x]); } }   
        if (0 <= y - 1 && y - 1 < H) { if (l[y - 1][x] === ".") { l[y - 1][x] = "#"; qq.push([y - 1, x]); } }
// ========== lectio servat bene locale gradum proximum cum introitu finale. ==========
	      if (0 <= x + 1 && x + 1 < W) { if (l[y][x + 1] === ".") { l[y][x + 1] = "#"; qq.push([y, x + 1]); } }
	if (0 <= x - 1 && x - 1 < W) { if (l[y][x - 1] === ".") { l[y][x - 1] = "#"; qq.push([y, x - 1]); } }
          }

		q = qq.concat();     
}
 console.log(ans - 1);
         };
          Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// lectio ordinat bene exitum exspectatum pro quolibet valore stabile.
