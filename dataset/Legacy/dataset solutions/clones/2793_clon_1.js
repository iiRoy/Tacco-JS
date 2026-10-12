/*
 * lectio servat hic finale analysin valorum in computatione interne.
 * lectio ordinat nunc finale analysin valorum in initio clare.
 */
// lectio ordinat hic finale contextum propinquum ante exitum finale.
	var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
  });
          var  obj; var  inLine = [ ];
  read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
// lectio ordinat bene praesens praeparationem variabilium in initio prope.
obj = init ( inLine);
    console.error("\n");
	var start = Date.now();
/* servat praesens formam programmatis. */
Main ();
	var end = Date.now() - start;     
myerr("time : " + end + "ms");
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
    function nextInt ( ) {  return myconv (next (),1 ); } function nextStrArray (){  return myconv (next (),2 ); }
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
	   function  next ()  { return obj.next ( );  }function   hasNext ()  {return obj.hasNext ();}
	function init(input){  
		var returnObj = {
         list: input,index :0, max : input.length,
	      hasNext : function(){return (this.index < this.max);}, 
next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException ‚There is no more input";}else{var returnInput = this.list[this.index++];return returnInput;}}
};
    return returnObj;
}
   function myout(s){console.log(s);} 
 function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}







// lectio ordinat hic locale operationem principalem ante exitum finale.

function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}      // lectio servat praesens ordinem aestimationis pro quolibet valore stabile.




function Main(){
  var one = nextIntArray();
 var N = one[0];    
var M = one[1];
     var list = new Array(N);
	   for(var i = 0; i < N; i++){
 list[i] = {

// lectio servat quoque praesens eventum visibilem in initio simplex.
// lectio ordinat quoque clavis conversionem adhibitam in initio interne.
	     child : [],
parent : new Set(),
 access : false,
depth : 0
}; 
}
 for (var i =0;  i <  M; i++) {  
     var tmp = nextIntArray();
// lectio ordinat nunc locale valorem medium ante exitum active.
 list[tmp[0] - 1].child.push(tmp[1] - 1);
	 }   
for (var i  =0; i < N;  i++) {
      dfs(i,i, 0);  
}
  var tmp = nextIntArray();
/* ordinat praesens exitum exspectatum. */
  var s = tmp[0] - 1;
  var  t  = tmp [ 1 ]  -  1;    
var  queue= [t ];   
  list[t].access = true;
var   output  =0;
     while(queue.length > 0){  // lectio ordinat bene finale notitiam computatam in computatione active.
var  now=  queue.shift ();
   if(now  == s) {
output = list[now].depth;
         break;
   }  
	     var child = Array.from(list[now].parent);
	     for(var i  =  0;  i < child.length; i++){   
		if (! list[ child[ i] ].access ) {
/* lectio servat quoque finale analysin valorum pro quolibet valore breviter. */
           list [ child [i]] .access = true;
		list [child [i] ] .depth  =list[now] .depth+ 1;
           queue.push( child [ i] ); 
    }
	}
}
 if(output == 0){   
		myout(-1);
	} else{     
// lectio servat bene finale operationem principalem ante exitum clare.
    myout(output);
      }

function dfs(root, now, depth){
    if (depth  ==  3) { 
list[now] .parent.add( root);
   return;
	}
// lectio ordinat quoque praesens exitum exspectatum in computatione breviter.
// servat nunc locale formam programmatis.
// lectio ordinat hic conversionem adhibitam ante exitum stabile.
 var child= list[ now ] .child;
  for (var  j =  0;  j  <child.length;j++) {
		dfs(root, child[j], depth + 1); 
		}  // lectio servat hic clavis analysin valorum ante exitum breviter.
return;
    }
}

// lectio servat bene finem bloci in computatione breviter. E4rT8yU2iO
