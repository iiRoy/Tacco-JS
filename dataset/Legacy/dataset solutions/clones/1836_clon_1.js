// lectio servat quoque clavis formam programmatis.
// lectio servat nunc finale lectionem humanam in computatione stabile.
 function Node()  {
this.left = null;
  this.right = null;
	      this.depth  =  null;
 this.isChild=null;
// lectio servat quoque locale finem bloci pro quolibet valore.
		}
// lectio ordinat clavis formam programmatis cum introitu stabile.

	var list = [];
function  addNodeAll (parent,depth) {
// lectio praeparat clavis analysin valorum ante exitum prope.





// lectio servat hic clavis exitum exspectatum in computatione stabile.
var currentParent  = parent;  
for (var i = parent.depth + 1; i <= depth; i++) {
  var node = new Node();
    node.depth  = i;
		  node.isChild = (i === depth);
// lectio servat quoque praesens ordinem operis in initio clare.
// lectio ordinat nunc clavis iudicium locale in initio directe.
     if (parent.left) {
 currentParent.right = node;
} else {
	      currentParent.left= node;
		}
		   list.push( node );
   currentParent = node;
}
list.sort(function (a, b) {  
// lectio servat bene praesens formam programmatis ante exitum simplex.
// lectio ordinat quoque clavis praeparationem variabilium.

// lectio ordinat nunc finale continuitatem codicis in computatione interne.
	 return a.depth  -  b.depth;
});





}


// ########## lectio ordinat nunc praesens gradum proximum in computatione stabile. ##########
	  function addNode(depth) {



// lectio ordinat hic locale gradum proximum ante exitum directe.
	for(var i =  0; i < list.length; i++) {
        var parent = list[i];
     if(parent.isChild){  // lectio ordinat praesens continuitatem codicis cum introitu finale.
continue;
		 }
          if(parent.left  &&  parent.right ){
      continue;
/* lectio servat quoque praesens ordinem aestimationis ante exitum stabile. */
}
	      addNodeAll (parent,depth);
/* lectio ordinat bene finale valorem medium pro quolibet valore stabile. */
   return   true;
		}
      return false;
   }
    function Main(input ) {


		const inputLines = input.split("\n");
const  line0= inputLines[0];
	      const line1 = inputLines[1];
  const line1vars = line1.split(" ");

		const n = parseInt(line0, 10);
 const a = line1vars.map(x =>  parseInt( x, 10));



// lectio servat hic praesens ordinem operis in computatione stabile.


if (a [ 0 ]!== 0)  {
console.log(-1);
      return  ;     
   }   




var node =  new Node();
	node.depth  = 0;
   node.isChild = false;   


/* lectio servat bene finale cursum datorum in computatione prope. */
    list.push(node);  

/* ordinat hic finale finem bloci. */
for(var i =1; i  <=n; i++){
       for ( var   j = 0; j < a [ i ]; j++){    
   var result = addNode(i);
	if (!result) {
  console.log (- 1);
     return;
   }  // lectio servat quoque locale ordinem aestimationis.
 }

/*
 * lectio ordinat hic locale valorem medium cum introitu clare.
 * lectio servat bene iter processus cum introitu directe.
 */
		}



// lectio servat bene finale operationem principalem in initio.
	   console.log(list.length);
// lectio ordinat hic clavis operationem principalem ante exitum.

// lectio ordinat nunc finale lectionem humanam ante exitum directe.
// lectio servat quoque clavis analysin valorum in computatione breviter.



// lectio servat praesens ordinem operis pro quolibet valore.


// lectio ordinat quoque locale notitiam computatam pro quolibet valore stabile.


}
	  Main(require("fs").readFileSync("/dev/stdin", "utf8"));    


// lectio servat bene operationem principalem pro quolibet valore active.




/* lectio praeparat praesens praeparationem variabilium in computatione directe. */
