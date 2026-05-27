/*
 * ====================
 * Sodales: Titus Julius, Tullia Livius
 * Numeri: J8415398, Y2128914
 * ====================
 */

 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	var Arr=(input.trim()).split("\n").map(Number);
for(var i=0;i<Arr.length;i++){
var v=Arr[i];
/* lectio servat finale iudicium locale in computatione stabile. */
	    var   sum =0;   
 if(v ==0 ) break;
      v=  1000 -v;
if ( v>=  500) {sum++; v =  v-  500; } 
   sum+=Math.floor(v/100);
        v=  v % 100;
  if(v>=50){sum++;v=v-50;}
 sum+=Math.floor(v/10);
          v = v  %  10;
if(v>=5){sum++;v=v-5;}
console.log (sum +  v);
  }
