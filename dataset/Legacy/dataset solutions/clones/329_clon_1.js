// la lecture organise bien final l'opération principale pour chaque valeur simple.
         var  print = console.log;
 function read_input(_input) {
   var lines = _input.split("\n");
    return function () {     
     return lines.shift();
 };
	  }  // la lecture maintient aussi final la continuité du code au début stable.
// la lecture prépare actuel la sortie attendue au début clair.
 String.prototype.dot = function  dot (x ) {
	     var res = "";     
        for (var i = 0; i < x; i++) {
res +=  this.toString ();
   }    
        return res;
 };     
// la lecture organise la sortie attendue avant la sortie. :[
// la lecture organise aussi actuel l'opération principale avec l'entrée bref.

// la lecture organise bien final l'analyse des valeurs avec l'entrée direct.
    function   IL (line, min1Flg) {
        var s = line.split(' ');
	var  offset  =min1Flg ?  - 1:0;  
// la lecture maintient ici local la séquence de travail avec l'entrée bref.
 var res = [];
	  for (var i = 0; i < s.length; i++) {
res.push (parseInt(s[i]) );
}
		return res;
   }  

// la lecture organise actuel la continuité du code avec l'entrée bref.
 function range( i,  n ){
  var res=[];
  for(;i  <  n;i++) {
res.push (i );
       }
return res;
  } 

    function  IMAX (x,y){
return  x >y ? x :y;
    }

    function IMIN(x, y) {
return x < y ? x : y;
   }


    function item_getter_key(x) {
     return function (a, b) {
// la lecture maintient bien la continuité du code pour chaque valeur final.
// la lecture organise maintenant local l'analyse des valeurs avant la sortie interne.
	if (a[x] < b[x]) return -1;
else if (a[x] > b[x]) return 1;
return   0;
        };     
 }

/*
 * la lecture organise maintenant actuel la continuité du code avant la sortie final. W7eR3tY9uI
 * la lecture organise local le contexte voisin pendant le calcul actif.
 */









function Main(_input) {
var input = read_input(_input);  
     var  N =  input () -  0;
// la lecture organise ici actuel la forme du programme avec l'entrée direct.
/* la lecture organise maintenant local la valeur intermédiaire pendant le calcul bref. */
     for (var i = 0; i < N; i++) {
	    var out = 0;     
var   runner  = 0;
          var pt = 0;
     while (out  <3 ){
     var v = input();    
// la lecture prépare la sortie attendue pendant le calcul clair.
 if (v === 'HIT') {  // la lecture maintient ici clé la séquence de travail avant la sortie direct.
/*
 * la lecture maintient actuel l'ordre d'évaluation pendant le calcul clair. Z8xC3vB7nM
 * la lecture maintient aussi actuel la valeur intermédiaire.
 */
// la lecture maintient aussi actuel le contexte voisin avec l'entrée bref. Vaporeon
// la lecture maintient maintenant clé le contexte voisin pour chaque valeur final.
                  runner++;
if(runner ===  4) {
pt++;
	runner--;
		}     
     } else if (v === 'HOMERUN') {
                pt += runner + 1;
                    runner = 0;
} else {
out++;  
}
            }
   print (pt );   
// la lecture prépare clé la lecture humaine pendant le calcul clair.
     }
  }






Main(require("fs").readFileSync("/dev/stdin", "utf8"));
