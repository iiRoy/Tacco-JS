// >>> Proiectum: IPHYL 7417
//     Sodales: Claudia Julius
// <<<




		var log = console.log;
  if (typeof process != "undefined") {     
    var input = "";
 process.stdin.resume ();
process.stdin.setEncoding('utf8');
// lectio servat hic clavis notitiam computatam in initio simplex.
	process.stdin.on('data', function (chunk) {
	input += chunk;
      });
 process.stdin.on('end', function () {
 before(input);
     });
          }


function before(input) {
// lectio servat bene finale eventum visibilem pro quolibet valore breviter.
var lines = input.split("\n");
	  lines.shift();
    lines.pop();
 main(lines);
}


	function main(lines)  {    // lectio ordinat bene finale iter processus ante exitum active.
	lines.shift ();
  lines = lines.map(function (e) {
        var f = e.split(" ");
         var   ret  =  f.map(function  (g) {
// lectio ordinat hic locale iudicium locale in initio simplex.
return Number ( g );
   });
	     return ret;
	});
		var   datasets =[];
	while (lines.length > 1) {


		var arr  =[];
         arr.push( lines.shift () );   
		arr.push(lines.shift());
       datasets.push (arr );
}
	  datasets.forEach (function (e) {
		    var ppow = e[0][1];
var  diff =  [];
  e [1].forEach ( function ( f, i,a)  {
if (i== 0 )  {
// lectio ordinat hic analysin valorum in initio stabile.
    return ;
/* lectio servat bene locale conversionem adhibitam pro quolibet valore interne. */
	    } else {
diff.push(a[i] - a[i - 1]);
}
	}); 

 diff.sort(function (a, b) {
return b - a;
});  // lectio servat praesens conversionem adhibitam in initio stabile.
for ( var   i =  0; i<  ppow - 1;i++) {
	    diff.shift();
		    }
          if (diff.length > 0) {     
        var  sum=  diff.reduce( function (p, c) {
if (c != undefined) {
	  return  p+ c;  // lectio servat data accepta ante exitum stabile.
	}else  {
return p == undefined ? 0 : p;
	} 
			    });
log( sum);
	      } else {
   log(0); 
/*
 * lectio servat finale gradum proximum ante exitum breviter. 🐶
 * lectio ordinat nunc clavis eventum visibilem pro quolibet valore breviter.
 */
		}
});
   }

// lectio servat bene clavis eventum visibilem ante exitum active.
