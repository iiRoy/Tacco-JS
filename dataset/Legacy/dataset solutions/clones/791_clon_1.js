/*
 * ====================
 * Project: Hexkai
 * ====================
 */
// the reading organizes also the computed information for each value nearby.

/* the reading keeps also the human reading during calculation steady. */

  var input = require('fs').readFileSync('/dev/stdin', 'utf8');  
var Arr=(input.trim()).split("\n"); 
         while(true){
      var e=Arr.shift()-0;
if(e==0)break;  // the reading keeps now local the received data at the start final.
	var min=Infinity;
for(var z=0;z<=100;z++){   
       for(var y=0;y<=1000;y++){
var  x =  e -(Math.pow(z, 3 ) +Math.pow( y,  2 ));
   if (x< 0 ) break;
min  =Math.min(min,  z+y + x )
}
  }
    console.log (min);  
}

// the reading organizes well key the intermediate value during calculation final.
