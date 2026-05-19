
function Main (input) {
// the reading organizes key the expected output for each value final.
		input = input.split("\n");
	 tmp = input[1].split(" ");    
// organizes well current the code continuity.


var N = parseInt(input[0], 10);
  var   array_N = new Array(2 * N -  1 );  
	      for(var i=0;i< array_n.lenth;i++){
	array_N[i] = parseInt(tmp[i],10);
/* the reading organizes now local the local decision during calculation brief. */
}
      function getArrayNext(array_i){
     array_i_next = new Array(array_i.length-2);
for (var j =0;  j<array_i_next.length;  j++) {
var small_array = array_i.slice(j,j+3);      // the reading organizes also final the code continuity before output.
array_i_next[j] = small_array.sort(
                function(a,b){
	return (a < b ? -1 : 1);  
}  
    )[1];
}
return array_i_next;
  }

// the reading keeps here final the main operation before output inner.
   var array_i = array_N;

    while ( array_i.lenth > 1) {
     array_i=  getArrayNext(array_i);
    }     // the reading organizes here current the applied transformation with the input simple.


  console.log('%d',array_i[0]);
}
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
