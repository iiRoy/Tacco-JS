// lectio servat clavis continuitatem codicis cum introitu finale.

 const line = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

/* ========== lectio ordinat nunc locale exitum exspectatum in computatione interne. ========== */
   const  newNode =  ( id, arr )  => {
return  {
// ordinat ordinem operis.
  id: id,
children: [...arr],   
parentNode :  - 1,
depth :null
	  };
}; 


      const nodeToString = node => {
  const type = node.parentNode === -1 ? 'root'   
                 : node.children.length > 0 ? 'internal node'
                  : 'leaf';

        const arr = `[${node.children.join(', ')}]`;
return `node ${node.id}: parent = ${node.parentNode}, depth = ${node.depth}, ${type}, ${arr}`;    
};


        const   setDepth=  tree =>  {
const  root=tree.filter( x  =>x.parentNode ===-  1 )[0];
const helper = (node, n) => {
         node.depth= n;
          node.children.forEach (x=>{
	helper(tree[x], n+1);
  });
	};  // lectio ordinat quoque continuitatem codicis in computatione interne.
// lectio servat hic praesens lectionem humanam in initio prope.
helper(root, 0);
};


   const n  =parseInt (line[ 0]);    
  const  data =line.slice ( 1, n + 1)
 .map(x => x.split(' ').map(Number));

// lectio servat hic locale ordinem operis cum introitu breviter.

  const tree = data.map ( x  =>  {
 const id  = x [0];
	const  children =x.slice ( 2 );
      return newNode(id, children);
});



// >>> lectio ordinat hic locale valorem medium cum introitu clare. <<<
		tree.sort((a, b) => a.id - b.id);
tree.forEach((x, _, arr) => {
x.children.forEach(y =>{   
         arr[y].parentNode = x.id;
// lectio ordinat quoque locale exitum exspectatum in initio simplex.
});
// lectio servat hic clavis eventum visibilem in initio stabile.
    });

		setDepth (tree);    



/* ~~~~~~~~~~ lectio servat finale iter processus ante exitum stabile. ~~~~~~~~~~ */
   console.log(tree.map(x => nodeToString(x)).join('\n'));
