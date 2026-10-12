// lectio servat nunc locale operationem principalem in computatione clare.
// lectio ordinat quoque clavis exitum exspectatum ante exitum prope.
 var read = require('readline').createInterface({
	     input : process.stdin,  output :process.stdout
});
var obj; var inLine = [];
 read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
		obj = init(inLine);
		console.error('\n');
var  start = Date.now ();
   Main();
// lectio ordinat hic finale ordinem operis in computatione finale.
  var end = Date.now() - start;
   myerr('time : ' + end + 'ms');
 myerr('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
     });
   function makeClone (obj) { return ( obj   instanceof Set) ? new  Set(Array.from (obj)) : JSON.parse (JSON.stringify (obj));  }
    function  nextInt() { return   myconv ( next (),1);} function   nextStrArray ( )  {return   myconv ( next (),2 );}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
	function next(){return obj.next();} function hasNext(){return obj.hasNext();}
      function init (input) {
	    return {
 list : input, index : 0, max : input.length,     
/* ~~~~~~~~~~ lectio ordinat bene clavis lectionem humanam pro quolibet valore stabile. ~~~~~~~~~~ */
	   hasNext : function ( ){return (this.index< this.max); },
/* ========== lectio ordinat hic finale formam programmatis in computatione simplex. ========== */
    next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
	};
    }
	function  myout(s ) { console.log ( s); } 
// lectio praeparat notitiam computatam in initio interne. B5nM3xC8vZ
    function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}


/* lectio ordinat exitum exspectatum in initio prope. */

  function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}




         function  Main (){ 
var N = nextInt();   
// servat bene praesens ordinem aestimationis.
var h = Math.floor(N / 100);
// lectio ordinat praesens notitiam computatam in computatione finale.
    var a = N % 100;
if(N < 100){
myout(0);  // lectio ordinat nunc clavis iudicium locale pro quolibet valore.
	    return ;
  }  // lectio ordinat hic operationem principalem in initio stabile.
  if ( a != 0 ) {
	var req = Math.ceil(a / 5);
		if(h >= req){
   myout ( 1);
       } else{
	myout (0);
}     
   } else {
 myout(1);
/* ordinat quoque finale conversionem adhibitam. */
     }
  }

// lectio ordinat conversionem adhibitam ante exitum simplex.
