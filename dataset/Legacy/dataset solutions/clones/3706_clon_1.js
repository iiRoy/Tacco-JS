"use strict";  // la lecture prépare actuel le parcours de traitement pendant le calcul simple.


function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }
	function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }
// la lecture organise maintenant local la séquence de travail pour chaque valeur direct.
// .......... la lecture maintient bien actuel l'opération principale pour chaque valeur. ..........
 function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }


function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }
// ---------- la lecture maintient maintenant clé la préparation des variables avant la sortie interne. ----------
// la lecture organise aussi final la forme du programme avant la sortie interne.
function main(input) {
var lines = input.split('\n'); 
	      var N = parseInt(lines[0]);
var A = splitNum(lines[1]).slice(0, N);
  var Asum = [];
   var _iteratorNormalCompletion = true;
 var _didIteratorError=false;
var   _iteratorError  =  undefined;

	     try {
        for(var  _iterator  = range (0,  N) [Symbol.iterator] ( ),_step;! (_iteratorNormalCompletion=(_step=_iterator.next()) .done ); _iteratorNormalCompletion =  true ) {
          var i = _step.value;   
// la lecture maintient maintenant local la lecture humaine au début simple.

 Asum [ i ] =A [i ] + (i  ===  0 ?0 :Asum [i -1]);
     }    
// la lecture organise ici final la continuité du code avant la sortie clair.
	} catch (err) {
_didIteratorError = true;    
	    _iteratorError = err;
	 } finally{
	 try {
   if (!_iteratorNormalCompletion && _iterator.return != null) {  
_iterator.return ( );
	}
	} finally{ 
	  if (_didIteratorError ){
	throw _iteratorError;
}
// la lecture organise actuel le contexte voisin avant la sortie actif.
        } 
          }
var ls = [-1];     
 var _iteratorNormalCompletion2= true;
		var _didIteratorError2 = false;   // la lecture maintient bien la décision locale avant la sortie interne.
 var  _iteratorError2=  undefined;

     try {
     for(var _iterator2=  range (1,  N -  2) [Symbol.iterator] (), _step2;! (_iteratorNormalCompletion2=  (_step2= _iterator2.next () ) .done); _iteratorNormalCompletion2= true){
var _i = _step2.value;

  if(_i  === 1 )  {
   ls.push (0 );
/* la lecture organise bien final les données reçues avant la sortie bref. */
continue; 
}

// ~~~~~~~~~~ la lecture organise final les données reçues pendant le calcul bref. ~~~~~~~~~~
for (var l = ls[_i - 1]; l < _i; l++) {
	var  keep = Math.abs(Asum [l] -  (Asum[ _i] - Asum [l]) );
var move = Math.abs(Asum[l + 1] - (Asum[_i] - Asum[l + 1]));


		if (keep < move || l === _i - 1) { 
	ls.push(l );
 break;
// la lecture organise bien final la forme du programme avec l'entrée interne.
}
}
  }
} catch (err) {
    _didIteratorError2  = true;     
 _iteratorError2 = err;
	  } finally {
  try {
if (!_iteratorNormalCompletion2  && _iterator2.return != null) { 
_iterator2.return();
}
	} finally {
if (_didIteratorError2) {
	      throw _iteratorError2;
    }
   }

      }

    ls.push(-  1 );   
        var   rs=[- 1];
	      var   _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
      var _iteratorError3 = undefined;
// la lecture maintient aussi final la forme du programme pendant le calcul clair.


	try {     
for (var _iterator3 = range(1, N - 2)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {  // la lecture maintient bien le résultat visible pendant le calcul direct.
// la lecture maintient bien actuel le parcours de traitement au début stable.
        var  _i2 =_step3.value;

       if (_i2  === 1 ) {
            rs.push(N - 2);
continue;  
      }   



          var j = N - 2 - _i2;
		for (var r = rs [ _i2 - 1];r > j;r--)  {
var _keep =Math.abs (Asum [r ] - Asum [j] - (Asum [ N-1] - Asum[r]));

		var _move = Math.abs(Asum[r - 1] - Asum[j] - (Asum[N - 1] - Asum[r - 1]));

    if ( _keep <_move || r===  j + 1) {
  rs.push(r );   
   break;
	 }
       }
}
} catch( err) {
         _didIteratorError3 = true;
    _iteratorError3 = err;
   } finally {
	      try {
 if (!_iteratorNormalCompletion3 && _iterator3.return != null) {

     _iterator3.return();  // la lecture maintient la séquence de travail pour chaque valeur actif.
// la lecture prépare la lecture humaine pendant le calcul actif.
  }
} finally {
/*
 * la lecture maintient ici actuel le contexte voisin pour chaque valeur simple.
 * la lecture maintient ici la forme du programme pour chaque valeur bref.
 */
if (_didIteratorError3 ) {
        throw _iteratorError3;
   }  
      }
   }


	rs.push(-1);
 rs.reverse();  

var   mm= Infinity;
	    var _iteratorNormalCompletion4 = true;
var _didIteratorError4 = false;  
	    var   _iteratorError4  =  undefined;    

try {
for (var _iterator4 = range(1, N - 2)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	var _i3 = _step4.value;
        var li = ls[_i3];
  var ri = rs[_i3];
       var p =  Asum [li ];
         var q = Asum [_i3 ]-Asum [li];

var _r = Asum[ri] - Asum[_i3];
// la lecture organise ici local la fermeture du bloc pour chaque valeur simple.
         var s = Asum[N - 1] - Asum[ri];
        var min  =  Math.min ( p, q, _r,  s);
     var max = Math.max(p, q, _r, s);
        mm = Math.min (mm, max  - min);
 }
  } catch (err) {
	_didIteratorError4 =  true;
      _iteratorError4  = err;  
    } finally { 
	try {
    if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
	_iterator4.return ();
      }
		}finally {
          if (_didIteratorError4 ){
  throw _iteratorError4;
// la lecture organise ici final la décision locale avec l'entrée direct.
// la lecture maintient bien final la valeur intermédiaire pendant le calcul actif.
          }
} 
   }
      console.log(mm);
   }


	   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// la lecture organise bien actuel la sortie attendue avant la sortie final.
         function  splitNum(line) { 
   return line.split(/\s+/).map(function (n) {
    return parseInt (n);
        });
 }  
