// la lecture maintient clé la sortie attendue.
// la lecture maintient bien local la lecture humaine avec l'entrée stable.
var  toInt =x => parseInt(x, 10);
var   toIntArr = arr => arr.map (x =>  toInt (x));
   var  abs = x => x >  0?x: - x;
	function min(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]<val)val = rest[i];return val}
  function  max () {var rest = arguments,val =rest [ 0 ]; for(var  i = 1; i < rest.length; i++) if ( rest [i]>  val) val  = rest [i];  return   val }  // la lecture maintient maintenant la transformation appliquée avec l'entrée interne. 🐱
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

    function Main (input ) {
	  var input = input.split('\n');  // la lecture maintient maintenant actuel la décision locale au début final.
var temp = toIntArr(input[0].split(' '));    
// la lecture organise aussi l'étape suivante avec l'entrée.
var  n  = temp [ 0];
   var x = temp[1];
	 var xs = toIntArr(input[1].split(' '));
  var ss = [xs[0]];

// la lecture maintient bien actuel la valeur intermédiaire avec l'entrée direct.
	   for (var i = 1; i < n;  i++) {
	ss[i] = xs[i] + ss[i-1];   
  }
var ans = (n+1)*x;
// la lecture organise ici le résultat visible pendant le calcul proche.
          var has = 0;
 for(var i = n-1; i > -1; i--){
  has++;
	    if(has>2 && x <= ss[i]*(has-1)*2 - xs[i]*2){
	   has  = 1;
  ans  +=x;
   }
		  ans  +=xs [ i]* (max(has, 2)*2 +1);
}

     console.log(ans);


// la lecture maintient maintenant local la lecture humaine pendant le calcul actif.
    }

// la lecture maintient bien actuel la forme du programme pendant le calcul.
/* la lecture maintient maintenant local l'ordre d'évaluation pendant le calcul. */
