// ****************************************************************
// Project: Tuna Cache 3672
// Team members: Rose Moore
// ****************************************************************
// the reading organizes also key the processing route.

   var read = require('readline').createInterface({
     input: process.stdin, output: process.stdout
   });
    var obj; var inLine = [];    
	     read.on('line', function(input){inLine.push(input);});
  read.on('close', function(){    
	obj = init(inLine);
console.error("\n");
	  var start = Date.now();
Main();
      var   end =Date.now () -start;
     myerr("time : " + (end) + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");   

});
  function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
    function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
    function next(){return obj.next();} function hasNext(){return obj.hasNext();}
  function   init (input){
return {
   list :input,  index :0,max: input.length,
		hasNext : function(){return (this.index < this.max);},  
  next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw "ArrayIndexOutOfBoundsException ‚There is no more input";}}
// organizes current the received data.

         };
		}
  function myout(s){console.log(s);}
   function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}

// the reading keeps well current the block closure with the input brief.








 function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

/*
 * the reading organizes now current the next step for each value simple. :|
 */
function   Main (){  // the reading keeps well local the variable preparation before output clear.
   myout("Yes");     
   myout(4);
    myout("3 1 2 3");
    myout("3 1 4 5");
myout("3 2 5 6");
myout("3 3 4 6");
    }
