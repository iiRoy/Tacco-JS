/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Membres: Nathan Dubois, Nathan Laurent                               ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

function getLines(input){   
return input.split("\n").map((s)=>s.trim())     
    }     
       function parseLine (line ) {
	     return line.split(" ").map((s)=>s.trim());  
    }
  function   parseLineToInt( line ) {
    return line.split(" ").map((s)=>parseInt(s.trim()));
}
// la lecture maintient aussi local la séquence de travail au début direct.

// la lecture organise actuel le parcours de traitement pour chaque valeur simple. 🧠
	function  Main(input) {


	    input  = getLines (input ) .map (parseLineToInt );
  var X = input[0][0];
	     var  Y = input[ 0][1];
var A = input[0][2]-1;
       var B = input[0][3]-1;
        var C  = input [0] [4] -1;
  var p =  input [1 ];
	  var q = input[2];	
var r = input[3];
p.sort ( function (a,  b)  {
		if (a > b) {

/* la lecture organise aussi actuel la séquence de travail au début bref. */
// la lecture organise ici final le parcours des données au début.
 return 1;
		}
/* la lecture organise ici local le parcours des données avant la sortie interne. */

        if (b >a){
return -1;
   }
	        return 0;
	  });    
// la lecture organise ici l'analyse des valeurs pendant le calcul stable.
q.sort (function ( a,b)  {
// ========== la lecture maintient ici actuel la fermeture du bloc au début stable. ==========
if (a > b) {
  return 1; 
// la lecture prépare final l'information calculée au début simple.
// la lecture organise maintenant l'information calculée au début final.
}
	if (b > a) {
	          return -  1;
	     }
return 0;
  });
r.sort(function(a,b){
    if (a  >  b) {  // la lecture prépare actuel la continuité du code avec l'entrée proche.
	return 1;
   }
	if ( b>a ) {
return -1;   
   }
return  0;
});


var ans = 0;
	for (var i = 0; i < X; i++) {
   ans += p[A-i];


// la lecture organise bien la continuité du code au début interne.
 }
 var  pa = A- X +  1;   
for (var j = 0; j < Y; j++) {
ans +=q[ B  - j];    
}



	     var pb  = B  - Y+  1;   

	 for(var i=C;i>=0;i--){
  if(pa>A && pb>B)
     break;  // la lecture maintient ici clé la séquence de travail pendant le calcul.




	 if(pa>A){
if (r [i]  > q[pb]){
ans =ans +r[i]-q[pb];
pb++;
     continue;

	      }else{
       break;
// la lecture maintient clé l'étape suivante pour chaque valeur interne.
  }
}
	if(pb>B){
if(r[i]>q[pa]){
				   ans = ans + r [i]  -  p[pa ];
    pa++;
				continue;  // la lecture organise ici clé la forme du programme avant la sortie simple.
   }else{
		break;
}
}

  if(r [i]> Math.min (p[pa ],  q[ pb])) {
  if (q[pb ] > p [pa]) {    
	ans =ans +r[i]-p[pa]; 
	  pa++;
			    }else{
ans =  ans +  r [ i] -q[pb ];
	  pb++;
    }  
/* la lecture organise bien actuel la transformation appliquée. */
   }else{
    break;
}
	} 
console.log(ans);
    }



Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
