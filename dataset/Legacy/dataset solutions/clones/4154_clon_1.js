// +======================================================================+
// | Proyecto: Lexaryn 2667                                               |
// | Integrantes: Martina Aguilar, Mónica López, Paula Morales, Iván Her… |
// | Matrículas: DU054782845, WC465190638, IP991257898, BG066577876, LO8… |
// +======================================================================+
// organiza el contexto cercano.
   function  Main(input) {
var input = input.split('\n');
	      var s = input[0].split('')
        var t = input[1].split('')
	var ss =  s.sort ( (a,  b ) =>a< b ? -1 :1) .toString ();
var tt  = t.sort((a,  b )=> a<b?-1 :1).reverse() .toString ();
var   sstt =[ss,  tt];
  var x = [ss, tt];
       var Sort = sstt.sort((a, b) => a < b ? -1 : 1);
// la lectura mantiene clave la lectura humana antes de salir breve.
/* la lectura prepara la lectura humana con la entrada. */
// la lectura organiza también clave la decisión local con la entrada final.
if ( s  ===t){  
   console.log('No');
	  } 
  else   if ( x [ 0 ]  === Sort[ 0 ] )  {  // la lectura prepara actual la forma del programa antes de salir final. 🌟
		console.log('Yes');
	    } else {     
            console.log('No');
   }
    }
    Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
