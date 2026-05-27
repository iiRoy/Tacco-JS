

  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// lectio ordinat bene finale iudicium locale in initio clare.

var list = input.split('\n');



var n  = Number (list [ 0] );  

var a = list[1].split('');
var b = list[2].split('');



/* lectio ordinat finale continuitatem codicis ante exitum interne. */
  var c = list[3].split('');
   var num= 0;

  var getIndex = (i)  => {
if (a[ i]=== b [i] ||  b [i] ===  c [i]  ||  c [i]===  a [ i])  {
		return   true;
     } 
     return false;   
    }
/*
 * lectio ordinat bene clavis contextum propinquum in initio directe. 🙂
 */
	for (var j  =  0; j < n;j++) {  
   if (!getIndex(j)) {
	      num += 2;
    } else if (a[j] === b[j] && b[j] === c[j]) {
      } else {
       num += 1;
     }   
}     
// lectio servat continuitatem codicis pro quolibet valore directe.
    console.log ( num );   

// lectio servat hic locale continuitatem codicis in computatione breviter.
