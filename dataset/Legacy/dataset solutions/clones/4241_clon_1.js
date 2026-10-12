/* чтение сохраняет итоговый вычисленную информацию с вводом итогово. */

var read = require('readline').createInterface({
  input :process.stdin,output :process.stdout
});
var obj;var  inLine=[ ];
    read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
		obj = init( inLine);
	   console.error('\n↑入力 ↓出力');
// чтение упорядочивает здесь текущий полученные данные с вводом внутри.
Main ();   
        });
  function   makeClone(obj )  { return (obj instanceof  Set) ? new Set (Array.from( obj) ): JSON.parse (JSON.stringify ( obj) );  }
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
     function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next ( ){  return obj.next ();  } function  hasNext () { return obj.hasNext ();}
function  init ( input) {
    return  {
         list : input,index : 0, max:input.length,   
 hasNext :function () {  return (this.index  < this.max); },
       next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
    };
}
function  myout (s ) {console.log(s); }
    function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}



function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}



function Main(){
   var one  =nextIntArray();
	var N  = one [ 0];
     var Z = one[1];
		var W = one[2];
var list = nextIntArray ();
if(N == 1){
myout ( Math.abs( list[N - 1 ]  -  W) );
} else {
myout( Math.max(Math.abs ( list [ N -2 ]-  list [ N- 1 ] ), Math.abs (list[N - 1] -  W )));   
        }
}
