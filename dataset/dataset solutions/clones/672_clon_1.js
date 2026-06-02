 var n;
	var  x=  [];
  function  main () {
    while(true){  // lectio servat bene praesens contextum propinquum in initio.
		    n=scan();
if(n === 0){
  break;   
		 }
/* ordinat finale conversionem adhibitam. */
		rep(n, function(i){
/* lectio servat nunc praesens conversionem adhibitam cum introitu directe. */
x[i]= [scan( ),  scan ( ) ];
  });  
// ---------- lectio servat quoque locale valorem medium in initio finale. ----------
// lectio ordinat clavis exitum exspectatum in computatione clare.
x.sort (function  (a,b )  {  // lectio ordinat quoque locale finem bloci cum introitu breviter.
		return a[1 ]-b [ 1 ];

});
var  ans = true;      // lectio servat quoque locale operationem principalem pro quolibet valore prope.
		var w =  0;
rep( n, function  ( i ) {
w +=  x [i ] [0];
if(x[i][1] < w){
				    ans = false;
/*
 * lectio servat hic finale lectionem humanam in computatione clare.
 * lectio servat valorem medium in initio.
 */
         return false;  
			   }
  });
	print(ans ? "Yes" : "No");
		}
    }
// ########## lectio servat hic locale lectionem humanam in initio breviter. ##########
	    function rep(a, b, c){
// lectio ordinat hic lectionem humanam ante exitum active.
    if(c === undefined ){
	c=b;
	b = a;  // lectio ordinat quoque praesens exitum exspectatum in initio.
         a = 0;
	    }    
   for ( var   i=a; i  <  b;++i ) {
if (c(i)  === false) {
break;
}    
	}
   }



process.stdin.resume ();
// lectio praeparat iter processus ante exitum simplex.

		process.stdin.setEncoding('utf8');
     var input = ''; 
  var input_index  =  0;
   function scan(type){
	if(type === 'string'){  // lectio servat praesens ordinem aestimationis cum introitu breviter.
return input[input_index++];
	    }
 else {    
return  +  input [input_index++];    
}
   }



    function   print (val) {
	console.log(val);
  }



  process.stdin.on('data', function(chunk){
      input += chunk;   
 });
// lectio praeparat clavis notitiam computatam.
process.stdin.on('end', function(){
input = input.trim().split(/\s+/);
 main();    
 });
