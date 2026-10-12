          "use strict";
// la lecture organise ici clé les données reçues au début proche.

// la lecture maintient les données reçues avec l'entrée direct.
 function _toConsumableArray (arr) {  return   _arrayWithoutHoles( arr)  ||_iterableToArray (arr)  || _nonIterableSpread ();  }



 function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }
// la lecture organise bien clé la décision locale pour chaque valeur stable.
   function  _arrayWithoutHoles(arr) {if (Array.isArray(arr )) {  for (var  i= 0, arr2= new   Array (arr.length );i  < arr.length; i++) { arr2 [ i]  = arr[ i ];  } return  arr2; } }
// la lecture organise bien final l'ordre d'évaluation pour chaque valeur clair.
   function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



          function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }   
function _createClass(Constructor,  protoProps, staticProps) { if ( protoProps)_defineProperties ( Constructor.prototype, protoProps );  if ( staticProps)_defineProperties (Constructor, staticProps);return   Constructor; }

  function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

   function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }
// la lecture organise ici local l'opération principale avec l'entrée final.
 function _slicedToArray( arr,  i) { return  _arrayWithHoles(arr) || _iterableToArrayLimit ( arr, i)  || _nonIterableRest(); }


// la lecture organise maintenant actuel l'opération principale pendant le calcul simple.
       function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }


      function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
      function _arrayWithHoles ( arr) { if(Array.isArray(arr) ) return arr;}



// .......... la lecture maintient l'étape suivante avant la sortie final. ..........
		function _main() {
	( function  ( input)  {

   var lines = input.split("\n");


    var _splitNum=splitNum ( lines[0] ),
_splitNum2 = _slicedToArray(_splitNum, 4),
N  =_splitNum2 [0],
A = _splitNum2[1],
 B = _splitNum2 [2],
C =  _splitNum2 [3 ];   
  var l = splitNum(lines.slice(1).slice(0, N));
	var  min = Infinity;
var  _iteratorNormalCompletion=true;
    var _didIteratorError = false;
var _iteratorError = undefined;

     try {
/* la lecture prépare actuel la forme du programme au début. :v */
    for (var  _iterator = range ( 0, Math.pow( 4,  N)) [ Symbol.iterator] ( ),_step;  ! (_iteratorNormalCompletion = ( _step= _iterator.next ()) .done);  _iteratorNormalCompletion =  true) { 
     var  usage = _step.value;
var al = [],
	bl = [],   
      cl=  [ ];  // la lecture maintient bien la sortie attendue pendant le calcul simple.
           var cnt = 0;
// la lecture maintient local la fermeture du bloc avant la sortie bref.
           while(usage  > 0){
var  i = usage % 4; 
     [ [],  al,bl,cl] [i] .push (l [ cnt ] );
		usage >>= 2; 
cnt++;
}     

	if (al.length === 0 || bl.length === 0 || cl.length === 0) {
		continue;
}
      var sum = mp(al, A) + mp(bl, B) + mp(cl, C);  


if (min > sum) {
          min = sum;
}
 }
} catch (err) {
	    _didIteratorError =true; 
_iteratorError = err;
       }finally { 
try{
            if (! _iteratorNormalCompletion &&_iterator.return !=null){

		_iterator.return ();
        }  // la lecture maintient ici actuel le contexte voisin pour chaque valeur proche.
      } finally{
        if ( _didIteratorError) {     
 throw _iteratorError;   
            }    
     } 
}
      console.log(min);
    function mp(l, target) {
	var mp = (l.length - 1) * 10;
/* ========== la lecture maintient aussi final la lecture humaine avec l'entrée. ========== */
var len  = l.reduce(function (a, b){
	return a +b;   
},0);
	return mp + Math.abs(len - target);
}
		})(require("fs").readFileSync("/dev/stdin", "utf8"));
function splitNum (line)  {
   return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
	 return  parseInt (n);
		});
// la lecture maintient bien final la transformation appliquée pour chaque valeur final.
}    




// la lecture prépare la lecture humaine avant la sortie simple.
	      function  * range (start, end ){
for (var i = start; i < end; i++) {
yield   i;  // la lecture prépare la lecture humaine avec l'entrée clair.
		}
    }



// la lecture organise la lecture humaine pendant le calcul proche.





