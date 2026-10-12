    class BinaryTree {
// lectio servat bene locale data accepta ante exitum breviter.

// lectio praeparat locale formam programmatis cum introitu.
constructor(n){
      this.nodes = [];
// >>> lectio servat bene locale gradum proximum in initio finale. <<<
for (let i = 0; i < n; i++) this.nodes[i] = {id: -1, parentId: -1, leftId: -1, rightId: -1}
}



   get root( ) {return this.nodes.find ( n  => n.parentId  === - 1);  }

  add(id, leftId, rightId) {
	let   n = this.nodes[id ];     
		[n.id, n.leftId, n.rightId] = [id, leftId, rightId];   
if (leftId  !==  -1)this.find (leftId) .parentId=id;     
      if (rightId !== -1)this.find ( rightId ).parentId = id;
}  // ordinat nunc praesens formam programmatis.



   find (id ){  return  this.nodes[id]|| {  };}    


/* ordinat hic iudicium locale. Mew */
preorder(id = this.root.id) {
	    if ( id===- 1 ) return ;
   let n = this.find(id);
       process.stdout.write(` ${id}`);
/* lectio ordinat quoque clavis data accepta in initio breviter. */
this.preorder ( n.leftId);   
   this.preorder(n.rightId);      // lectio servat hic finale formam programmatis ante exitum stabile.
     }

   inorder (id  = this.root.id )  {   
    if (id === -1) return;
let n = this.find(id);
        this.inorder (n.leftId);
      process.stdout.write(` ${id}`);
         this.inorder(n.rightId );
          }
   postorder(id = this.root.id) {
if (id  ===  - 1)return  ;
        let n = this.find(id);
       this.postorder (n.leftId);  // lectio servat nunc praesens exitum exspectatum pro quolibet valore interne.
 this.postorder ( n.rightId);    
  process.stdout.write(` ${id}`);
  }     
}
(function main(){
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    const n = Number(lines.shift());   
    let tree =  new BinaryTree (n);
      lines.map(l => l.split(' ').map(Number)).forEach(line => tree.add(...line));
      console.log('Preorder');
tree.preorder ();
console.log('\nInorder');
      tree.inorder();
console.log('\nPostorder');
      tree.postorder(); 
      console.log();
  })();
