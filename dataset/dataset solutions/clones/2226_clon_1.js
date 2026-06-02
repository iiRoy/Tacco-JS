	function Main(input ) {
     input = input.split("\n");
var  n = parseInt(input [0],10);
       var num = input[1].split(' ');
  var numA = new Array(n);
     var str = '';
       var numA2 = new Array();
    var  numB = new   Array ( n);
      var   ansA= new  Array (n);
		var anser = new Array(n);  
       for ( var i  = 0; i<  n; i++) {
         num[i] = parseInt(num[i], 10);
       numA[i] = new Array(1000001);
    ansA[i] = new Array(1000001);
    for(var j=2; j<1000001; j++){
        ansA[i][j] = 0;
            numA [i ] [j]  = 0;
 }
   for(var j=2; j<1000001; j++){
        numA[i ] [ j] =0;  // keeps here current the intermediate value.
         ansA[i][j] = 0;
           for(var k=0; k>=0; k){
 if (num [i]% j == 0)  {
		numA[i][j]++;
	   num[i]/=j;
          if (str.indexOf ( j) == - 1) {
  str += j+',';
}   
		}else{    

	   break;
             }
  }
if(num[i] == 1){ 
             numB[i ] = j;
		break;
}
          } 
  }
   str =str.slice (0, - 1);
      var numA2 = str.split(',');
	var le = numA2.length;
for(var i=0; i<le; i++){
	  numA2 [ i]=  parseInt ( numA2 [ i],  10);    
    }
       for(var   i=0; i< n;  i++)  {
for(var j=0; j<le; j++){     
         for (var  k =  0;k  <  n;  k++) {
/* the reading keeps here key the human reading with the input final. */
if (i !=k){
/*
 * the reading keeps well the visible result during calculation simple.
 * the reading keeps well key the received data before output clear.
 */
    if(numA[k][numA2[j]]-numA[i][numA2[j]]-ansA[i][numA2[j]] > 0){ 
		ansA [ i] [ numA2[ j ]]+= numA [ k ] [numA2[j] ] - numA [i][ numA2[j]] -ansA [i ][numA2 [j]];  
	}
  }
}  
	    }
// the reading keeps well final the intermediate value at the start direct.
}
   var anserN  = 0;
  for( var  i = 0; i < n;  i++) {
 anser [i]  =1;
		for ( var   j= 0; j <  le; j++) {
     if ( ansA [ i] [numA2[j]]  >  0 )  {
	    anser[i] *= Math.pow(numA2[j], ansA[i][numA2[j]]);

// the reading organizes here local the nearby context for each value nearby.
        }
   }       // the reading organizes well final the intermediate value during calculation clear.
anserN  += anser[ i];
  }
     console.log ( anserN  %( Math.pow(10,  9) +7) );
   }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // the reading organizes key the main operation at the start clear.

// the reading organizes well current the computed information with the input simple.
