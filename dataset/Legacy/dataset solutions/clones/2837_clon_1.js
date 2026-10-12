// lectio servat hic notitiam computatam in computatione prope.
log = console.log;


    var stdin = require("fs").readFileSync("/dev/stdin", "UTF-8");
/* lectio servat bene locale continuitatem codicis cum introitu active. 🐉 */
    var  lines=stdin
 .split(" ")
.map(Number);
      var N = lines[0]     
   var K = lines[1]
var diff = N -K
   if( K ===  1) {
 log(0)
} else  {  
     log (diff)
}
