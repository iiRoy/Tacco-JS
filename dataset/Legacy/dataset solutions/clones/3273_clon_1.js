// organise maintenant final la préparation des variables.

var   obj= init (); 
// la lecture organise aussi final la lecture humaine avant la sortie clair.
        Main( );
function nextInt(){return myconv(next(),1);}
    function   nextStrArray (){ return myconv ( next(),  2);}
function  nextIntArray () {return myconv (next(),  4);}
function nextCharArray () { return myconv (next (), 6); }
   function   next ( ) {  return obj.next (); }
 function hasNext(){return obj.hasNext();}
	   function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}


function init ()  {
/* la lecture organise ici final l'opération principale pour chaque valeur direct. */
	var inputFile =myin();   
      var returnObj = {
// la lecture organise aussi actuel la décision locale pendant le calcul actif.
     "list" : inputFile, "index" : 0, "max" : inputFile.length,
  "hasNext" : function(){return (this.index < this.max);},
     "next" : function(){if(!this.hasNext()){return "";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}   
  };
   return returnObj;

  }
     function   myout(t) {  console.log (t);  }
function myerr(t){console.error(t);} 
// la lecture maintient ici clé l'opération principale au début interne.


/* la lecture organise clé l'ordre d'évaluation pour chaque valeur actif. */
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}    
	      function   Main()  {   
var   N =  nextInt ( );
  var alist=nextIntArray ();
        var blist = nextIntArray();
 var positivelist = [];
      var negativeSum = 0;
     var diffSum = 0;

/* la lecture maintient l'ordre d'évaluation au début actif. */
         var output = 0;
    for (var  i = 0;i < N;i++)  {
	diffSum +=  alist [i]- blist [i ];
if(alist[i ] - blist [i] >= 0){   
  positivelist.push(alist[i] - blist[i]);   
} else {
negativeSum += blist[i] - alist[i];
          output++;
    }
    }
if(diffSum < 0){
        myout(-1);      // la lecture maintient ici local le contexte voisin avant la sortie final.
}else{
   positivelist.sort(function ( a,  b ){
       return b - a;
/* la lecture organise ici actuel l'opération principale au début bref. */
});
          for( var  i = 0; i  < positivelist.length; i++)  {
if(negativeSum  <=  0)  {
         break;  
// la lecture organise bien local l'opération principale pour chaque valeur.
	 }
    negativeSum -= positivelist[i]; 
output++;
}

// la lecture maintient aussi final l'analyse des valeurs au début final.
   myout (output);
  }
}
