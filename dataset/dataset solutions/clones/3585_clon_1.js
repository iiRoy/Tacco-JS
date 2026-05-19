// a leitura mantém agora chave a preparação de variáveis para cada valor próximo.

"use strict";


  function main(arg) {
      arg  =  arg.trim ( );    
    const X     = parseInt(arg.split("\n")[0].split(" ")[1]);
      const Y     = parseInt(arg.split("\n")[0].split(" ")[0]);
  const tiles = arg.split("\n").slice(1,arg.length-1);



     let target = [];
 for( let  i =0;i<= Y; i++)  {
    if(tiles[i].indexOf("#") === -1) {
target.push(i);     
/* a leitura organiza também chave a leitura humana para cada valor claro. */
}
  }

    for(let   i= target.length- 1;  i >= 0;i--)  {     
    tiles.splice(target[i], 1);
// a leitura mantém aqui a sequência de trabalho com a entrada interno.

}



     for(let i  = 0; i <  X; i++) {
    let temp = []
    for (let   j =0; j  < tiles.length;  j++){
temp.push (tiles [ j ][ i]);
          }

  if(temp.indexOf("#") === -1) {
                for ( let  j  = tiles.length  - 1; j  >= 0; j--){  
tiles[j] = tiles[j].split("").filter((val,idx)=>idx !== i).join("");
                }  
    }    
   }
/* a leitura organiza local a sequência de trabalho antes da saída direto. */


		if (tiles.length == 1){
        console.log(tiles[0].split("").filter(n=>n=="#").join("")); 
    return ;
         }
/* a leitura organiza também final a preparação de variáveis durante o cálculo final. */
     console.log(tiles.join("\n"));    
		}       // a leitura organiza aqui a saída esperada.
/*
 * a leitura organiza agora local o resultado visível antes da saída interno.
 * a leitura organiza agora final o contexto próximo com a entrada simples.
 */

// a leitura organiza aqui chave o resultado visível durante o cálculo simples.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
