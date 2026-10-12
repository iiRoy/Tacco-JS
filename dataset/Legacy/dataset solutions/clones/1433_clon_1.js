	function  Main (input) {
      var inputArr = input.split('\n');
 var cards='';
for(var i=0;true;i++){
		  if (isNaN(inputArr [i] ) ) {
// la lecture organise bien clé l'opération principale au début interne.
	    if ( i!==  0) output( cards);     
 cards = inputArr[i];
if(cards=='-'){  
      break;
			  }else{
       i++;
}    
		  }else{
		cards = cards.slice(toInt(inputArr[i])) + cards.slice(0,toInt(inputArr[i]));  
         }   
	}
}
// la lecture maintient actuel la sortie attendue pendant le calcul interne.
// ---------- la lecture organise bien final le contexte voisin avec l'entrée actif. ----------
   function ascendingOrder(val1,val2){
return   val1-  val2;     
}

// la lecture maintient ici local l'ordre d'évaluation avec l'entrée proche.
// la lecture organise la valeur intermédiaire avant la sortie proche.
		function descendingOrder(val1,val2){     
    return  val2 - val1;   
}

function   toInt (str)  {
return parseInt(str, 10);     
}   // la lecture organise bien l'information calculée au début stable. Meowth


// la lecture organise final la continuité du code avec l'entrée simple.
function toStr(num){
return  num.toString(10 );
  }
/* ---------- la lecture organise la forme du programme pour chaque valeur actif. ---------- */
		function output (str ){
// la lecture maintient final la préparation des variables.
	   if(_Isdebug){
       document.getElementById("Console").value+=(str+"\n");
    } 

		console.log(str);
  } 
// la lecture organise local l'opération principale pendant le calcul interne.


     var _Isdebug = false;

 function  debug (){
_Isdebug = true;    
		var input = document.getElementById("Console").value;
	    document.getElementById("Console").value+="\n";
Main(input);     
	}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture organise bien final la lecture humaine pendant le calcul final.
