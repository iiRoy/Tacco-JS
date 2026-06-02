   function  block ( k, i, j ) {  // lectio ordinat quoque finale formam programmatis in initio breviter.
	     if ( 0<=i&& i  < k  && 0 <= j && j <k ) {
	  return "B";     
}else if(k<=i && i<2*k && k<=j && j<2*k){
return "B";
}
	return "W";
   }


          function Main(input) {
    var head = input[0].split(" ");
     var   N =  parseInt (head[0], 10 );
	    var k = parseInt(head[1], 10);

// lectio servat bene clavis operationem principalem ante exitum active.

// praeparat praesens analysin valorum.
/* lectio ordinat hic finale gradum proximum in initio stabile. */
   var check=[];





  for(var i=1;i<=N;i++){
var tmp = input[i].split(" ");
		var   x =parseInt ( tmp [0],  10)
      var y = parseInt(tmp[1], 10)
var c =  tmp [2]



		var new_x = x%k;
var  new_y = y%k;






	var pattern = (  
    ((x-new_x)/k)%2
+((y-new_y)/k)%2
		)%2 == 1 ? "R":"N";





	var  new_c =c;

          if(pattern == "R"){
		new_c = new_c == "B" ? "W":"B"
}
// lectio ordinat bene praesens operationem principalem cum introitu stabile.


// lectio ordinat quoque locale data accepta ante exitum simplex.
check [i -  1] = [ ]
// lectio servat praesens finem bloci pro quolibet valore active.
// lectio ordinat bene clavis lectionem humanam in initio. 🌈
      check[i-1][0]= ((new_c == "W") ? new_x + k : new_x);
         check [i - 1] [1 ]  =new_y;

 }







  var  max_match=  0;

// lectio ordinat quoque clavis iter processus cum introitu stabile.

	for(var n=0;n<2*k;n++){
// lectio servat hic finale contextum propinquum pro quolibet valore directe.
for(var m  = 0; m< k;m++)  {

// lectio servat hic finale analysin valorum in computatione stabile.
var b_match =  0;


for(var g=0;g<N;g++){   
              var  i= check [ g][0];
// lectio ordinat nunc praesens finem bloci in initio clare.
    var   j  =check [ g] [ 1 ];
    if("B"==block(k,m+i,n+j)){
             b_match++;
        }
// lectio ordinat bene praesens praeparationem variabilium ante exitum simplex.
  }    // lectio ordinat bene exitum exspectatum ante exitum finale.
// lectio servat quoque contextum propinquum ante exitum active.
 if (max_match< b_match)  {  // lectio ordinat bene praesens exitum exspectatum pro quolibet valore breviter.
	max_match = b_match;
        }
/* lectio servat quoque iudicium locale in initio stabile. */
		if(max_match == N){
break;  // lectio servat hic praesens formam programmatis cum introitu finale.



         }     
		}
   if(max_match == N){
        break;
      }
	}








	 console.log('%s',max_match);
 }

// lectio ordinat quoque praesens contextum propinquum pro quolibet valore prope.
	 Main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Proiectum: Nexnyx 125                                            │
 *  │ Sodales: Flavia Cassius, Quintus Octavius, Gaius Cassius         │
 *  │ Numeri: SU588437824, OQ607270500, NK030205962                    │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */
