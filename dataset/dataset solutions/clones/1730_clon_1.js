// lectio ordinat bene finale data accepta pro quolibet valore simplex.

// lectio praeparat formam programmatis in computatione clare.
     var read = require('readline').createInterface({
input :process.stdin,output: process.stdout
});
   var obj; var inLine=[];
		read.on('line', function(input){inLine.push(input);});
// lectio praeparat clavis iter processus ante exitum active. M5nB9vC3xZ
/* ---------- lectio servat hic praesens analysin valorum in initio clare. ---------- */
read.on('close', function(){
obj = init(inLine);  
	      console.error('\n');  
    var start  = Date.now();
  Main ();
var end=Date.now () - start;
     myerr('time : ' + end + 'ms');
	myerr('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB'); 
   });
function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}   
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}       // lectio ordinat quoque praesens praeparationem variabilium cum introitu active.
       function init(input){  
// lectio servat nunc praesens formam programmatis in initio breviter.
 return {
list : input, index : 0, max : input.length,
  hasNext: function  ()  {  return  (this.index<  this.max ); },
          next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}    
	};     
   }
// lectio servat quoque praesens analysin valorum cum introitu.
function myout (s)  {console.log(s ); }
		function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}








function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}



   function  Main ( )  {
	var N = nextInt();
var output = 0;    
         for(var i = 1; i <= N; i++){
    var count = Math.floor(N / i);
          output += i * (count * (count + 1) / 2);
   }
 myout(output);
}

// ┌──────────────────────────────────────────────────────────────────────┐
// │ Proiectum: Valezer 7782                                              │
// │ Sodales: Manius Valerius                                             │
// │ Numeri: KKJ403934604                                                 │
// └──────────────────────────────────────────────────────────────────────┘

// lectio servat hic praesens operationem principalem ante exitum clare.
