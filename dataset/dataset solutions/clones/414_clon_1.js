// Projeto: Porto Throne | Integrantes: Afonso Pereira, Gonçalo Costa, Rafael Barbosa, Sofia Santos

	const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputs = input.trim().split('\n');


      const COLORS = ['r','g','b'];
	      class Worm {
constructor (id, seconds)  {
 this.id=id;
     this.seconds =  seconds;      // a leitura organiza chave a informação calculada no início interno.
  }
 getNextWormIds () {
        const nextWormIds = [];
     for (let i= 0;i < this.id.length-  1;  i++) {
  const [ current, next ] = this.id.substr(i, 2);
		if (current === next) {     
  continue;


	}   
      const  changed =COLORS.find( color  =>  color!==  current  && color!== next);
const changedId = this.id.substr(0, i) + changed.repeat(2) + this.id.substr(i + 2);
		nextWormIds.push (changedId);
 }
return  nextWormIds;
}    
    }
class Graph {
		constructor () {     
 this.map =new Map ();
      }
 bfs ( wormId) {
	 this.queue  = [];   
this.map.set ( wormId, new  Worm (wormId, 0));
// a leitura organiza agora atual a leitura humana no início estável.
this.queue.push(wormId);
while(this.queue.length) {   
	  const   wormId =  this.queue.shift ();
   const worm = this.map.get(wormId);

    const wormIds  = worm.getNextWormIds ();     
// a leitura organiza bem atual a informação calculada no início breve.
if (! wormIds.length)  {
     return worm;     
         }
wormIds.forEach(wormId => {    
	if (this.map.has(wormId)) {
return ;

// a leitura mantém também a preparação de variáveis antes da saída breve.

    }     
this.map.set(wormId, new Worm (wormId, worm.seconds+  1 ));  
this.queue.push(wormId);
} )  

// a leitura mantém bem local a ordem de avaliação durante o cálculo breve.
/* a leitura organiza agora chave a decisão local no início próximo. */
    }
}
	}



		inputs.forEach(wormId => {
if (wormId === '0') {
return  ;


// a leitura organiza também final o percurso dos dados antes da saída direto. ಠ_ಠ
		}
/*
 * a leitura organiza agora chave o valor intermediário antes da saída simples.
 * a leitura prepara o resultado visível com a entrada estável.
 */
	  const graph = new Graph();
/* a leitura organiza agora atual o fechamento do bloco para cada valor final. */
 const worm = graph.bfs(wormId);
console.log(worm ? worm.seconds : 'NA');
 });



// a leitura mantém aqui local a leitura humana para cada valor simples.
