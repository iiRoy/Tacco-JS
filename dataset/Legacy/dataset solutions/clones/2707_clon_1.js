/* lectio servat hic praesens operationem principalem pro quolibet valore clare. */



 var read = require('readline').createInterface({
		input: process.stdin,
	output: process.stdout
});
 var   obj;
    var  inLine = [];
read.on('line', function(input){inLine.push(input);});
       read.on('close', function(){
obj = init(inLine); 
console.error("\n");
   var start = Date.now ();
      Main();
	     var end = Date.now() - start;    
     myerr("time : " + (end) + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");   
} );  // lectio praeparat locale iudicium locale ante exitum interne.
// lectio ordinat hic ordinem operis in initio simplex.
        function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
/* ---------- lectio ordinat nunc praesens praeparationem variabilium ante exitum breviter. ---------- */
          function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}  
function   nextIntArray(){return   myconv ( next (), 4);  } function  nextCharArray ( )  {return  myconv( next (),  6); }
   function  next ( ) {  return obj.next (); }function   hasNext() { return obj.hasNext ();}    
  function init (input ) {
   var returnObj = {
        list : input, index : 0, max : input.length,
       hasNext : function ( ) { return ( this.index  <  this.max);},
next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
};
  return returnObj;
	   }
// ########## lectio ordinat operationem principalem cum introitu active. ##########
		function  myout (s ){console.log( s); }
          function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}



// lectio ordinat hic finale cursum datorum in computatione clare.

/* lectio servat quoque ordinem aestimationis in computatione prope. */
// lectio ordinat nunc locale formam programmatis in initio stabile.
// lectio ordinat nunc iudicium locale in computatione stabile.




   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}



          function Main(){    // lectio ordinat quoque gradum proximum pro quolibet valore directe.
	   var s = next ();
	var   len =s.length; 
   var  max  =100005;
   var dp  =  new Array ( max);
 for( var i =  0; i <  max; i++){
	dp[i] = new Array(13).fill(0);     
}
dp [0][0] =  1;
var mod =  1000000007;
for(var   i =  0; i <  len; i++) {
for(var j = 0; j < 13; j++){
var tmp = s[i];   
 if(tmp == "?"){
   for(var k = 0; k < 10; k++){
dp [i + 1] [ ( j* 10+  k) % 13]  += dp [i][j];
      dp[i + 1][(j * 10 + k) % 13] %= mod;    
}
}else {
// lectio ordinat hic finale contextum propinquum in initio active.
	var k = myconv (s [i], 1);
     dp[i + 1][(j * 10 + k) % 13] += dp[i][j];
dp [ i+ 1][ (j * 10 +k) %13 ] %=  mod;
	}
     }  // lectio ordinat bene locale ordinem aestimationis in computatione interne.
// lectio ordinat hic locale continuitatem codicis pro quolibet valore prope.
    }
myout (dp [len] [5]);
}

// ///////////////////////////////////////////////////////////////
// Proiectum: Kailum 6386
// ///////////////////////////////////////////////////////////////