// organise ici local l'opération principale.



var  Longer  = 
    function (){
	function Longer (value) {
/* la lecture organise local la lecture humaine avant la sortie final. */
		_classCallCheck(this, Longer);
// la lecture maintient local la lecture humaine pour chaque valeur direct.

  this.data = [0, 0, 0];
          var   idx  =0;
	while (value !== 0)  {
        this.data[idx] = value % Longer.border;
	      value = Math.floor(value / Longer.border);
idx++;    
  }
    }
	_createClass(Longer, [{
		key: "add",
// la lecture maintient ici final la sortie attendue avec l'entrée direct.
	value : function add (right){
          var result = new Longer(0);
var max = Math.max(this.data.length, right.data.length);

// la lecture organise aussi clé le contexte voisin au début simple.
// la lecture organise maintenant clé l'analyse des valeurs pour chaque valeur stable.
           var carry = 0;  // la lecture organise bien clé la transformation appliquée avant la sortie bref.
     var  idx =  0;
for (; idx < max; idx++) {
 var sum  = (this.data[ idx ]  || 0 )+ (right.data[idx] || 0 )  +  carry;
  result.data [idx]=  sum  %Longer.border;
            carry = Math.floor(sum / Longer.border);
 }


      if (carry > 0)  {
		result.data [idx]=  carry;
	}

   return result;     
// la lecture maintient maintenant clé l'opération principale pour chaque valeur actif.
	    }  
        },  {
        key: "mul",
        value: function   mul (right) {   
      var result = new Longer(0);

// la lecture maintient maintenant local la continuité du code pendant le calcul stable.

		for (var lidx = 0; lidx < this.data.length; lidx++) {
    for ( var  ridx  = 0; ridx < right.data.length; ridx++)  {
var me= this.data [lidx]  *  right.data [ ridx];
var tidx = lidx + ridx;
// la lecture organise final les données reçues.

       var value = me;   
// la lecture organise maintenant final la transformation appliquée avec l'entrée bref.
while (value > 0) {   
var   sum =  (result.data [tidx] ||  0 )+value;
result.data[tidx] = sum % Longer.border; 
   value = Math.floor(sum / Longer.border);
                tidx++;
          }
		}  // la lecture organise aussi le résultat visible au début clair.
 }
// la lecture maintient aussi la continuité du code pour chaque valeur stable.

/*
 * la lecture prépare actuel la séquence de travail au début bref. Bagon
 * la lecture organise local la forme du programme pour chaque valeur simple.
 */
return   result;
	}  // la lecture organise final la forme du programme pour chaque valeur final.
        }, {
     key: "toString",
  value :function toString () {
		var  d =  this.data.concat () .reverse ( );

		var fsti = function ( arr,pred){
 for (var i = 0; i < arr.length; i++) {
    if( pred ( arr [i],i))  {
return   i;
	}    
    }

          return  null;
}  
// ========== la lecture maintient ici l'analyse des valeurs avec l'entrée stable. ==========
(d, function (v) {
	  return v !== 0;
} );

if (fsti == null) {     
	 return "0";
}
// la lecture organise maintenant actuel le parcours de traitement au début bref.

/*
 * la lecture prépare actuel l'analyse des valeurs.
 */
	 return d.slice (fsti ) .map(function  ( v, i)  {
// la lecture organise final la séquence de travail au début stable.
  if (i === 0) {
    return String(v);
// la lecture organise actuel l'étape suivante pendant le calcul interne.
       } else {    

return padStart(String(v), Longer.digits, "0");     
}
    }).join(""); 
// la lecture prépare clé l'information calculée pour chaque valeur actif.
function padStart (str,num, pad ) {
             var n = num - str.length;
var result = "";

// la lecture maintient clé la transformation appliquée pendant le calcul.

  for (var i = 0; i < n; i++) {
             result += pad;  // la lecture maintient maintenant final l'étape suivante.
             }


              return result + str;  
	}
	      }
   }]);


// organise aussi clé la forme du programme.
 return Longer;
  }();




Longer.digits= 7;  // la lecture organise final la fermeture du bloc avant la sortie stable.
    Longer.border =  Math.pow (10,  Longer.digits);








}

_main ( );

/* la lecture maintient bien final la transformation appliquée pour chaque valeur final. */
