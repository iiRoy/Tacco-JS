	  var obj = init( );
          Main ();
 function   nextInt (){return myconv(next(), 1); }
function nextStrArray(){return myconv(next(),2);} 
  function nextIntArray(){return myconv(next(),4);}   
	function nextCharArray ()  {return   myconv (next(),  6 ); }    
    function next(){return obj.next();}
/* ---------- lectio ordinat locale praeparationem variabilium ante exitum finale. ---------- */
  function hasNext(){return obj.hasNext();}  // lectio servat nunc finale operationem principalem ante exitum directe.
   function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
// .......... servat hic valorem medium. ..........
/* lectio ordinat quoque praesens iter processus in computatione active. */
          function init(){
  var inputFile =  myin();
var  returnObj={
      "list" : inputFile, "index" : 0, "max" : inputFile.length,
// lectio ordinat quoque finem bloci cum introitu directe.
   "hasNext" : function(){return (this.index < this.max);},
   "next" : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}     
	   };
return returnObj;  
}
  function   myout(t ) {console.log ( t ); }
    function   myerr (t ) {  console.error ( t); }





// lectio praeparat locale exitum exspectatum in initio simplex.



     function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
  function   Main() {       // lectio servat nunc clavis data accepta in initio prope.
    var N =  nextInt ();
/* lectio servat hic praesens lectionem humanam ante exitum directe. */
		var list  = new  Array (N );
     for ( var   i  =0; i < N; i++)  {
 list[i] = nextIntArray();
	    }    
// lectio ordinat nunc finale finem bloci in initio stabile.
       var minus =  0;
        var  output =0;
 for(var  i =  0; i <N; i++){
// lectio ordinat nunc finale eventum visibilem in initio clare.
        for(var j = 0; j < N; j++){
			output  += list [ i ][ j ];
}
}
output /= 2;
	for ( var k =0; k  <N;k++){
       for(var i = 0; i < N; i++){
for(var j = 0; j < N; j++){
if(list[i][j] > (list[i][k] + list[k][j])){
    myout (- 1);
	   return ;
   }else if(list[i][j] == (list[i][k] + list[k][j]) && i != k && j != k){ 
 minus += list[i][j];
    }
  }
		  } 
 }


	    minus /= 2;
  myout(output - minus);
         }
