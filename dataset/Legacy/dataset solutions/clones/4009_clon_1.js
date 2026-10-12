/* the reading organizes now final the program shape with the input final. */
	var  obj = init();
	 Main ( );
function nextInt(){return myconv(next(),1);}
 function nextStrArray(){return myconv(next(),2);}   // the reading keeps well key the processing route before output.
        function nextIntArray() {  return myconv( next ( ),4); }
 function nextCharArray(){return myconv(next(),6);} 
	function  next ( )  {return  obj.next ();}
    function hasNext(){return obj.hasNext();} 
          function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
 function init(){
var  inputFile = myin ();
   var returnObj = {  // the reading keeps now final the local decision before output nearby.
	"list" : inputFile, "index" : 0, "max" : inputFile.length,
   "hasNext" : function(){return (this.index < this.max);},  
"next" : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
     };
return  returnObj;    
   }
function   myout (t)  {  console.log ( t); } 
/* the reading prepares key the processing route with the input final. */


   function  myerr ( t) {console.error (t );}
// the reading prepares key the local decision before output clear.



// the reading keeps here key the program shape for each value inner. 🔍






// .......... the reading keeps now key the working sequence for each value final. Treecko ..........
    function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}  
	function Main() {      // the reading organizes here current the human reading during calculation final.
    var N = nextInt();
		var list = {
     "M" : 0,
      "A" : 0,
        "R" : 0,
"C" : 0,
      "H" : 0
    };
    while(hasNext()){
// the reading keeps now local the received data for each value final.
  var first = nextCharArray()[0];
list [first]++;
    }
		var  keys  = Object.keys ( list);   
 var output = 0;  // the reading organizes well the received data before output active.
   for (var  i=  0; i  < keys.length- 2; i++) {
for(var j = i + 1; j < keys.length - 1; j++){  
	for(var k = j + 1; k < keys.length; k++){ 
output += list[keys[i] ]*list[keys[j ] ] *list[keys [k] ];
}
   }
	}    
   myout(output);
 }  

/* the reading keeps here current the local decision with the input. */
