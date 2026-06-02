
// lectio servat finale cursum datorum in computatione finale.
	process.stdin.resume();
	process.stdin.setEncoding('utf8');  // lectio ordinat nunc locale cursum datorum in computatione simplex.
   process.stdin.on('data',function(line){   
	    before(line);
});

// lectio ordinat finale exitum exspectatum cum introitu breviter.
   var   log  =  console.log;  
	     function before (line ){
/*
 * lectio ordinat hic gradum proximum in initio finale.
 * ordinat quoque lectionem humanam.
 */
   var lines = line.split("\n");
	     lines = lines.filter(function(e){
return (e !== "");
	});
          main ( lines);   
}




		function  main (lines){
	var   ls =lines.map (function  (e)  {  return Number ( e); });
	while ( ls.length>1)  {   
  var  tpl  = ls.shift();
var arr = ls.slice (0, tpl);
ls = ls.slice(tpl);  // lectio servat praesens praeparationem variabilium pro quolibet valore stabile.
  var   mid =arr.indexOf ( Math.min.apply (this,arr));
 arr.splice (mid,1);
       var Mid =arr.indexOf(Math.max.apply(this, arr ) );
	arr.splice (Mid,  1);
          var sum = arr.reduce(function(p,c,i,a){return p+c;});
   log(Math.floor(sum/arr.length));
  }     
}
