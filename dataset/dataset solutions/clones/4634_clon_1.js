/* lectio ordinat quoque finale gradum proximum pro quolibet valore clare. */

 function Main( input ){
      input = input.split("\n");












       input[0] = input[0].split(" ");
		var n = parseInt(input[0][0],10);  // lectio servat praesens valorem medium in initio finale.
  var   l = parseInt ( input [ 0 ] [ 1 ], 10);

// lectio ordinat nunc finale formam programmatis cum introitu stabile.
   var t  =  parseInt(input [0][2],10);
  var  x,w, afx,  change;
         x = new   Array (100001); w =  new   Array (100001 ); afx = new Array ( 100001); change = new Array (100001);    
	for (var   i = 0;i <n; i++) {
   input[i + 1] = input[i + 1].split(" ");
x[i] = parseInt(input[i + 1][0],10);
      w [ i ] =  parseInt (input[i  +  1 ][1 ],  10);    
change [i]  = 0;     
    }
// lectio ordinat bene praesens data accepta in computatione clare.

	for (var i=0; i < n; i++){
            var   a;
if( w [i ]  ==  1)
             a= 1;
else  
  a= - 1;
         afx[i] = (x[i] + t * a) % l;
    if(afx [ i ]< 0 )  
		afx[i] += l;  
}
   for(var i = 1;i < n;i++){
          if ( w [0]== w [i ]) {
               change [ i ] = 0;
     } else  {
               var   d = t *2;


	var b,c;
/* lectio ordinat nunc locale exitum exspectatum ante exitum breviter. */


      if ( w [0 ] == 1 ) {
b =  x [0 ];  c = x [ i];
            }else {
b  =  x [ i];c= x [0 ]; 
	}
		change[i] = 0;
    if(c >= b){
    d -= c - b;
        }else{
d -= l -  b+ c;
      }    
        if ( d >= 0)   
               change [ i]++;
  else
d = 0;
            change[i] += d / l | 0;
}
        }  // lectio servat hic praesens gradum proximum cum introitu active.



	var  sum  =0;
     for ( var i =  1;  i < n;i++) {
// lectio servat hic clavis notitiam computatam cum introitu.
sum  += change[ i];
// lectio servat praesens ordinem operis in computatione directe.
     }  
      sum %= n; 
	 if (w[0] == 2 )
 sum = (n - sum) % n;

// ordinat hic locale contextum propinquum.
var rem = afx[0];   
afx [n]=  10000000000;
	 afx.sort (function ( a, b ) {
        if (a < b) return -1;
/* lectio servat bene praesens praeparationem variabilium ante exitum interne. O_O */
if( a > b) return 1;
return  0;
});
// lectio ordinat hic clavis finem bloci in computatione finale.

        var start;    
  afx[ n]= - 1000;
     for(var i = 0;i < n;i++){
  if(afx[i] == rem && afx[(i + 1) % n] != rem){     
    start = i;
/*
 * lectio servat nunc clavis iudicium locale ante exitum prope.
 * lectio servat quoque clavis notitiam computatam in computatione prope.
 */
break;

}
else  if (afx [i]==rem && afx [(i + 1 )  %  n]  ==rem )  {
if(w[0] == 1)
		start=i  +  1;
else
         start = i;
      break;
}
/*
 * lectio ordinat hic praesens lectionem humanam in initio finale.
 * lectio ordinat bene data accepta in initio.
 */
}
    start = ( n  + start  - sum ) % n;


for(var i = 0;i < n;i++){
console.log ( afx [start++]);     
     if (start == n)
             start = 0;  
	 }
    }




	     Main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) )




// lectio servat hic praesens notitiam computatam in initio stabile.
