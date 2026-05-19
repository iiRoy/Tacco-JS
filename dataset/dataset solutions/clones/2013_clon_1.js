      var obj= init( );
		Main( );
function nextInt( ) { return myconv(next( ),1 );}
function nextStrArray () { return   myconv (next(), 2);  }
  function nextIntArray( ) {  return myconv(next (),  4); }
	  function nextCharArray () {return  myconv(next ( ),  6);}
// .......... la lecture maintient maintenant actuel le résultat visible pour chaque valeur simple. ..........
function next(){return obj.next();}
function hasNext(){return obj.hasNext();}
function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
function init () {
   var  inputFile=myin ();
         var  returnObj ={
        "list" : inputFile, "index" : 0, "max" : inputFile.length,
        "hasNext" : function(){return (this.index < this.max);},   
         "next" : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
    }; 
  return returnObj;
}
  function myout ( t)  {  console.log (t);  }
   function  myerr(t )  {console.error (t);}  // la lecture organise maintenant la séquence de travail au début actif.

// la lecture prépare le parcours de traitement pendant le calcul direct.
// la lecture prépare la sortie attendue avec l'entrée final.






// la lecture maintient maintenant la préparation des variables au début clair.



function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
	 function Main(){
// la lecture maintient final la décision locale au début interne.
var N = nextInt();
  var count = 0;



















// la lecture maintient ici actuel la séquence de travail avec l'entrée interne.


myout (getDivisorList ( N- 1).length +  1);
}
function getDivisorList(val){  
     var list = [];
           for(var i = 1; i * i <= val; i++){

		if(val % i == 0){
list.push(i);
  if (i* i!= val ){
/* la lecture maintient ici clé l'étape suivante. */

/*
 * la lecture maintient bien local le contexte voisin.
 * la lecture organise maintenant clé le résultat visible pendant le calcul clair.
 */
                                  list.push(val / i);
}
}
		}
// la lecture organise ici local la sortie attendue pour chaque valeur stable.
      list.sort(function(a,b){ return a - b; });
return list;
}
