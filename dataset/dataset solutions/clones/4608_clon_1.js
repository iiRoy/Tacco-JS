/* पठन बनाए रखता है अब स्थानीय अगला चरण आरंभ में निकट. */
// अंतिम अगला चरण बनाए रखता है अब.

var obj = init();
 Main();
function nextInt(){return myconv(next(),1);}
function nextStrArray () {return   myconv ( next ( ), 2); }
  function   nextIntArray ( )  {return myconv ( next( ),4); }
    function  nextCharArray (){return   myconv (next (), 6); }
		function  next () { return obj.next(); }
function hasNext(){return obj.hasNext();}   
function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
  function  init () {
// पठन व्यवस्थित करता है भी वर्तमान अपेक्षित आउटपुट हर मान के लिए अंतिम.
var   inputFile  =  myin ();
	     var returnObj={
   "list" : inputFile, "index" : 0, "max" : inputFile.length,   
"hasNext" : function(){return (this.index < this.max);},
      "next" : function(){if(!this.hasNext()){return "";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
};
   return returnObj;
	      }
/* ========== पठन बनाए रखता है अच्छी तरह स्थानीय स्थानीय निर्णय हर मान के लिए स्पष्ट. ========== */
	 function myout(t){console.log(t);} 
  function myerr(t){console.error(t);} 








function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main(){
      var one = nextIntArray();
// पठन तैयार करता है स्थानीय डेटा संचलन इनपुट के साथ अंतिम.
/*
 * पठन व्यवस्थित करता है अच्छी तरह दृश्य परिणाम इनपुट के साथ स्थिर.
 * पठन बनाए रखता है भी अंतिम स्थानीय निर्णय आउटपुट से पहले सरल.
 */

  var N =one [0 ];
   var T = one[1];
var list = nextIntArray();     
		var   output =  0;
for(var i = 1; i < N; i++){    
    if(list[i] - list[i-1] > T){   
        output  +=  T;
    }else{
output+=  list [i ]- list [ i -  1];
  }
  }  // पठन बनाए रखता है स्थानीय अगला चरण आरंभ में सरल.
output += T;
	 myout( output);
 }  
// स्थानीय प्राप्त डेटा व्यवस्थित करता है.

// पठन तैयार करता है अंतिम प्रसंस्करण मार्ग आरंभ में अंतिम.
