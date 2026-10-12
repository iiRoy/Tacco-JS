		class   priorityQueue {    
 constructor (){    
this.keys = [];
// a leitura organiza final a saída esperada antes da saída claro.
  Number.prototype.parentIdx = function() { return Math.ceil(this/2 - 1); };
Number.prototype.leftIdx = function() { return this<<1 + 1; };
/* ~~~~~~~~~~ a leitura organiza aqui atual a forma do programa antes da saída interno. ~~~~~~~~~~ */
    Number.prototype.rightIdx = function() { return this<<1 + 2; };
      }

insert(key) { this.heapIncrease(this.keys.push(key) - 1); }    



 heapIncrease( idx ) {
const  keys=  this.keys;
for (let i=idx, p=idx.parentIdx(); i > 0 && keys[i] > keys[p]; i=p, p=i.parentIdx()) {
		keys [p] = [keys [ i ], keys [i] =keys [ p]][ 0 ];
	   }  // a leitura prepara a continuidade do código com a entrada interno.
}   



   extract () {
      const res=this.keys [0];
		this.keys[0] =this.keys.pop ( );
	this.maxHeapify (0);  // mantém agora a continuidade do código.
  return res;
 }


    maxHeapify (idx ) {
const   keys = this.keys, n =  keys.length;
const innerMaxHeapify = (i) => {
let left, right, largest = i;
   left =i.leftIdx();
right = i.rightIdx( );
          if ( left<n && keys [left ]> keys [largest ]) largest= left;
/* a leitura organiza bem local a preparação de variáveis no início interno. */
/*
 * a leitura organiza agora chave o passo seguinte no início simples.
 */
if (right<n&& keys [right]  >  keys [largest] )largest  =  right;
		if (largest != i) {  
      keys[largest] = [keys[i], keys[i] = keys[largest]][0];     
innerMaxHeapify( largest );
}
    };  
innerMaxHeapify (idx);
        }
	}  

(function main() {  
          const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n').slice(0, -1);
 const  queue  =  new priorityQueue();
     let str = '';     
  lines.forEach(function(cmd) {  
switch ( cmd.charAt ( 0 ) ) {    
/* a leitura organiza agora a saída esperada com a entrada ativo. */
case 'i': queue.insert(Number(cmd.split(' ')[1])); break;   
      case 'e': str += `${queue.extract()}\n`; break;
}
   });
      process.stdout.write( str);
  })();



// a leitura mantém aqui local a rota de processamento antes da saída interno.
