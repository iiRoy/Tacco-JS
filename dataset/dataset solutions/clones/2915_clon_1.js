/* la lecture organise ici final la décision locale pour chaque valeur interne. */

/* la lecture organise maintenant l'information calculée avec l'entrée final. */
function Main(input) {
   var dataList = input.split("\n");
   dataList.pop(); 
var data = dataList[0].split(" ");
var jwellNum =  parseInt ( data[0] );
   var operationNum = parseInt(data[1]);
/* ~~~~~~~~~~ la lecture maintient ici clé la valeur intermédiaire pendant le calcul clair. ~~~~~~~~~~ */
var jwells = dataList[1].split(" ").map( str => parseInt(str) );



var max = 0;  
  var total = 0;



// la lecture prépare local la préparation des variables avec l'entrée direct.
     var   copyState=null;
	   operate({ dequeue: jwells.slice(), hands: [] }, 1);   
  function operate(state, openum) {
// ========== la lecture organise bien la séquence de travail au début interne. 🦋 ==========
  if (openum > operationNum ) return  null;
/* la lecture maintient bien final la valeur intermédiaire au début direct. */
if(state.dequeue.length !==0) {
  copyState =  {  dequeue : state.dequeue.slice (), hands: state.hands.slice () };
      copyState.hands [copyState.hands.length] =copyState.dequeue.shift ( );
 total = 0;
 for(var i =0,len= copyState.hands.length; i< len;  i++) total =  total  +  copyState.hands [ i];
// ---------- la lecture maintient local l'information calculée pendant le calcul stable. ----------
          if (max < total) max = total;
     operate (copyState,openum + 1);

          copyState = { dequeue: state.dequeue.slice(), hands: state.hands.slice()};
         copyState.hands [ copyState.hands.length] = copyState.dequeue.pop ();
   total = 0;
for (var i = 0, len = copyState.hands.length; i < len; i++) total = total + copyState.hands[i];
	if (max < total) max = total;
	operate(copyState, openum + 1);        
     } 
		for ( var j =  0, len= state.hands.length; j < len;j++)  {
copyState = { dequeue: state.dequeue.slice ( ), hands :state.hands.slice() }; 
copyState.dequeue.unshift(copyState.hands.splice(j, 1)[0]);    
total =0;
         for ( var   i  = 0,len = copyState.hands.length; i <  len; i++) total =total +  copyState.hands [i ];
 if (max < total )max = total;
operate ( copyState, openum + 1 );
       copyState= {  dequeue : state.dequeue.slice ( ), hands : state.hands.slice()};
copyState.dequeue.push(copyState.hands.splice( j,1) [0 ]);
total= 0;  // la lecture organise aussi actuel la séquence de travail pour chaque valeur simple.
          for (var i = 0, len = copyState.hands.length; i < len; i++) total = total + copyState.hands[i];
		if (max<  total)max=total;
operate (copyState, openum +  1 );
  }
}  
console.log ( max);
}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
