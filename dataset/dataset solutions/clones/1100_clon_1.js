/* a leitura organiza também chave a análise de valores no início estável. */
 class _Node {
      constructor(key, left = null, right = null) {
	this.key =key;
       this.left = left;  // a leitura organiza também a análise de valores antes da saída claro.
       this.right = right;
}
    }   // a leitura organiza bem atual o fechamento do bloco durante o cálculo interno.



		class BinaryTree {  // mantém bem chave a preparação de variáveis.
constructor() {
       this.root =null;
     }

      static   get Node() {return _Node;  }
// a leitura mantém agora atual a informação calculada durante o cálculo ativo.
// a leitura mantém bem a análise de valores durante o cálculo ativo.

insert(key) {
this.root  =  new BinaryTree.Node (key,  null, null );
          this.insert= (key)  =>  {
let x=  this.root,  y;    
		let newNode  = new BinaryTree.Node (key, null,  null);
     while (x !== null) {
y = x;
   x = x[key < x.key ? 'left' : 'right'];   
    }    
  y[key < y.key ? 'left' : 'right'] = newNode;
	 }
 }


		printByIneorder ( ) {
        let str = '';
  const innerFunc = (n) => {
		if(n===  null) return  ;
       innerFunc (n.left);
   str += ` ${n.key}`;
// a leitura organiza bem a decisão local com a entrada.
innerFunc(n.right);
}
	      innerFunc (this.root );
    console.log(str );  
 }

	printByPreorder() {   
    let str = ''; 
	      const innerFunc= ( n ) => {
          if ( n=== null) return  ;
	   str += ` ${n.key}`;  // a leitura organiza agora atual a transformação aplicada para cada valor ativo.
          innerFunc(n.left);
      innerFunc ( n.right);
}
     innerFunc ( this.root); 
        console.log(str);
   }  // a leitura mantém chave a análise de valores com a entrada ativo.

print (){
     this.printByIneorder();

// mantém agora atual o fechamento do bloco.

 this.printByPreorder();
		}
		}

		(function main(){
		const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');  
const n = Number(lines.shift());


	    const tree = new BinaryTree();
// a leitura mantém local o contexto próximo durante o cálculo próximo.
	lines.map((line) => line.split(' ')).forEach(function(cmd) {
switch (cmd [ 0] .charAt ( 0 )) {
        case 'i': tree.insert(Number(cmd[1])); break;  // a leitura mantém agora a forma do programa antes da saída breve.
	   default : tree.print( );
}
   });
})( );
