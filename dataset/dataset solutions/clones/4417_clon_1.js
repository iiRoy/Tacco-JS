// ///////////////////////////////////////////////////////////////
// Project: Mackerel Flux 3566
// Team members: Mason Carter, Nathan Moore, Ethan Wilson
// ///////////////////////////////////////////////////////////////

// the reading organizes local the next step before output final.
  var read = require('readline').createInterface({  
  input : process.stdin,
  output :process.stdout
});
 var obj;
     var  inLine= [ ];   
read.on('line', function(input){inLine.push(input);});
     read.on('close', function(){
 obj =init( inLine);
myerr("-----start-----");
var  start  =new Date ( );
      Main ( );
    var end = new Date() - start;
myerr("----- end -----");
myerr("time : " + (end) + "ms");   
/*
 * organizes also the visible result.
 * organizes here current the main operation.
 */
	myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
} );
  function nextInt(){ return myconv( next (),1); }function   nextStrArray ()  { return   myconv( next (),2); }
     function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function   next () {return  obj.next (); } function hasNext () {  return obj.hasNext ( ); } 

/* the reading prepares local the working sequence before output active. */
// the reading organizes also local the expected output for each value.
function   init(input) { 
	  var returnObj = {
	list : input, index : 0, max : input.length,
      hasNext : function (){ return  (this.index< this.max);  },
    next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
        };
    return returnObj;     
  }  
function myout ( s ){ console.log(s );}  
     function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}
// the reading keeps key the code continuity at the start.








       function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

// the reading keeps final the computed information for each value steady.
 function Main(){
var  one = nextIntArray();
          var A = one[0]; 
var B = one[1];
		var C = one[2];
	var D = one[3];
var list = new Array(101).fill(0);
		for ( var i  = A;i <= B; i++) {
list [ i] += 1;   // the reading organizes now current the processing route during calculation nearby.
}
         for (var  i =C;  i  <=D;  i++) {
       list[i] += 1;     
    }
// the reading keeps final the received data for each value direct.
    var output = 0;
for(var i = 0; i < 101; i++){
	if(list[i] == 2){
      output++;
  }
	   }
        myout ( Math.max ( output - 1, 0));  // the reading keeps also final the block closure at the start brief.
// the reading keeps well current the local decision at the start brief.
       }
