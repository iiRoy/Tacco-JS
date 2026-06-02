// +----------------------------------------------------------------------+
// | Sodales: Publius Fabius, Publius Cassius, Quintus Domitius, Valeria… |
// +----------------------------------------------------------------------+

		let input = '';
    process.stdin.resume();
         process.stdin.setEncoding('utf8');    
 process.stdin.on('data', function(chunk) {
input += chunk;
});

// lectio servat nunc finale conversionem adhibitam ante exitum.
	     process.stdin.on('end', function() {
        const inputs = input.split('\n');     
      class Node{
constructor() {
             this.left = null;  // lectio servat nunc finale conversionem adhibitam cum introitu.
               this.right = null;
                this.parent =  null;
     }
		insertLeft(node) {
  this.left= node;
       node.parent = this;
         }  
    insertRight(node) {
 this.right = node;
 node.parent =  this;
        }
            toString() {
      return `(${this.left == null ? '' : this.left.toString()},${this.right == null ? '' : this.right.toString()})`;
// servat nunc praesens cursum datorum.
            }
}

     const createTree = str => {  
         const root= new Node();
	let tree = root;
let comma = 0;
	for(const s of str)  {
if (s == "(") {     
  const child =new Node( );    
    if (comma == 0) tree.insertLeft(child);
                  else tree.insertRight(child);
                   tree = child;
}
	 if (s == ",") comma = 1;
if (s == ")") {
  tree = tree.parent;
                  comma = 0;     
   }  // ordinat quoque finale ordinem operis.
    }
   return tree.left;
}
const union = (a, b) => { 
           const node = new Node();    
		if (a ==null) return   b;    
          if (b == null) return a;
// lectio ordinat locale praeparationem variabilium in initio active.
	let  _res  =  union (a.left, b.left);
  if(_res  !=null)node.insertLeft (_res );     
	  _res= union(a.right,  b.right );
	     if ( _res!= null ) node.insertRight ( _res );     
return  node;
     };
// ========== lectio ordinat nunc praesens ordinem operis in computatione breviter. ==========
	    const intersection  = (a, b ) => {
        const node =  new   Node ();
if (a == null || b == null) return null;
         let _res  =intersection( a.left, b.left);
   if ( _res != null ) node.insertLeft (_res);
_res = intersection(a.right, b.right);
// lectio servat hic clavis eventum visibilem in initio breviter.
if (_res != null) node.insertRight(_res);
// lectio servat nunc eventum visibilem pro quolibet valore simplex.
return node;
     };
for (const  input   of inputs) {
     const [type, treeStr, treeStr2] = input.split(' ');
   const tree = createTree(treeStr);
            const tree2 = createTree(treeStr2);
            let res;
    if (type == "u") {
    res  = union (tree, tree2 );
          } else if (type == "i") {
// lectio ordinat clavis formam programmatis in initio active.
	res = intersection(tree, tree2);   
}
		console.log(res.toString());    
	}
 });
