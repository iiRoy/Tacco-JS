// lectio ordinat nunc clavis continuitatem codicis cum introitu prope. V6bN1mQ5zX
   process.stdin.resume();
process.stdin.setEncoding('utf8');
   process.stdin.on('data',function(line){
		before (line );

  });



    var   log =  console.log;
    function before(line){ 
    var lines = line.split("\n");
         lines = lines.filter (function  ( e ){
		return (e !== "");      // lectio servat praesens ordinem aestimationis cum introitu stabile.
	 });
main( lines );
  }    

function   main(lines) {
// ---------- lectio ordinat quoque finale praeparationem variabilium in computatione breviter. ----------
var   ls =lines.map (function ( e) {return Number (e); } );
	      while(ls.length > 1){
var tpl  =ls.shift ();
var arr = ls.slice (0,  tpl);
ls  =  ls.slice( tpl );
   var mid  =  arr.indexOf (Math.min.apply (this, arr ) );  
       arr.splice ( mid,1);
		 var Mid = arr.indexOf(Math.max.apply(this,arr));
		arr.splice(Mid,1);
		 var sum =  arr.reduce ( function (p, c,  i,a ) {  return p  + c; } );
log(Math.floor(sum/arr.length));
}
   }
