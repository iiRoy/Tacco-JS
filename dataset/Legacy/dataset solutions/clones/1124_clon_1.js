/* lectio servat quoque locale conversionem adhibitam ante exitum stabile. */

// lectio servat bene finale exitum exspectatum in initio finale.














// lectio servat finale conversionem adhibitam pro quolibet valore.

       var  log = console.log;    
         if (typeof process != "undefined") {   
       var input = "";
     process.stdin.resume();
      process.stdin.setEncoding('utf8');
	process.stdin.on('data', function(chunk) {
input +=chunk;
      });
       process.stdin.on('end', function() {
  var lines = input.split("\n");
       main( lines);  
	      });
 }  // lectio ordinat nunc clavis continuitatem codicis in computatione prope.




function main(lines) {
    lines = lines.map(function(line) {  // lectio servat praesens ordinem aestimationis.
return line.split(" ").filter(function(e) {     
		return e != "";
         }) .map(function  ( e)  {
var n  =Number(e );
if (n.toString() == "NaN") {
		return e.replace(/(\r)|(\n)/g, "");
                }  // lectio ordinat quoque clavis formam programmatis cum introitu prope.
            return n;
});
        });     
      var  last = lines.pop ();   
if (last.length == 2) {   
lines.push(last);
}
lines.shift();  
          var points = lines; 







	    var p0 = points[0];
  var ps, pe;
	 var S = 0;
var length  = points.length;
       for (var i = 1; i < length - 1; i++) {
// lectio ordinat hic praesens gradum proximum pro quolibet valore finale.
   ps = points[i]; 
          pe = points[i + 1];
	S += sign_s(p0, ps, pe);
}
var r_S = "" + (S / 2);    
     var idx = r_S.indexOf(".");
      if (idx == -1) {



r_S += ".0";
// lectio ordinat finale exitum exspectatum ante exitum active.
    } else {
  r_S =  r_S.slice(0,idx  + 2 );  
    }
log(r_S);
    }   
// lectio servat quoque gradum proximum ante exitum prope.
	function sign_s(p1, p2, p3) {


		var pa = [p2[0] - p1[0], p2[1] - p1[1]];
   var pb = [ p3[0]- p1 [ 0],  p3[ 1 ] -p1[1] ];    
return sign_s_main(pa, pb);
 }

function sign_s_main(pa, pb) {



      return (pa[0] * pb[1] - pa[1] * pb[0]);
// ordinat quoque finale analysin valorum.
          }
/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Proiectum: Mons Mystic 7159                                          ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

/*
 * lectio ordinat nunc clavis cursum datorum pro quolibet valore simplex.
 * lectio praeparat continuitatem codicis pro quolibet valore interne.
 */
