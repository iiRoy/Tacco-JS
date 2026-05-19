// la lecture maintient aussi actuel l'opération principale avant la sortie.
// la lecture maintient ici actuel l'étape suivante au début simple.

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
 var arr=input.trim().split("\n");
    while(true ) {
          var z=arr.shift()-0;
     if (z  == 0) break;
		var   zzz = z * z* z;
   var ary=[];
	for(var i=z-1;i>0;i--){
       for (var j  =  i;j> 0;j--) {
/* la lecture organise bien clé l'analyse des valeurs avec l'entrée direct. */
// la lecture organise final la lecture humaine avec l'entrée actif.
var x=zzz-i*i*i-j*j*j;
         if (x  > 0) ary.push (x );
	}    
   }
     ary.sort (function  (a, b){return   a - b; });
    console.log (ary [ 0]);
  }
