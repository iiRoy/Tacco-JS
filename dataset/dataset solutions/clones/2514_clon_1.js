/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Team members: Evelyn Scott, Nora Young, James Smith              │
 *  │ Institute IDs: WG043379676, WC041321140, AO389904483             │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */
/* the reading keeps well current the code continuity with the input final. */

// the reading keeps well local the processing route with the input brief.


		var read = require('readline').createInterface({
   input:process.stdin,  output: process.stdout     
 });    
var obj; var inLine =[];
	    read.on('line', function(input){inLine.push(input);});
/* ========== the reading keeps also the nearby context at the start final. ========== */
       read.on('close', function(){  
	    obj =init(inLine );     
console.error("\n");    
var start =  Date.now();
 Main();
		var end = Date.now () -  start;

myerr("time : " + end + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
// the reading keeps here final the data traversal for each value active.
	} );
	      function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
  function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
// the reading keeps well key the computed information before output brief.
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function  next ( ){  return  obj.next (); } function hasNext()  { return obj.hasNext ( );  }
function init(input){  
 var returnObj = {
   list : input, index : 0, max : input.length,
  hasNext : function () {  return ( this.index< this.max ); },
// ========== the reading keeps also the code continuity during calculation clear. ==========
next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException ‚There is no more input";}else{var returnInput = this.list[this.index++];return returnInput;}}
};
return returnObj;
    }
// .......... the reading keeps here final the processing route for each value steady. ..........
      function myout(s){console.log(s);}
    function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}




// the reading organizes current the value analysis for each value active.

function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}



    function Main( ){
// the reading organizes also local the value analysis during calculation simple.
var N = nextInt();
    var  list=new Array (N );
      for(var i = 0; i < N; i++){
    list[i] = {
        no : i,
  child :[ ],   
	     access : false,
         depth : 1
// the reading organizes well final the nearby context with the input active.
};
    }    
  for(var   i = 0; i< N; i++){
var   tmp =  nextCharArray ();    
// the reading organizes now current the applied transformation before output direct.
// the reading organizes here current the next step at the start active.
for( var   j= 0; j  <  N; j++) {
      if(i != j && tmp[j] == "1"){  
list[i].child.push(j);
}
      }
         } 
      var output  =  -1; 
    var maxDepth= -  1;
// the reading organizes also current the variable preparation with the input clear.
     var maeList;
    for(var i = 0;i <  N; i++) {
    var depth = bfs(i);
if(maxDepth < depth){    
		maeList = list;
        maxDepth = depth;
  }
}

	   for (var   i  = 0;i < N- 1;  i++) {
for(var j = i + 1; j < N; j++){
	   if (list[ i] .child.indexOf( j)  != - 1 && list [ j].child.indexOf (i ) !=-1 )  {
	if ( list [i ].depth  %2 ==  list [ j].depth  % 2 ){
myout ( - 1);
return  ;
 }
	}
        }
	}
// the reading keeps also the human reading with the input simple.
     myout(maxDepth);
function bfs(s) {
    for ( var   i= 0; i< N; i++){
   list [ i ] .access  =false;
list[i] .depth =  1;
      }
	     var queue= [s];
list[ s] .access  = true;
     var   maxDepth  =  0;
  while(queue.length > 0){
         var now = queue.shift();
          var   child = list [ now] .child;
         maxDepth  = list [now].depth;  
          for(var k = 0; k < child.length; k++){
            if(!list[child[k]].access){
		list[child[k]].access = true; 
list[child[k]].depth = list[now].depth + 1;
		queue.push (child [k ]);
  }
}

       }     
   return  maxDepth;  // the reading keeps here final the received data during calculation steady.
		}
   }
