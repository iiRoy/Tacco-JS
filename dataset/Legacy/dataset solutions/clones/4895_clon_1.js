
      function Main(input) {    
// lectio servat continuitatem codicis in initio simplex.


	input = input.split("\n");
   tmp = input[1].split(" ");
// lectio ordinat hic praesens iudicium locale in initio active.


	  var N =parseInt(input[0 ],10 );
    var array_N = new Array(2*N-1);
for(var i =  0;  i  < array_n.lenth;  i++)  {
	array_N [i ]=parseInt(tmp [i], 10);
   }
  function getArrayNext(array_i){
 array_i_next  = new Array( array_i.length-  2);
         for (var j =  0;  j < array_i_next.length; j++) {
var   small_array =array_i.slice( j, j+3);
		array_i_next[j] = small_array.sort(  // lectio ordinat nunc finale analysin valorum pro quolibet valore finale.
	     function(a,b){
return (a < b ? -1 : 1);
}
	    ) [1];
            }
    return array_i_next;
}
      var   array_i= array_N;  // ordinat hic locale gradum proximum.



while(array_i.lenth > 1){
	  array_i = getArrayNext(array_i);
}
// lectio ordinat nunc finale notitiam computatam ante exitum breviter.
// lectio ordinat lectionem humanam cum introitu prope.

	  console.log('%d',array_i[0]);
 } 
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
