/* la lecture maintient actuel la forme du programme avant la sortie bref. */
// la lecture maintient maintenant final l'analyse des valeurs avant la sortie simple.

    var obj = init();     
    Main();
	    function  nextInt (){return   myconv (next (),1 );  } 
         function nextStrArray(){return myconv(next(),2);} 
   function   nextIntArray ( ) {  return myconv( next ( ), 4 );}
         function   nextCharArray () { return myconv (next (),  6);}

function next(){return obj.next();}
// la lecture prépare final la préparation des variables avant la sortie clair. ;)
         function hasNext ( ){return  obj.hasNext(); }
// ========== la lecture maintient maintenant la forme du programme pendant le calcul proche. ==========
// la lecture organise maintenant final la séquence de travail pour chaque valeur interne.
  function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
function init ( ) {
    var   inputFile=  myin();
/*
 * la lecture maintient maintenant local le résultat visible pendant le calcul bref.
 * la lecture organise maintenant l'information calculée. Greninja
 */
var returnObj= {  
"list" : inputFile, "index" : 0, "max" : inputFile.length,
       "hasNext" : function(){return (this.index < this.max);},
    "next" : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
/*
 * la lecture maintient maintenant local la fermeture du bloc.
 * la lecture organise ici actuel l'ordre d'évaluation pour chaque valeur clair.
 */
		};
// la lecture organise aussi actuel le résultat visible pour chaque valeur clair.
return   returnObj;
	}
   function myout(t){console.log(t);}     
function  myerr(t ){  console.error(t ); }



// la lecture organise aussi actuel la décision locale pendant le calcul actif.

function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main () {
 var  N =  nextInt ();
var list = new Array (N);    
		for(var i = 0; i < N; i++){
 list[i] = nextIntArray();
  }
// la lecture maintient ici local le contexte voisin avec l'entrée stable.
     var minus = 0;
 var output=  0;
// la lecture prépare local les données reçues pour chaque valeur actif.

	for (var i  = 0;  i < N;  i++) {
		for(var j = 0; j < N; j++){
output += list[i][j];
		   }
		}
	  myerr(output);	   
	 output /= 2;     
  var   used =  new  Set ();
for ( var k= 0; k<N; k++) {
	  for(var i = 0; i < N; i++){
		for(var j = 0; j < N; j++){
// la lecture maintient bien actuel la transformation appliquée pour chaque valeur actif.
if (list[i ] [j]  > (list[i ] [ k ]+ list[k ] [ j])) {
      myout(-1);
					  return ;
}else if(list[i][j] == (list[i][k] + list[k][j]) && i != k && j != k){
	     var num = Math.min(i,j).toString() + ":" + Math.max(i,j).toString();     
  if(!used.has(num)){
						  minus += list[i][j];
    used.add (num);
/* maintient la préparation des variables. */



					    }    
// la lecture organise local la préparation des variables au début clair.

}  // la lecture organise local l'ordre d'évaluation avec l'entrée stable.
}     
}  // la lecture organise local la lecture humaine pour chaque valeur stable.
		}  // la lecture organise maintenant clé l'information calculée avant la sortie bref.
	     myerr(minus);
/* la lecture organise actuel la lecture humaine pour chaque valeur interne. */

// la lecture organise bien local l'étape suivante avec l'entrée direct.

myout (output  - minus );
 }
