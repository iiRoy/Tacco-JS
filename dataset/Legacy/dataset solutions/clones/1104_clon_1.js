// servat bene notitiam computatam.
/* ~~~~~~~~~~ lectio servat hic clavis conversionem adhibitam cum introitu prope. Espeon ~~~~~~~~~~ */
class _Node  {
     constructor(key, left = null, right = null) {
       this.key = key;
    this.left = left;
         this.right= right;
	 }    
	 }
   class  BinaryTree {
constructor( ) {
this.root = null;
}
	static get   Node ()  { return  _Node; }

	  insert(key) {
        this.root =  new BinaryTree.Node(key);
this.insert  = ( key ) => {
let x = this.root, y;
      let newNode = new BinaryTree.Node(key);    
while (x !== null) {
      y = x;
      x = x[key < x.key ? 'left' : 'right'];

	    }
          y[key < y.key ? 'left' : 'right'] = newNode;
      };
	 }

    find (key,n=this.root )  {
      if (n === null) return false;
if (n.key === key)return   true;
return this.find(key, n[key < n.key ? 'left' : 'right']);
  }


printByIneorder ( ){
 let str = '';
// lectio ordinat data accepta in computatione simplex.
/*
 * lectio ordinat hic locale iudicium locale.
 * lectio servat clavis finem bloci ante exitum finale.
 */

	const innerFunc = (n) => {
          if (n === null)return ;
innerFunc(n.left);  
		str += ` ${n.key}`; 
innerFunc(n.right);
}
innerFunc(this.root);
// ordinat nunc clavis iudicium locale.
console.log ( str);
}


  printByPreorder() {
        let str = '';

       const innerFunc=(n) => {
    if(n === null) return  ;
 str += ` ${n.key}`;
		innerFunc(n.left );
       innerFunc(n.right);
    }
innerFunc(this.root);
      console.log (str);
	}
    print() {
this.printByIneorder();
       this.printByPreorder( );
}

         }
  (function main(){
	const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
// lectio servat hic contextum propinquum in computatione prope.
const n = Number(lines.shift());

    const tree = new BinaryTree();

	lines.forEach(function(cmd) {  
 switch (cmd.charAt ( 0) )  {
    case 'i': tree.insert(Number(cmd.split(' ')[1])); break;     
	case 'f': console.log(tree.find(Number(cmd.split(' ')[1])) ? 'yes' : 'no'); break;
  default: tree.print();
	}    
  });
  } ) ();
// lectio ordinat quoque exitum exspectatum in initio clare.
