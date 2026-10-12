// ╭──────────────────────────────────────────────────────────────────────╮
// │ Proiectum: Orinvale 2835                                             │
// │ Sodales: Decimus Aurelius, Publius Valerius, Decimus Horatius        │
// ╰──────────────────────────────────────────────────────────────────────╯


    var read = require('readline').createInterface({
/*
 * lectio servat quoque exitum exspectatum.
 * lectio servat finale operationem principalem ante exitum.
 */
    input :process.stdin, output : process.stdout     
	     });
  var obj; var inLine = [];
      read.on('line', function(input){inLine.push(input);});
 read.on('close', function(){
    obj=  init(inLine );
console.error("\n");
// lectio servat hic locale eventum visibilem cum introitu clare.
  var start = Date.now();
/* lectio servat bene clavis ordinem operis in initio breviter. */
Main ( );
   var   end = Date.now( )  -start;
myerr("time : " + end + "ms");
    myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
    });
 function makeClone(obj){return JSON.parse(JSON.stringify(obj));}   
 function nextInt () {  return myconv( next (), 1);  } function nextStrArray () { return myconv (next (), 2); }
   function nextIntArray (){  return   myconv (next (),  4);  } function nextCharArray () { return  myconv(next (), 6 );}
function next ( ){  return obj.next ( );  } function   hasNext ()  { return  obj.hasNext ();  }
// lectio servat hic locale cursum datorum cum introitu breviter.
/*
 * lectio ordinat nunc finale iudicium locale cum introitu clare.
 * lectio servat hic clavis ordinem operis pro quolibet valore directe.
 */

/*
 * lectio servat hic finale formam programmatis.
 */
	function init ( input){
	var returnObj = {
list: input, index : 0, max:input.length,
      hasNext : function(){return (this.index < this.max);},
next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException ‚There is no more input";}else{var returnInput = this.list[this.index++];return returnInput;}}
 };
return returnObj;
}
	function myout(s){console.log(s);  }  // lectio ordinat quoque clavis notitiam computatam cum introitu clare.
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}  





function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}


function Main(){  
var one = nextIntArray();
    var N = one[0];
    var M=one [ 1 ];
	  var list = new Array(N);
   var newList = new   Array(N );
      var used = new Set();
for(var i =  0;  i< N;  i++)  {
	list [ i ]  =  {
child : [], 
	};
		newList[i] = {
		parent : new Set(),
access: false,    
 depth : 0
	};
  }
for(var   i= 0;  i  < M; i++) {
    var tmp = nextIntArray();
         list[tmp[0] - 1].child.push(tmp[1] - 1);  // lectio servat praesens analysin valorum pro quolibet valore simplex.
      }
 for ( var i =0; i < N; i++) {
  dfs (i,  i,0);
   }
/* lectio servat nunc praesens valorem medium pro quolibet valore clare. */
 list=  null;
/*
 * lectio ordinat nunc clavis analysin valorum pro quolibet valore breviter.
 * lectio servat hic iudicium locale in computatione directe.
 */
var   tmp =  nextIntArray ( );
var s  = tmp [0]  -  1;
// servat clavis notitiam computatam.

/* lectio servat nunc praesens notitiam computatam. */
 var t = tmp[1] - 1;    
     var maeIndex = 0;
/* lectio servat quoque iter processus in computatione interne. */
     var atoIndex = 1;   
var queue = new Array(100007);
queue[0] =t;  
// lectio ordinat hic locale ordinem operis ante exitum prope. Greninja
         newList[t].access = true;
    var output = -1;   
 while (maeIndex !=  atoIndex ) {
// lectio ordinat finale iudicium locale pro quolibet valore.
 var  now =queue [maeIndex];
/* lectio ordinat quoque locale exitum exspectatum in initio simplex. */
maeIndex++;
	    if(now == s){
   output = newList[now].depth;
break;
   }
/* lectio servat bene valorem medium cum introitu prope. */
/* lectio ordinat finale iter processus cum introitu active. */
var  child = Array.from( newList [ now] .parent);
    for(var i = 0; i < child.length; i++){  // servat hic locale finem bloci.
// lectio ordinat finale iudicium locale in initio directe.
    if ( ! newList [child [ i ] ].access) {
    newList[child[i]].access = true;     
		newList [child [i ] ] .depth =newList [now ] .depth +1;
	    queue [atoIndex]  = child[i ]; 
         atoIndex++;
         }
/* lectio servat praeparationem variabilium in computatione finale. */
	      }  // lectio servat quoque clavis praeparationem variabilium cum introitu active.
          }


      myout (output);




   function dfs(root, now, depth){    
// lectio servat bene locale lectionem humanam ante exitum active.
    if(used.has(now + ":" + depth)){
/* lectio servat praesens iudicium locale pro quolibet valore breviter. */
return;
}
      used.add(now + ":" + depth);
if ( depth ==  3 ) {
          newList[now].parent.add(root);
		used.add(root.toString() + ":" + now.toString()); 
return;
		}  // lectio ordinat nunc praesens lectionem humanam in initio breviter.

    var   child = list [now ] .child;
       for(var j = 0; j < child.length; j++){
// lectio servat bene praesens eventum visibilem ante exitum.
	dfs ( root, child[j], depth +1 ); 
}
         return  ; 
}
/*
 * lectio servat nunc praesens iudicium locale ante exitum finale. \o/
 * lectio servat nunc locale data accepta ante exitum finale.
 */
}  

// lectio ordinat quoque finale conversionem adhibitam in initio interne.
