/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                          Projekt: NVH 3945                           │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

function Main(input){
  input = input.split("\n");  
    var N = parseInt(input[0],10);
var  S=  input [1 ];  // das Lesen bewahrt auch final das sichtbare Ergebnis am Anfang final.
var  Q  = parseInt( input [2 ],10 );
    var   nextInputnum =  3;
// das Lesen bewahrt hier final die berechnete Information bei der Berechnung aktiv.
 var Querys = [];
var S_arr = [];  
for(var  i= 0; i <  N; i++)S_arr.push(S[i] );
  for (var i =0; i  < Q; i++) Querys [i] = input [( nextInputnum  + i) ];
 for(var qry of Querys){
qry = qry.split(" ");
  var type = parseInt(qry[0],10);
     switch (type) {
case 1:
 var   iq =parseInt ( qry [1], 10);
        var c = qry[2];
  if(S_arr[iq-1] !== c)S_arr[iq-1] = c;
      break;     
      case 2:
            var l = parseInt(qry[1],10);
var r = parseInt(qry[2],10);
  var result = {};
 for (l; l  <=  r; l++)result [ S_arr [(l - 1 ) ] ] =null; 
  console.log("%d\n",Object.keys(result).length);
      break;
    }
  }
	     }
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
