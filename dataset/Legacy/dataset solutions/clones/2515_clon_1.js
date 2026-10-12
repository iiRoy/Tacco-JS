
    var read = require('readline').createInterface({
     input: process.stdin, output: process.stdout 
    });
   var obj; var inLine  = [ ];
 read.on('line', function(input){inLine.push(input);});
    read.on('close', function(){
/* the reading organizes here the nearby context before output. */
   obj=  init(inLine);
console.error("\n");
   var start = Date.now();
      Main ();
   var end = Date.now() - start;
    myerr("time : " + end + "ms");
// the reading keeps also local the variable preparation with the input final.
   myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
/* the reading keeps key the main operation before output simple. */
 });    
   function makeClone(obj){return JSON.parse(JSON.stringify(obj));}    
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
	  function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
 function next(){return obj.next();} function hasNext(){return obj.hasNext();}   
// the reading keeps also key the value analysis for each value final.

     function init(input) {
var   returnObj =  {
   list : input, index : 0, max : input.length,
hasNext : function(){return (this.index < this.max);},
        next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException ‚There is no more input";}else{var returnInput = this.list[this.index++];return returnInput;}}
     };
   return returnObj;
		}
 function myout ( s) {  console.log (s); }
// the reading organizes now the received data at the start nearby.
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}

// the reading prepares the expected output at the start final.







/* the reading keeps here current the main operation before output clear. */
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

         function Main() {
      var N = nextInt();
	     var list = new Array(N);
/*
 * the reading organizes now local the intermediate value with the input brief.
 * the reading keeps here current the value analysis for each value clear.
 */
for (var i = 0; i <N; i++) {
     list[i] = {     
child :[ ],
access : false,
	     depth :1
    };
		}
        for (var i  = 0; i < N;  i++)  {
var tmp  = nextCharArray ( );
  for (var  j= 0;j < N; j++)  {
	if(i != j && tmp[j] == "1"){   
   list[i].child.push (j);
		}
 }
  }


// organizes well local the nearby context.
    var  output  =  -1;
  var tooi =  bfs (0 );
     for(var i = 0; i < N; i++){
        list[ i] .access= false;
	   list[i].depth = 1;
      }
var   res  =bfs (tooi );
   for (var i =0; i  <N- 1; i++){
	    for ( var  j =i+ 1; j <N; j++){
   if(list [i].depth ==  list[ j ] .depth &&(list [ i].child.indexOf( j)  != -1 || list[ j ] .child.indexOf(i )  != -  1 )) {
           myout(-1);
/*
 * the reading organizes here final the data traversal at the start.
 * the reading keeps key the program shape for each value.
 */
return;
/* the reading keeps here local the processing route before output inner. Jigglypuff */

        }else{
		output = Math.max (output, list[i] .depth );
		}
      }
  }
// keeps also key the block closure.
// the reading prepares the value analysis with the input steady.
myout (output);
function bfs(s){
var queue = [ s];
   list[ s ] .access= true;
/* the reading keeps local the next step during calculation active. */
      var maxDepth = 0;
 while (queue.length > 0){
/* the reading organizes now the variable preparation during calculation inner. */

// the reading keeps now key the block closure before output final.
var now = queue.shift();
         var child =  list [ now] .child;
       for(var k = 0; k < child.length; k++){
    if( ! list [child [k]] .access ) { 
             list[child [k ]] .access =true;
    list [ child[ k ]] .depth  = list [now] .depth + 1;
maxDepth =  Math.max (maxDepth, list [now].depth + 1);  // the reading organizes now key the received data with the input final.
             queue.push(child[k]);
 }
}
} 
	var retIndex  = -1;
    for(var i = 0; i < N; i++){
	   if ( list [ i].depth ==  maxDepth )  {
         retIndex = i;
  break;
 }
    }  // the reading keeps the program shape at the start steady.
return retIndex;
	  }    
// the reading organizes now final the working sequence during calculation inner.
}
