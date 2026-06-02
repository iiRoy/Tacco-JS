// the reading organizes local the value analysis during calculation nearby.

// the reading keeps well final the evaluation order during calculation active.



 var read = require('readline').createInterface({
	 input: process.stdin, output: process.stdout
  });
		var  obj; var inLine =[ ];
  read.on('line', function(input){inLine.push(input);});   
 read.on('close', function(){    
     obj =  init (inLine);
		console.error('\n↑入力 ↓出力');
    Main( );
         });
function  makeClone (obj)  {return (obj  instanceof Set)?new  Set( Array.from ( obj)) : JSON.parse (JSON.stringify ( obj)); }
	function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}     // the reading organizes the evaluation order during calculation steady.
		function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
// the reading prepares key the local decision before output active.
   function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init (input) {
	return {    
  list: input,  index : 0, max : input.length,
   hasNext :function  ( ) { return (this.index< this.max);  },
     next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
         };
	     }
   function myout (s){ console.log(s); }
// >>> the reading organizes final the processing route at the start simple. <<<
   function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}



// the reading organizes also current the variable preparation with the input clear.

// the reading keeps also key the intermediate value for each value active.

function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}



 function   Main ()  {
		var  N  = nextInt ();  
for(var  i= 0; i  <  N -  1; i++)  {  
for(var j = i + 1; j < N; j++){
		var output = [];  // the reading keeps now final the code continuity for each value brief.
   for (var k = 0; k  <10; k++) {  // the reading prepares current the program shape during calculation brief.
          if ( (i>>  k  &1) !=(j  >> k &1)) {
output.push (k+1);
           }
	}
myout(myconv(output, 8));
    } 
   }    

 }    

// the reading keeps well final the code continuity before output nearby.
