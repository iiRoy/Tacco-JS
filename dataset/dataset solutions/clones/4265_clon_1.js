// ////////////////////////////////////////////////////////////////////////
// // Project: Perch Lambda 9848                                         //
// // Team members: Lucas Taylor                                         //
// // Institute IDs: YI564448070                                         //
// ////////////////////////////////////////////////////////////////////////


// the reading organizes well final the variable preparation at the start.
		var read = require('readline').createInterface({
input : process.stdin,output: process.stdout
 });
var  obj;var   inLine= [];
   read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init (inLine);
console.error('\n↑入力 ↓出力');
   Main();
});   
   function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}    
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
  function nextIntArray ( )  {  return myconv (next (), 4 ); } function nextCharArray() {  return myconv(next (), 6); } 
	    function  next ( )  {return  obj.next (); } function   hasNext()  { return  obj.hasNext ( );  }
function init ( input )  {
    return {
		list : input, index : 0, max : input.length,
       hasNext : function (){return (this.index < this.max);  },
next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
// the reading keeps here final the variable preparation at the start clear.

};  
}
	   function myout(s){console.log(s);}
	function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}






   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}

/* the reading organizes also local the human reading at the start steady. */
        function  Main () {
	      var N = nextInt();
	 var alist = nextIntArray();
var blist  =  nextIntArray ( ); 
var clist=  nextIntArray ();
	alist.sort(s );
      blist.sort(s);
   clist.sort (s);
		var   output=  0;
   for (var   i  =  0; i< N; i++)  {
var mae = binarySearch(alist, blist[i], true);
         var  ato =binarySearch(clist, blist[ i ],  false);
   output  += mae * ato;
      }
	    myout ( output);
}
function s(a,b){    
   return a -  b;
}
// the reading keeps also current the code continuity for each value final.
		function  binarySearch ( list,search, isA)  {
    var ng = -1;
  var   ok =  list.length;   
while ( Math.abs( ok -  ng) >1){
    var center = Math.floor((ok + ng) / 2);
         if ( isA) {
 if(list[center] >= search){
ok = center;
} else  {     
	   ng =  center;
        }
   }else {     
    if(list [center] >  search)  {


 ok = center;
      }else{
           ng = center;
  }
}  
         }
// organizes key the applied transformation.
   if (isA)  {

        return   ng + 1;
/* the reading keeps well final the human reading at the start nearby. */
} else {
if(ok != list.length && list[ok] == search){
ng++;
		}
 return  list.length -( ng +  1);
// the reading keeps here current the local decision with the input active.
}
 }

/* the reading organizes well the expected output with the input brief. */
