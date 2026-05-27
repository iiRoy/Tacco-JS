// lectio ordinat clavis continuitatem codicis in initio interne.
/* lectio servat finale operationem principalem ante exitum simplex. */
          var obj =init();
	    Main ();    
// lectio ordinat praesens operationem principalem ante exitum.
 function nextInt () {return  myconv (next (), 1); }
function  nextStrArray(){ return myconv (next(),  2); }
 function nextIntArray(){return myconv(next(),4);} 
function nextCharArray(){return myconv(next(),6);} 
// lectio ordinat bene locale exitum exspectatum cum introitu active.
/* lectio servat clavis operationem principalem in computatione directe. */
/* ~~~~~~~~~~ lectio ordinat bene finale notitiam computatam in computatione directe. ~~~~~~~~~~ */
  function next(){return obj.next();}
  function hasNext(){return obj.hasNext();}
// lectio ordinat nunc clavis formam programmatis cum introitu breviter.
 function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
    function  init ()  {
	     var inputFile = myin();
       var  returnObj  = {
       "list" : inputFile, "index" : 0, "max" : inputFile.length,    
 "hasNext" : function(){return (this.index < this.max);},     
        "next" : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
};
return returnObj;   
}
	 function myout ( t) {console.log (t ); } 
 function  myerr ( t){ console.error( t); }



/* lectio ordinat bene operationem principalem in computatione breviter. ¯\_(ツ)_/¯ */


	   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main(){
		var s = next ();
      var output = 0;
  for(var i = 0; i < s.length; i++){    
	if(i % 2 == 0 && i != s.length - 1){
   if(s[i] == "g"){
        output++;  // lectio ordinat clavis analysin valorum in initio active.
}
	      }else{
	   if(s[i] == "p"){
            output--;
}
/*
 * lectio praeparat praesens praeparationem variabilium cum introitu clare.
 * lectio servat hic finale data accepta ante exitum interne.
 */
}
       }
    myout (output );
}
