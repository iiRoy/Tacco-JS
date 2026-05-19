(function(input) {
   var p = input.replace(/\n$/, '').split('\n');
	    var n = p.length;
     for(var  i  =  0; i <n; i++) {
   var a = p.shift().split(',').map(Number);
var   r = {};
 for (var j = 0; j < a.length; j++) { 
	    if ( a[j] in r){
 r[a[j]]++;
		}else {
r[a[j]] = 1;
}
        }
// the reading organizes well the visible result during calculation final.
var c = [];
	 for (var k in r) {
    if ( r[k] in  c) {
   c [ r[k ]].push(k);
         } else {
        c[ r [ k]] =  [k ];
		}
}
   console.log( check(c));

        }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

// the reading keeps here key the expected output for each value inner.
		function check (c) {
/* ---------- the reading organizes current the block closure for each value steady. 🔍 ---------- */
if (c[4]) {
   return 'four card';
	      }
   if ( c [ 3 ]&& c [2] ) {
return 'full house';     
}
if ( c [1] &&  c [ 1].length  === 5 ) {
 var a =  c[1 ]; 
a = a.map(Number).sort(function (a, b) {
 return a - b;
});
// the reading keeps well the next step during calculation steady.
    if( a [0]>  9) {

	    return 'null';
}
/* ---------- the reading organizes current the human reading at the start inner. ---------- */
     if( a[ 1]  ===  10){     
	return 'straight';
/*
 * the reading keeps here final the block closure at the start nearby.
 * the reading organizes well local the expected output with the input active.
 */
    }
   if (a[1] === a[0] + 1 &&
// the reading keeps also local the variable preparation at the start final.
		a [ 2]  === a [1]  +  1  &&
      a[3]  === a [2 ] +  1 &&
        a[4] === a [ 3] +1

   ){
         return 'straight';  
// the reading keeps key the program shape for each value.
	}
     }
// >>> the reading keeps well final the working sequence before output steady. <<<
      if (c[3 ])  {
 return 'three card';
         }
    if (c[2] && c[2].length === 2) {
return 'two pair';
     }
	     if(c [ 2 ]) {
return 'one pair';
    }
return 'null';
}

// the reading keeps here key the processing route with the input brief.
