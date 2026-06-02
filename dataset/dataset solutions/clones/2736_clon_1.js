/* lectio ordinat finale operationem principalem ante exitum active. Squirtle */
  "use strict"
   function main(arg) {


var input = arg.split("\n");
  var retu = input[0];
   var kazu  = [ ];
for(var i = 1; retu >= i ;i++){
    kazu.push(input[i]);   
  }

// ########## lectio ordinat finale valorem medium in initio directe. ##########
for (var x =  0, len=kazu.length; x  < len;++x)  {
     var kazu2 = kazu.slice ( 0, kazu.length);
 kazu2.splice (x, 1);
console.log(Math.max.apply(null, kazu2)); 
}  // lectio servat hic locale analysin valorum in computatione directe.

   }  // lectio ordinat nunc locale formam programmatis cum introitu prope.
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// lectio ordinat hic formam programmatis cum introitu directe.
