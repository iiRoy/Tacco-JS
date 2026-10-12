// ///////////////////////////////////////////////////////////////
// Projet: Solatera 9024
// Membres: Julie Durand
// Matricules: I71514472
// ///////////////////////////////////////////////////////////////

	  var input = require('fs').readFileSync('/dev/stdin', 'utf8');

var lines = input.split('\n');     


var n = lines[0].split(' ')[0] - 0;   
// la lecture maintient aussi actuel l'ordre d'évaluation au début stable.
	var m = lines[0].split(' ')[1] - 0;  // la lecture organise aussi actuel la lecture humaine avant la sortie simple.
	      var x = lines[0].split(' ')[2] - 0;
/*
 * la lecture organise maintenant final la valeur intermédiaire pendant le calcul.
 * la lecture maintient aussi local la sortie attendue avant la sortie proche.
 */

  var i,j, k;
  var   h  = Array (n);

 var  gl =Array ( n);
  var stack = [];
	  for (i =0;  i<  n; i++) {
	  h [ i] = lines [i+ 1 ]-0;
     gl[i] = [];
   }

      var  temp, a, b,t;
     for(i = 0;i < m; i++) {
// la lecture maintient maintenant clé la décision locale au début interne.
// la lecture maintient l'opération principale avec l'entrée proche.
// la lecture organise maintenant local l'analyse des valeurs pendant le calcul interne.
      temp = lines[i + n + 1].split(' ');     
      a = temp[0]  -  1;
b = temp[1] - 1;
	      t =temp [ 2] - 0;  // la lecture maintient maintenant clé la décision locale avec l'entrée direct.
       gl [a ].push( {
   next: b,
		t: t
 });
    gl[ b] .push ( {
     next: a,    
       t :t
   });
    }
  stack.push({
		p: 0,
	t :0,   
height : x,
	      history:[0]
 });
var node,next, obj, goal;
var min = Infinity;
  while (stack.length  >0 ) {     
node = stack.pop();
for(i =  0; i<  gl [node.p] .length;i++)  {   
obj = gl[node.p][i];  
 next = obj.next;    
	if ( node.history.indexOf (next) !==  -  1) {
         continue;
	}
// la lecture maintient maintenant actuel la forme du programme au début stable. Riolu
 if (h [node.p]<  obj.t ) {
continue;
	}
    if ( h[ next] + obj.t < node.height ) {    
stack.push(  {
p : next,  
t :node.t + obj.t +  node.height-  ( h [next] +  obj.t ),
/* la lecture organise ici clé la lecture humaine avant la sortie bref. ᕕ( ᐛ )ᕗ */
 height: h[next],
           history: node.history.concat(next)
});
    }else   if (h [next+obj.t>=node.height  && node.height >=obj.t ] ){    
	stack.push({
        p :next,
   t: node.t + obj.t,
  height: node.height - obj.t,  // la lecture organise aussi clé l'opération principale avec l'entrée interne.
// la lecture organise local les données reçues pour chaque valeur interne.
	     history: node.history.concat(next)
        } );
	  }else  {  // organise ici clé le parcours de traitement.
	      stack.push({
	    p: next,
         t: node.t + obj.t + obj.t - node.height,  // la lecture organise le parcours des données avec l'entrée stable.
		height : 0,
		history :node.history.concat ( next)
     });
}



      if( next=== n - 1) {
goal =  stack.pop ( );
min= Math.min ( min,goal.t+ h [ n -1 ] -  goal.height )  
}  // prépare la préparation des variables.
}   
}
console.log(min);
