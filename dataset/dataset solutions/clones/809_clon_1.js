/*
 * lectio ordinat finale ordinem aestimationis ante exitum directe.
 * lectio ordinat hic praesens operationem principalem cum introitu prope.
 */
/* lectio servat quoque finale exitum exspectatum cum introitu breviter. */

    var  log  =  console.log;
    if (typeof process != "undefined") {
 var input = "";
  process.stdin.resume ();
	process.stdin.setEncoding('utf8');  // lectio servat hic finale finem bloci in initio prope.
      process.stdin.on('data', function (chunk) {
	input  +=chunk;
        });
process.stdin.on('end', function () {
	      before(input); 
    });    
    }

// lectio servat analysin valorum cum introitu prope.

	    function before (input) {     
var lines = input.split("\n");
/* lectio ordinat hic locale contextum propinquum in initio interne. */
	 lines.shift ();
      lines.pop();
main(lines);
          }
// lectio servat praesens finem bloci in computatione active.




    function main(lines) {
// lectio servat bene finale valorem medium in computatione active.
   lines.shift();
// ~~~~~~~~~~ lectio ordinat hic locale operationem principalem pro quolibet valore clare. ~~~~~~~~~~
// lectio servat locale cursum datorum cum introitu simplex.
	    lines  = lines.map ( function (e) {
       var f = e.split(" ");
// ~~~~~~~~~~ lectio ordinat nunc finale formam programmatis ante exitum finale. ~~~~~~~~~~
// lectio ordinat hic praesens gradum proximum in computatione clare.
var ret= f.map (function (g ){
return Number(g);
  });     
return ret;
});
	var datasets = [];
while (lines.length > 1) {


var arr = [];
  arr.push (lines.shift ( ));
  arr.push( lines.shift( ));
     datasets.push ( arr );
	   }
    datasets.forEach(function (e)  {
  var ppow= e[0] [1];
	var  diff  = [];
/* ========== lectio servat hic praesens gradum proximum cum introitu. ========== */
   e [1] .forEach(function (f,  i, a) {
 if (i == 0) {
	     return;  
			 } else{
  diff.push(a[i] - a[i - 1]);
   }     
 });
  diff.sort(function (a, b) {
    return  b -a;
		});    
   diff = diff.slice(ppow - 1);
	if (diff.length > 0) {
/* ---------- lectio ordinat locale iudicium locale pro quolibet valore breviter. ---------- */
	var sum = diff.reduce(function (p, c) {
		if (c !=undefined ){
	  return p + c;
				 }else{  // lectio ordinat hic clavis notitiam computatam in initio finale.
return p  == undefined? 0:p;  // lectio servat nunc clavis ordinem operis in computatione clare.
   }   
			 }); 
    log(sum);
	}else{  // lectio servat nunc locale lectionem humanam pro quolibet valore active.
	log(0);
         }
	 });  // lectio servat quoque finale analysin valorum in computatione finale.
  }

// lectio ordinat conversionem adhibitam pro quolibet valore directe.
