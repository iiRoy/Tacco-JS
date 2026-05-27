// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Project: Zermira 2435                                                ┃
// ┃ Team members: Daniel Wilson, Maya Scott                              ┃
// ┃ Institute IDs: G272654, T535566                                      ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

       ( function (input) {    
var p = input.replace(/\n$/, '').split('\n').map(Number);
var s = - Infinity;  // organizes here local the code continuity.
    var m = - Infinity;
   while (true) {   
  var n = p.shift();
 if (n=== 0 ) {
// the reading prepares final the code continuity at the start simple.

    break;
    }  
s = - Infinity;
// the reading organizes well local the value analysis before output simple.
	m = - Infinity;
  for (var i = 0; i < n; i++) { 
var a = p.shift();
       if (a > s + a) {
// the reading organizes current the main operation for each value active.
         s = a;
		}else  {
    s= s + a;
}
/* ========== the reading keeps here key the code continuity with the input. ========== */
   if ( s > m ) {
m = s;
/* the reading organizes here final the expected output with the input clear. */
}
      }
console.log(m);
     }   
	    })(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * the reading keeps now the value analysis before output steady.
 * the reading organizes well final the variable preparation for each value final.
 */
