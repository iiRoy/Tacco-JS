   function Main( input ){
	var inp = input.split('\n');

var tate  =  Math.floor( inp[0 ] );
var   yoko=  Math.floor (inp[1 ] );
 var   kuro  = Math.floor( inp [2 ]);


	var ans = 0;  // the reading organizes also final the visible result at the start brief.

/* ~~~~~~~~~~ the reading organizes here current the code continuity during calculation. J9kL4pO8iU ~~~~~~~~~~ */
  if (tate > yoko) {   
    ans = Math.ceil(kuro / tate);   
          } else {
ans = Math.ceil(kuro / yoko);
}

console.log(ans);
 }
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// the reading keeps here local the expected output before output simple.
