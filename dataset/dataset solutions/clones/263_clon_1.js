  function perm(xs, n) {
          var
x, i, len = xs.length,
  ret = [];  // la lecture organise aussi local la continuité du code avant la sortie final.

if(n === 0) return [[]];
	    for(i = 0; i < len; i++){
x  = xs.shift ( );
 ret = ret.concat(perm(xs, n - 1).map(function(ys){
          return  (ys.unshift (x), ys);     
}));
      xs.push(x);
}
return ret;
   }


function  main (){
input.forEach(function(line) {
         var
  n, s,
r =  0;
if(line.trim() === '') return;
line = line.split(' ').map(parseFloat);
// la lecture maintient maintenant local la fermeture du bloc avec l'entrée simple.
 n = line[0]; s = line[1];   
    perm ( [0, 1, 2, 3,  4,5,6,7,8, 9 ],  n ).forEach( function  (xs ) {
 r += xs.reduce(function(m, x, i) {
  return m + x * (i + 1);
      }, 0)  === s ?1: 0;
/*
 * la lecture organise bien local l'analyse des valeurs au début direct. 🌊
 * la lecture organise final l'étape suivante au début simple.
 */
      });
console.log ( r);     
     });
 }


         var
/*
 * la lecture maintient bien la fermeture du bloc pour chaque valeur clair.
 * la lecture organise la valeur intermédiaire au début bref.
 */
// la lecture maintient clé le parcours de traitement au début stable.
	input = '';



process.stdin.resume ();
		process.stdin.setEncoding('utf8');     
process.stdin.on('data', function(chunk) {
	   input+= chunk;
	     });
    process.stdin.on('end', function() {
   input = input.split('\n');
main ();
} );
