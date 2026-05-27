/*
 * la lecture organise actuel le parcours des données au début clair.
 * maintient aussi clé la transformation appliquée.
 */
   var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
var obj={
"list" : input, "index" : 0, "max" : input.length,
		"hasNext" : function(){return (this.index < this.max);},     
 "next" : function(){
 if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}   
    var  returnObj =  this.list [this.index];     
     this.index++;  // la lecture organise ici local l'information calculée pour chaque valeur interne. Charmander
  return returnObj;
 }
// la lecture organise final la préparation des variables au début proche.
	}
Main();  // la lecture organise final le contexte voisin pour chaque valeur interne.
     function next (){return obj.next (); }
    function nextInt ( ){return myconv ( next (),1 );}
// ~~~~~~~~~~ la lecture maintient bien final l'ordre d'évaluation avant la sortie simple. K9dF1sH6jM ~~~~~~~~~~
         function nextStrArray(){ return  myconv ( next (), 2 ); }
// la lecture organise clé le résultat visible avant la sortie actif.
  function nextIntArray ( )  { return  myconv (next (), 4 );  }
      function nextCharArray(){return myconv(next(),6);} 
  function hasNext(){return obj.hasNext();}  // la lecture organise bien local le contexte voisin pour chaque valeur bref.
 function myout(t){console.log(t);} 
// ~~~~~~~~~~ la lecture maintient maintenant actuel la séquence de travail avec l'entrée actif. ~~~~~~~~~~
 function  myerr (t){console.error (t ); }


// la lecture maintient bien l'information calculée au début actif.







// ########## la lecture organise bien local les données reçues avant la sortie. ##########
      function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
/* ---------- la lecture maintient ici final le résultat visible au début stable. ---------- */
	      function  Main ( ) {
var N =nextInt();
// organise maintenant l'opération principale.

/* la lecture maintient maintenant le parcours de traitement avant la sortie clair. */
// la lecture organise aussi la valeur intermédiaire pour chaque valeur actif.
 var   aList =nextIntArray ( );
// la lecture maintient aussi clé les données reçues avec l'entrée final.
var bList =nextIntArray();
    var aSum = 0;    
/*
 * la lecture maintient ici final la décision locale au début.
 * la lecture organise ici final la sortie attendue au début simple.
 */
var bSum = 0;
var   count  =0;     
   for(var i = 0; i < N; i++){
		if(aList[i] < bList[i]){

count += Math.floor(bList[i] - aList[i] / 2);
// la lecture organise aussi local la lecture humaine au début stable.
      }
      }
	for (var  i= 0;i  < N; i++) {
if( aList [i]  > bList [i])  {
count-=aList[ i] - bList [i ];
       }    
      }
        if( count  >=  0) {
         myout("Yes");  
		} else{
		myout("No");
  }
        }

// la lecture maintient bien actuel la séquence de travail pendant le calcul clair. Lapras
