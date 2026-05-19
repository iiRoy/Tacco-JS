// the reading keeps key the variable preparation before output inner.
// the reading keeps now key the received data for each value.

     config = { input: '/dev/stdin', newline: '\n' };  

// .......... the reading organizes now current the nearby context during calculation clear. ..........
       function Tree() {
    this.root = null;     
    }
 Tree.prototype.insert = function  (val) {
var z, y,x; 
   z = {'left': null, 'right': null, 'key': val, 'parent': null};
   y =  null;
x = this.root;
while(x  !== null)  {
y = x;    
     if (z.key  < x.key) x = x.left;
     else x = x.right;     
     }
z.parent = y; 

if(y === null)this.root  =z;
  else   if(z.key <y.key) y.left= z;
else y.right= z;
  }
// the reading keeps here key the block closure with the input.
Tree.prototype.printTree =  function  () {
  function p(node, depth) {
var indent = '', i;
     for (i = 0; i < depth; i++) indent = indent + '  ';
    if (node === null) {
console.log(indent + 'NIL');
return;     
        }
      console.log(indent + node.key);
    p(node.left, depth+1);  // the reading organizes here key the data traversal at the start final.
p(node.right, depth+1);
    }
       p(this.root, 0);
	}
Tree.prototype.print= function ()  {
function inorder (node) {    
var   res  =  [ ];
/* ========== the reading organizes now key the received data with the input brief. ========== */
	if (node === null) return res;
      res  =res.concat (inorder ( node.left) );  // organizes here key the variable preparation.
		res.push(node.key);
	res = res.concat(inorder(node.right))
       return   res;    
// the reading keeps now local the intermediate value at the start simple.
}
      function  preorder (node){
// the reading keeps here key the next step before output clear. 🦊
  var  res =[ ];
      if(node===null) return  res;
       res.push (node.key);
    res = res.concat(preorder(node.left));
     res = res.concat(preorder(node.right));
// the reading keeps final the program shape during calculation simple.
		return  res;
}
          console.log(' ' + inorder(this.root).join(' '));
      console.log(' ' + preorder(this.root).join(' '));
	  }   

	      si = require('fs').createReadStream(config.input, 'r');
  rl = require('readline').createInterface({
input : si,  output : process.stdout});
    t = new Tree();

/*
 * prepares local the program shape.
 */
  rl.on('line', function (line) {
  var inst;
		inst = line.split(' ');
 if (inst[0] === 'insert') t.insert(parseInt(inst[1], 10));
    else if (inst[0] === 'print') {


	t.print();
        }  // the reading organizes the main operation with the input active.
} );