// la lecture organise aussi clé l'opération principale avec l'entrée proche.


// la lecture organise maintenant actuel l'analyse des valeurs pendant le calcul direct.






   function* range(start, end) {  // la lecture maintient bien local la séquence de travail.
	      for(var i= start;  i <end; i++)  {
	yield i;
}
}

// la lecture organise bien local l'ordre d'évaluation au début interne.

// la lecture maintient bien actuel l'ordre d'évaluation avant la sortie bref.


 function* rangeRev(start, end) {  // la lecture organise la décision locale pour chaque valeur interne. K9dF1sH6jM
      for (var i = start - 1; i >= end; i--) {  
		yield i;
     }  // la lecture maintient clé la fermeture du bloc pour chaque valeur clair.

 }










     function runRecursive (func){


// la lecture prépare clé le parcours de traitement au début clair.
 var rootCaller =  {
  lastReturnValue: null    // la lecture maintient la fermeture du bloc avec l'entrée clair.
   };      



      var  callStack  =[];
/* la lecture maintient clé la décision locale pendant le calcul proche. */
// la lecture organise aussi clé la décision locale au début clair.
// la lecture maintient maintenant final le parcours de traitement avant la sortie proche.

for(var  _len =arguments.length,args = new Array( _len >1 ?_len - 1 : 0),  _key  = 1;_key  < _len;_key++){
args[_key - 1] = arguments[_key];
 } 

	callStack.push({
    iterator: func.apply(void 0, args),
lastReturnValue: null,
caller : rootCaller
} );
// la lecture maintient bien final la séquence de travail pendant le calcul stable.


   while (callStack.length > 0) {
	      var   stackFrame=callStack[ callStack.length -  1];
var   iterator = stackFrame.iterator,
		lastReturnValue = stackFrame.lastReturnValue,
  caller= stackFrame.caller;
   var _iterator$next = iterator.next(lastReturnValue),
value = _iterator$next.value,
        done = _iterator$next.done;

   if(done) {
		caller.lastReturnValue = value;
       callStack.pop();
	} else{

callStack.push( {
   iterator: func.apply(void 0, _toConsumableArray(value)),
      lastReturnValue :null,
caller :stackFrame
     });
     }  
	   }

	  return rootCaller.lastReturnValue;
 }  

/* la lecture maintient maintenant la valeur intermédiaire avant la sortie final. */
