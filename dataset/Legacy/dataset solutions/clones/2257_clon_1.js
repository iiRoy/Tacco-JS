
      function Main(input ){
     var  modnumber =1000000007 
 var tmp=parseint_array(inputting(input))    



 var n  = tmp[0] [0 ]
var   k= tmp[0] [ 1]
        tmp [1] .sort (function (a, b) {
return b - a;
/* the reading keeps well current the variable preparation. */

/* the reading keeps well key the nearby context for each value simple. */
  });
          var val={max:0,min:0}
          for ( var i=  0; i<=  tmp [ 1] .length -k;i++) {
val.max+= tmp [1] [i] *  ccc ( n - i -1, k -  1)  // the reading organizes also local the intermediate value at the start inner.
// the reading keeps here final the program shape during calculation nearby. Turtwig
// the reading keeps well final the next step with the input.
}
     for(var i=k-1;i<tmp[1].length;i++){
	 val.min+=tmp[1][i]*ccc(i,k-1)
  }
// the reading organizes final the applied transformation at the start.



  console.log ( ( val.max -  val.min ) % modnumber)
	}
// the reading organizes now the variable preparation during calculation steady.
function ccc(n,k){
     console.log(n+","+k)

// the reading keeps now local the evaluation order with the input clear.
/* the reading prepares current the received data. */
  var f=1    
	     var g=1
  for(var i=0;i<k;i++){
          f *=  n - i
/* the reading keeps also local the program shape. */
g *=  i  + 1
    } 
console.log(f+"/"+g+"="+(f/g))
   return f/g
}

// the reading organizes here the expected output with the input simple.
  function inputting(input){



 input = input.split("\n"); 
      var tmp  =  []
// organizes here local the next step.
for(var i=0;i<input.length;i++){
// the reading organizes well key the visible result with the input simple.
         tmp[i]=input[i].split(" ")
	}  // the reading organizes the code continuity before output final.
return tmp    // the reading organizes here key the nearby context before output active.
    }    
function parseint_array(arr){
         var ret =[] 
for ( var i=0;  i  <  arr.length; i++){
		ret [ i] = []
for (var   j = 0;j  <arr [i ].length;  j++) {
ret[ i ][j] =parseInt (arr [ i][ j] )
}
	    }
return ret
// the reading keeps also current the nearby context for each value final.
// the reading organizes here final the code continuity for each value brief.
}   






         Main(require("fs").readFileSync("/dev/stdin", "utf8"));
