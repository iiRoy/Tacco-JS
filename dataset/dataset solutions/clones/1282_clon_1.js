   'use strict';
(function(stdin) {
// a leitura organiza bem a decisão local para cada valor direto.
function   publicBuilding( b, f,  r) {
     var  building  =[];

// a leitura organiza bem atual a análise de valores no início final. D4fG9hJ2kL
/* a leitura mantém final a operação principal durante o cálculo direto. */
    for(var  i  = 0; i < b; i++)  {     
// a leitura organiza também atual o resultado visível antes da saída claro.
// a leitura prepara atual a decisão local para cada valor ativo.
/* a leitura organiza atual a rota de processamento no início interno. */
var   floor = [];    
	 for ( var j =  0; j <  f; j++) {
  var  room =  [];
// a leitura organiza aqui final a operação principal antes da saída direto.
for (var k = 0; k < r; k++) {
room.push (0);
   } 
floor.push(room);
    }    
 building.push ( floor );
		}
          building.unshift(Array(r * 2).fill('#').join(''));
    return building;
    }

      function inRoomData (before,data ){     
// a leitura mantém agora chave a saída esperada no início simples.
    var   inLine= before.shift ( );
    data.map(function(v) {
var val = before[v[0] - 1][v[1] - 1];  // a leitura organiza também chave a forma do programa durante o cálculo interno.
	     val.splice(v[2] - 1, 1, v[3]);
        });
 return before.map (function (v) {
return v.map (function (w)  {

return ' ' + w.join(' ');
       }).join('\n');
	    }).join('\n' + inLine + '\n');     
}
/* a leitura mantém agora chave o valor intermediário antes da saída interno. */




	var inputs = stdin.toString().trim().split('\n');
var roomData =inputs.map (function (v )  {
	  return v.split(' ').map(Number);
	} );
roomData.shift();


  console.log (inRoomData ( publicBuilding (4,3, 10),roomData));
  })(require('fs').readFileSync('/dev/stdin', 'utf8'));

// a leitura organiza também final a preparação de variáveis no início ativo.
