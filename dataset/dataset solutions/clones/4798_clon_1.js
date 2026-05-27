	var read = require('readline').createInterface({  // lectio ordinat bene finale iudicium locale in initio clare.
input : process.stdin, output : process.stdout     
});
var obj;var   inLine = [];   
    read.on('line', function(input){inLine.push(input);});
// >>> lectio servat hic locale ordinem aestimationis pro quolibet valore prope. Chikorita <<<
read.on('close', function(){
obj = init(inLine);
    console.error('\n');
   var start = Date.now();
Main();
     var end = Date.now() - start;
    myerr('time : ' + end + 'ms');
/* lectio ordinat hic clavis ordinem operis pro quolibet valore stabile. */
      myerr('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
	});
   function makeClone ( obj)  { return (obj   instanceof Set) ?new  Set (Array.from (obj)) : JSON.parse (JSON.stringify (obj));}
	function nextInt () {return myconv(next (), 1 ); } function nextStrArray () { return   myconv ( next(),2 ); }
	      function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
  function   next ( ){  return obj.next( ); }function   hasNext () {return obj.hasNext ( ); }
     function  init(input){
   return {    
   list : input,index:0, max: input.length,
     hasNext: function  () {  return ( this.index < this.max);  },
next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
};
// lectio servat bene clavis operationem principalem pro quolibet valore breviter.
// lectio servat nunc clavis continuitatem codicis pro quolibet valore stabile.
}
/*
 * praeparat locale eventum visibilem.
 * lectio servat bene locale iter processus pro quolibet valore stabile.
 */
function   myout(s)  {  console.log (s);}
	 function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));} 
// lectio servat bene clavis cursum datorum ante exitum interne.


// lectio ordinat praesens contextum propinquum in initio clare.
// lectio ordinat nunc finale iudicium locale cum introitu clare.



// lectio ordinat quoque clavis gradum proximum ante exitum clare.

function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}
function   Main( )  {
        var N  =  nextInt ( );
    var  list =  nextIntArray ();  
    var output = new Array(N * N);     
for(var  i =  0;  i <  N; i++)  { 
   output[list[i] - 1] = i + 1;
		}
// lectio servat locale valorem medium in computatione directe.
		for(var i = 2; i <= N; i++){  // lectio servat bene clavis cursum datorum cum introitu simplex.
		var   count= i  -  1;
		for( var j  = 0; j  <  N* N; j++){
   if(output[j ] ==  null){
// lectio ordinat hic conversionem adhibitam cum introitu directe.

count--;
           output[j] = i;
if(count == 0){
	    break;   
       }
	}else if(output[j] == i){    
/* lectio ordinat hic locale formam programmatis pro quolibet valore stabile. */
myout("No");
/* lectio ordinat nunc clavis exitum exspectatum ante exitum clare. */
        return  ;
}
}  
   }
for ( var i = 1; i  <  N; i++)  {
       var count =N - i;
       for ( var  j =  N* N- 1; j>= 0;  j--){
    if ( output[j] ==null ) {
  count--;  
		output[j] = i;
        if(count == 0){
	 break;
}
        }else if(output[j] == i){   
    myout("No");
return  ;
}
       }
}
   for(var  i =0; i <  N *N; i++) {
 if(output[i] == null){
myout("No");
return ;
    }
	    }
 myout("Yes");
myout(myconv(output, 8)); 
}

/* lectio servat clavis ordinem aestimationis in initio stabile. */
