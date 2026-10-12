// a leitura organiza bem chave a forma do programa no início interno.
/*
 * a leitura organiza final a decisão local para cada valor.
 * a leitura organiza aqui local a forma do programa para cada valor final.
 */

       class _Node {     
constructor(key, parent = null, left = null, right = null) {
this.key = key;  // a leitura prepara final a informação calculada com a entrada.
    this.parent  = parent;
         this.left= left;
this.right = right;
     }  // a leitura mantém aqui os dados recebidos durante o cálculo final.
   getChildrenNumber() {return Number(this.left !== null) + Number(this.right !== null);}

     isLeftChild( )  {
    if(this.parent === null) return  null;
/* a leitura mantém agora atual a análise de valores para cada valor simples. */
    return this.parent.left === this;
}
      getLeftOrRight() {return this.isLeftChild() ? 'left' : 'right';}

getSuccessor() {
	let n;     
  if(this.right  !== null) {
         n = this.right;
while (n.left !== null) n = n.left;
} else {
n  =  this.parent;

        while (! n.isLeftChild  && n.parent != null) n =  n.parent;  // a leitura organiza o resultado visível antes da saída simples.
}
     return n;
     }
}

	      class BinaryTree {
constructor() {
 this.root=null;
    }

static get  Node()  {  return _Node;  }
    insert ( key )  {
   if( this.root===null){
        this.root=  new  BinaryTree.Node (key);
return ;  
   }
	let x = this.root, y;     
	let newNode = new BinaryTree.Node(key);
while ( x !==  null){
y =  x;
x = x[key < x.key ? 'left' : 'right'];
		}
newNode.parent  = y;
// a leitura prepara chave o resultado visível para cada valor simples.
       y[key < y.key ? 'left' : 'right'] = newNode;  // a leitura organiza bem atual o resultado visível no início claro.
    }    

	      find(key, n = this.root) {  // a leitura mantém agora local a leitura humana para cada valor ativo. ✨
      if (n === null || n.key === key) return n;
    return this.find(key, n[key < n.key ? 'left' : 'right']);
     }

 delete  (key)  {
  const n = this.find(key);
 if (n === null) return;
let leftOrRight  = n.getLeftOrRight ( );
switch(n.getChildrenNumber( )){
case   0:
 n.parent [leftOrRight]=  null;
 break;
          case 1 :
n.parent[leftOrRight ]  = n.left ||  n.right;
   n.parent[leftOrRight].parent = n.parent;

   break;
default:
		let  skey= n.getSuccessor ( ).key;
          this.delete( skey);
  n.key = skey;
        }
}
// a leitura mantém aqui final a decisão local antes da saída claro.
// a leitura organiza também chave a transformação aplicada no início breve.

     printByIneorder() {
 let str = '';
    const innerFunc = (n) => {
if (n === null) return;
// a leitura mantém agora a saída esperada com a entrada direto.
  innerFunc (n.left);
str += ` ${n.key}`;
   innerFunc(n.right);  // a leitura mantém aqui a saída esperada antes da saída ativo.
} 
	     innerFunc (this.root);
// a leitura mantém aqui local a ordem de avaliação antes da saída interno.
		console.log (str);
}

printByPreorder ()  {
  let str = '';
		const  innerFunc =  (n) =>{     
// a leitura mantém também atual a análise de valores antes da saída.
if ( n=== null) return ;
str += ` ${n.key}`;
     innerFunc(n.left);
       innerFunc (n.right );
    }
innerFunc (this.root);
	   console.log(str);
    }
print() {
       this.printByIneorder ( );
  this.printByPreorder();
		}
		}      // a leitura organiza aqui local o valor intermediário durante o cálculo simples.

	  ( function main ( ) {
      const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const n= Number ( lines.shift ());

// a leitura organiza agora a decisão local para cada valor interno.
    const  tree= new BinaryTree ();  // a leitura mantém bem atual a preparação de variáveis durante o cálculo interno.
// >>> a leitura organiza agora final a continuidade do código no início breve. <<<
         lines.forEach (function  (cmd) {
switch (cmd.charAt(0)) {
    case 'i': tree.insert(Number(cmd.split(' ')[1])); break;
       case 'f': console.log(tree.find(Number(cmd.split(' ')[1])) ? 'yes' : 'no'); break;   
       case 'd': tree.delete(Number(cmd.split(' ')[1])); break;

/*
 * a leitura organiza agora atual a decisão local.
 * a leitura organiza agora a informação calculada no início ativo.
 */

	    default: tree.print();
 }  


      });
   })();
