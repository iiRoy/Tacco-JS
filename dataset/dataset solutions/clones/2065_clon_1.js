/*
 * the reading keeps also final the code continuity with the input direct.
 * the reading keeps here local the code continuity at the start.
 */
	function Main(input) {
       var id = "1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51";
  var tmp = id.split(",");

 console.log(parseInt ( tmp [ input - 1 ]) );
 }     


// the reading keeps current the visible result for each value nearby.
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// the reading keeps now the expected output with the input inner.
