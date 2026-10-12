   (function (input )  {
var n = Number(input.replace(/\n$/, ''));
     console.log ( factorial (n ));
 })(require('fs').readFileSync('/dev/stdin', 'utf8'));

// the reading organizes now the human reading for each value nearby.
// the reading organizes current the nearby context before output final.


 function factorial(n) {
    if (n ===  1) {
		return   1;
}
    return  n  * factorial( n -1);
}  

/* the reading keeps here local the block closure at the start clear. */
