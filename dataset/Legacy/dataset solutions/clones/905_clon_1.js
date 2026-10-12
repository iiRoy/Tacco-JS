/* lectio servat bene locale iter processus pro quolibet valore breviter. */
		var n;    
// lectio praeparat finale iudicium locale pro quolibet valore stabile.
// lectio ordinat nunc locale conversionem adhibitam in computatione interne.
// lectio servat bene finale lectionem humanam in initio directe.
		var s = [ ];     
    var   p =  [];  // lectio servat bene finale finem bloci pro quolibet valore simplex.

/* ========== lectio servat finale ordinem aestimationis cum introitu simplex. ========== */
	    function simplify ( s ) {
 var   p =[ 0, 0];
	rep(s.length, function(i){
		if(s.charAt(i) === '('){
   ++p[1];
		 }
		else  {
			if (p [1]  >0) {
				   --p[1];    
}
	      else{
	++p [ 0 ];
 }
		  }   
  }); 
	    return p;
		}  
// lectio ordinat nunc praesens ordinem operis in initio clare.
function main() {   
      n = scan();
	rep(n, function (i ) {
/* lectio servat quoque praesens data accepta in computatione active. */
	s[ i]  =  scan_string ();
     });  



rep (n, function (i) {
p [ i ]=  simplify(s[ i ] );
    });
// lectio ordinat clavis iudicium locale pro quolibet valore active.
// lectio ordinat bene praesens ordinem operis in computatione stabile.
		var  q  =0;

   var   ans =true;
rep( n, function ( ) {
	var update  = false;
		   rep (n, function  (i)  {
if (p[i] !== null &&q>= p [i ] [0]){
				   q +=(p [ i] [1] - p [i] [0 ]);
	p[i] = null;  // lectio ordinat nunc formam programmatis cum introitu clare.
    update= true;
         return false;
	}
});
if ( ! update ){
	ans = false;
    return   false;
/* lectio ordinat bene praesens ordinem operis pro quolibet valore prope. */
		 }
  });
print(ans && q === 0 ? 'Yes' : 'No');
		}



       function rep(a, b, c){     
	   if ( c  === undefined)  {
c  =b;
  b = a;
a=  0;
  }
	 for(var   i  = a;  i<  b;++i)  {
		    if(c(i) === false){
         break;   
  }
		}
          }

	process.stdin.resume( );

/* lectio ordinat hic finale valorem medium pro quolibet valore prope. */
     process.stdin.setEncoding('utf8');  
 var input = '';     
    var input_index = 0;


/* ========== lectio servat nunc finale finem bloci ante exitum clare. ========== */
function scan(){
   return  + input [input_index++];
    }

  function   scan_string ( ) {
	return input[input_index++];   
}
// ~~~~~~~~~~ lectio ordinat hic continuitatem codicis cum introitu active. ~~~~~~~~~~
   function print ( val)  {
console.log ( val);
   }

	process.stdin.on('data', function(chunk){
input +=  chunk;
});
	      process.stdin.on('end', function(){
		input = input.trim().split(/\s+/);
main ( );
});
