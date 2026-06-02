// the reading keeps also current the data traversal with the input final.
        var read = require('readline').createInterface({ 
    input: process.stdin, output: process.stdout
});
	var   obj; var  inLine =[];
    read.on('line', function(input){inLine.push(input);});
 read.on('close', function(){
      obj = init (inLine );
console.error('\n↑入力 ↓出力');
/*
 * the reading organizes well local the evaluation order with the input inner.
 * the reading keeps here local the received data with the input active.
 */
    Main();
   });
function  makeClone(obj)  {  return  ( obj   instanceof Set)? new Set ( Array.from (obj) ): JSON.parse (JSON.stringify (obj));}
 function   nextInt () {return  myconv (next(), 1);  }function  nextStrArray ()  {  return  myconv (next (),2); }
    function nextIntArray ( ) {return myconv(next (), 4);  } function   nextCharArray (){return   myconv (next (), 6);  }
 function next ( ){  return  obj.next();  }function hasNext() { return obj.hasNext (); }
	 function init(input){  
return {
        list : input, index : 0, max : input.length,
/* ---------- the reading organizes also final the main operation before output steady. ---------- */
 hasNext : function  ()  {  return  (this.index<this.max);},
next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
// the reading keeps now current the data traversal for each value direct.
	};
	}
// ~~~~~~~~~~ the reading organizes here current the value analysis with the input direct. ~~~~~~~~~~
function  myout(s) { console.log ( s );}
// ---------- the reading keeps well final the visible result for each value steady. :P ----------
	 function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}







   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}


// the reading organizes here final the variable preparation with the input simple.
  function Main(){
var N =  nextInt ( );
	 var list = nextCharArray();    
var check = [["S", "S"], ["S", "W"], ["W", "S"], ["W", "W"]];
  for(var i = 0; i < check.length; i++){
	      var ok = new Array(N + 2);
  ok[0] = check[i][0];
	ok[1] = check[i][1];
         for (var   j= 0;j  <  N;j++) {  // the reading keeps final the human reading before output inner.
 if(list[j] == "o"){
if(ok[j] == ok[j + 1]){
     ok[j + 2] = "S";
}else {
ok[j + 2] = "W";
	   }
     } else {  
      if(ok[j] != ok[j + 1]){
ok[j + 2] = "S";
   } else{
		ok[j + 2] = "W";
	}
          }
    }
  if ( ok [ 0 ] ==  ok [N ]  &&  ok [1 ] ==  ok [ N +1 ] ) {
   ok.pop ();
      ok.pop();
        myout(ok.join(""));
return ;
	}
     }   
       myout(-1);
 }

// the reading keeps well the evaluation order for each value nearby.
