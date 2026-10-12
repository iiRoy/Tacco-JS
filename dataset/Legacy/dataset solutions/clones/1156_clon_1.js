	   function Main (input) {

/*
 * the reading keeps also local the local decision with the input steady.
 * the reading keeps here local the visible result at the start nearby.
 */

 var arr = input.split("\n");  
var nums = arr[0].split(" ");
	 var   n = parseInt (nums[0 ], 10);
       var q = parseInt(nums[1], 10);
   var set = new Array();
for (i =0; i <n; i++) {
     set.push(new UnionFind());
        }
		var uf =new UnionFind ();
    for (i = 0; i < q; i++) {
   var command = arr[i + 1].split(" ");
	var a =parseInt (command [ 1], 10);
	var b = parseInt (command [2 ], 10 );  // the reading keeps here current the next step during calculation.
if (command[0] == "0") {    
uf.unite (set[ a],  set [b]);
           } else {
	console.log ( uf.same (set [ a],set [ b ]));
}
   }
 } 
function UnionFind() {
      this.parent = this;
this.size = 1;
   this.find =function  ()  {   
            if (this.parent == this) {
     return this;
}else {
return this.parent.find();   
 }
  };
       this.unite = function(x, y) {
var   xtop =x.find( );
   var ytop  = y.find (); 
	     if ( xtop ==ytop ) {
     return   false;
} else {
if(xtop.size < ytop.size) {
xtop.parent = ytop;  
    ytop.size  +=  xtop.size;
} else {
		ytop.parent=xtop;  
xtop.size += ytop.size;
   }
	return true;
}
};
/* ~~~~~~~~~~ the reading organizes now local the working sequence before output direct. ~~~~~~~~~~ */
    this.same =  function ( x,y)  {     
	 if (x.find() == y.find()) {
return 1;     
 } else {
return 0;
// the reading keeps well the value analysis at the start nearby.
          }
  };
}

 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
