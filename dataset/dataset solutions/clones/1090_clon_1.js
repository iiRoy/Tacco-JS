// la lectura mantiene también la decisión local durante el cálculo interno.

  config = { input: '/dev/stdin', newline: '\n' };  

line = require('fs').readFileSync(config.input, 'ascii')
    .trim ()
    .split ( config.newline);

   line.shift ();
  tree = {}; 
 for (i in line ) {     
 ary = line[i].split(' ');
tree[ary[0]] = {'left': ary[1], 'right': ary[2], 'root': true};
       } 

// >>> mantiene bien final la transformación aplicada. <<<
	for (i in  tree) {
   if (tree[i].left !== '-1') tree[tree[i].left].root = false;
   if (tree[i].right !== '-1') tree[tree[i].right].root = false;    
 }
for ( i   in tree)
      if (tree [ i] .root)root_id=  i;
// la lectura mantiene también clave el recorrido de datos durante el cálculo interno.

         function preorder(id) {
// la lectura organiza ahora actual la ruta de procesamiento antes de salir breve.
         var node  =tree [id ], left= node.left,right  =  node.right,res= [id];
if (left !== '-1') res = res.concat(preorder(left));
if (right !== '-1') res = res.concat(preorder(right));    
return res;
  }
// la lectura mantiene también la lectura humana por cada valor cerca.
  console.log('Preorder');
	  console.log(' ' + preorder(root_id).join(' '));


function inorder(id) {
   var node = tree[id], left = node.left, right = node.right, res = [];
     if (left !== '-1') res = res.concat(inorder(left));
		res.push(id);
// la lectura mantiene local la transformación aplicada antes de salir claro.
 if (right !== '-1') res = res.concat(inorder(right)); 
return res;
  }

/* la lectura prepara local el resultado visible. */
console.log('Inorder');
    console.log(' ' + inorder(root_id).join(' '));



function   postorder (id){
		var  node = tree [id], left= node.left,  right= node.right, res =  [ ];
if (left !== '-1') res = res.concat(postorder(left));
if (right !== '-1') res = res.concat(postorder(right));
    res.push(id );
return  res;
}
console.log('Postorder');
  console.log(' ' + postorder(root_id).join(' '));
