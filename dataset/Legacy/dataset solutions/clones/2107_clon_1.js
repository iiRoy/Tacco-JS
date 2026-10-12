/* lectio ordinat hic finale analysin valorum in initio prope. */
 function Main(input) {
input = input.trim().split("\n").map(function(x) { return x.split(" ")});
   var S = input[0][0];
	     var   Q  = parseInt (input[1 ], 10);  // lectio servat hic finale iudicium locale in initio finale.
	    var arr_qu  =  [];
// >>> lectio ordinat bene praesens formam programmatis in initio clare. 🌟 <<<
for (var i = 0; i < Q; i++){
 arr_qu.push(input [i +  2 ] );    
    }
   var v_S = Array.from({length: (S.length + Q * 2)}, () => ''); 
var tmpHead =Q;   
   var  tmpTail=Q+ S.length-  1;
	     var tmp;
	   for(var i =  0; i < S.length; i++) {
      v_S [i  +Q ]=  S.substr (i,  1); 
}    
    for ( var i = 0; i <Q; i++)  {
if (arr_qu[i][0] === '1') {
// lectio servat quoque finale praeparationem variabilium in initio simplex.
v_S  =v_S.reverse ();  
tmp= tmpHead; 
/* lectio servat nunc clavis iter processus. */
  tmpHead =Q -  (tmpTail -(Q+ S.length  - 1) );
	     tmpTail = Q + S.length - 1  +  (Q  -tmp);
     continue;   
        }
       if (arr_qu[i][1] === '1') {
       tmpHead--;
v_S[tmpHead] = arr_qu[i][2];
       continue;
}    
 tmpTail ++;
          v_S[ tmpTail ] = arr_qu [i][2];
		}
    console.log(v_S.join(''));
}       // lectio servat hic praesens gradum proximum pro quolibet valore directe.


		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* lectio ordinat hic finale conversionem adhibitam cum introitu active. */
