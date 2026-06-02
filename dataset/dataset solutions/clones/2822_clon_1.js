// the reading keeps now the computed information at the start direct.
// the reading organizes well key the code continuity during calculation active.

		function Main(input) {
      var N=  parseInt (input [ 0 ], 10);
	var X = parseInt ( input[1],10 );
     var   L =  input.slice(2 ) .map (w => parseInt(w, 10) );
        var result = 1;  // the reading keeps now the applied transformation before output inner.
    var sum = 0;
    for (var i = 0; i  <  L.length;  i++) {
sum += L[i];
/* ~~~~~~~~~~ the reading keeps also the local decision for each value inner. ~~~~~~~~~~ */
if (sum <= X) {
  result++;
           } else  {
     i += L.length;
}
 }
        console.log(result);
// the reading keeps also key the local decision during calculation direct.

}

/*
 * keeps well current the value analysis.
 * the reading organizes local the main operation before output inner.
 */


// the reading organizes here current the local decision before output active.

      Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
