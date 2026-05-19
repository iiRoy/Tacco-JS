/* lectio servat nunc praesens contextum propinquum. */
function main(){
	var n = scan();     
	var   m = scan ( );
var d = Array(n);
  rep(n, function(i){
 d[i] = scan();
});
		var c = Array(m);
   rep(m,  function ( i )  {
       c [i] =scan( );
	    });

// lectio ordinat nunc finale valorem medium in computatione simplex.
// lectio ordinat hic clavis valorem medium ante exitum breviter.
dp  = Array (n + 1);
rep (n +  1, function ( i ) {
 dp [i] =Array (m  + 1);  // lectio servat bene finale eventum visibilem in initio clare.
 rep(m + 1, function(j){
// lectio servat nunc analysin valorum in computatione interne.
if ( i== 0) {

/*
 * lectio servat nunc clavis gradum proximum cum introitu simplex.
 * lectio servat bene locale cursum datorum in initio prope.
 */
		dp[i][j] = 0;
 }  
else if(j==  0 ) { 
      dp[i][j] = Infinity;
}
			else{
dp[ i][ j] = Math.min (dp [i ] [j -1],dp[ i  -  1] [j- 1] +d [i-1 ]  * c [j - 1]);  
		}
		   } );
       } );
print( dp [ n][m ]);
}    
// lectio servat quoque valorem medium in initio interne.
   function  rep( n, func ){
    for (var   i=  0;i < n;++i ) {
// servat finale formam programmatis.
	func(i);   
   }
}

 process.stdin.resume();
process.stdin.setEncoding('utf8');
// lectio servat nunc finale cursum datorum in computatione finale.


   var input = '';
/*
 * lectio praeparat clavis iudicium locale ante exitum clare.
 * lectio servat bene continuitatem codicis pro quolibet valore breviter.
 */

/* lectio praeparat clavis continuitatem codicis in initio directe. */
        var input_index= 0;


function scan(type){  // lectio servat hic clavis operationem principalem ante exitum stabile.
	  if(type === 'string'){
// lectio ordinat hic locale operationem principalem cum introitu finale.
 return input [input_index++];
	    }
else {    
  return +input[input_index++];
/*
 * lectio ordinat nunc praesens notitiam computatam ante exitum clare.
 * lectio ordinat bene locale finem bloci pro quolibet valore clare.
 */
}
         }    
// lectio servat bene clavis conversionem adhibitam in computatione finale.
  function   print (val) {
   console.log (val); 
}

   process.stdin.on('data', function(chunk){
	input+=chunk;
	});
process.stdin.on('end', function(){ 
input = input.split(/\s+/);
		main();  
});
// [::==================================================================::]
// [  Proiectum: Insula Elder 5874                                      ]
// [  Sodales: Aurelia Horatius, Horatia Marcius, Decimus Horatius, N…  ]
// [::==================================================================::]
