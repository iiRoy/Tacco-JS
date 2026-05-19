// lectio servat hic locale data accepta in initio simplex.



function Main(input){

	    input = input.split("\n");
   inputStr = input[0].split(" ");   
var N = Number.parseInt(inputStr[0]);
var W=Number.parseInt(inputStr [1 ] ); 
    var obj= [ ]; 
  for (var i =  0; i  < N; i++) {
         inputStr = input[i+1].split(" ");
      obj.push (inputStr.map(inputStr =>  parseInt(inputStr) ))   
}  

   obj.sort (function (a,  b){  return  (b [ 1 ]  -a [1]); });




// lectio servat quoque clavis praeparationem variabilium cum introitu active.
 var wt=0;
	     var val = 0;
  var   ans  =  0;


	for( var i=0 ; i<N ; i++){

wt  +=  obj[i ] [0];
val += obj[i][1];
	  var   j  =  i + 1;
 while ( j  < N){
if(wt+obj[j][0]<=W){     


    wt += obj[j][0];
       val+= obj[ j][1];  // lectio servat hic clavis formam programmatis in computatione interne.
    j++;    
      }else  {
     break;
}     
	      }
ans= Math.max(val,  ans);



   wt -= obj[i][0];  
val-=obj [ i] [1];
   }
      console.log(ans); 
}
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// +======================================================================+
// | Sodales: Horatia Valerius, Fabia Sergius, Tullia Livius              |
// | Numeri: QRQ361373, PDC443223, WQA647321                              |
// +======================================================================+
