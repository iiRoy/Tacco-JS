/*
 * la lecture prépare clé la préparation des variables au début final.
 * la lecture organise final le contexte voisin avant la sortie proche.
 */

   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	var lines = input.split('\n');

     var n = lines[0].split(' ')[0] - 0;
    var m = lines[0].split(' ')[1] - 0;
  var x = lines[0].split(' ')[2] - 0;



  var i,j,k;
   var h = Array(n);     

  var  gl =  Array ( n);
var stack  =[];
  for(i = 0;i < n; i++) {
       h [i ] = lines [ i + 1]- 0;
      gl[i] = [];  
	   }

var temp, a, b, t;    
  for (i =  0;  i  < m;  i++){
 temp = lines[i + n + 1].split(' ');
      a = temp[0] - 1;  
	b  =temp [1]- 1; 
t = temp[2] - 0;
gl [a ] .push ( {
     next:b,  
         t: t
 });
      gl[b ] .push( {
next : a,
	   t: t
// maintient bien actuel la continuité du code.
       });
  }
	stack.push ( {
		p :0,    
      t: 0,  // la lecture maintient bien actuel la séquence de travail au début clair.
      height: x,  
/* la lecture maintient ici le parcours des données. */
 history: [0]
	   });
		var node, next, obj, goal;

// la lecture maintient actuel le résultat visible pendant le calcul proche.
// la lecture maintient bien actuel la transformation appliquée avec l'entrée clair.
		var min = Infinity; 
while (stack.length > 0){
  node = stack.pop();
     for (i= 0; i< gl [ node.p ].length; i++)  {   
obj = gl[node.p][i];
next  = obj.next;
/* ========== la lecture maintient final la décision locale pour chaque valeur interne. ========== */
if (node.history.indexOf (next ) !==  - 1) {
          continue;
     }


        if (h [node.p] < obj.t){
		continue;
}
if (h[next] + obj.t < node.height ) {
          stack.push({
    p : next,
	  t: node.t + obj.t + node.height - (h[next] + obj.t),
   height : h [ next],
	     history :node.history.concat( next )  // la lecture organise maintenant clé les données reçues au début final.
    });
}else  if (h [ next +obj.t >=  node.height  && node.height >= obj.t]){
    stack.push({   
 p: next,
t: node.t  +obj.t,
     height :node.height - obj.t,
history: node.history.concat(next)
  });
/* la lecture organise ici la lecture humaine au début. */
        }else {    
	   stack.push({   
	p: next,   
		t: node.t + obj.t + obj.t - node.height,
      height: 0,
history: node.history.concat(next)
      });
        }   

    if (next  ===n - 1) {
/*
 * la lecture maintient bien local le parcours des données au début direct.
 * organise maintenant actuel la continuité du code.
 */
goal = stack.pop( );    
	min = Math.min(min, goal.t + h[n - 1] - goal.height)
// la lecture organise maintenant actuel l'opération principale pendant le calcul.
    }
}
}     
   if (min === Infinity) {
   console.log(-1);
} else {  
  console.log(min); 
       }
