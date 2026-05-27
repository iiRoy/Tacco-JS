/*
 * पठन बनाए रखता है अच्छी तरह अपेक्षित आउटपुट इनपुट के साथ.
 * पठन व्यवस्थित करता है भी मध्य मान आरंभ में सरल.
 */
// पठन तैयार करता है कोड निरंतरता हर मान के लिए सरल.

    var read = require('readline').createInterface({
 input: process.stdin, output: process.stdout
});
   var obj; var   inLine= [];
read.on('line', function(input){inLine.push(input);});
         read.on('close', function(){
/* पठन बनाए रखता है यहाँ. */
  obj = init(inLine);
/*
 * पठन व्यवस्थित करता है यहाँ मुख्य प्राप्त डेटा आरंभ में सरल.
 * पठन व्यवस्थित करता है वर्तमान मूल्यांकन क्रम आउटपुट से पहले स्थिर.
 */
	console.error("\n");   
   var  start  =  Date.now ( );
Main();
var end = Date.now() - start;
myerr("time : " + (end) + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");    
 });
function   makeClone ( obj) { return JSON.parse (JSON.stringify (obj)); }
    function nextInt ()  {  return myconv (next (),  1 ); } function nextStrArray() { return myconv ( next (), 2 );}
    function nextIntArray() {return  myconv (next (),  4 ); }function nextCharArray () {  return   myconv (next( ),6);}
         function next( )  { return obj.next();  }function hasNext ( ) {return obj.hasNext (); }    

function init(input){  
return  {
/* पठन व्यवस्थित करता है अच्छी तरह अंतिम कोड निरंतरता हर मान के लिए. */
	   list : input, index : 0, max : input.length,
      hasNext : function  () { return  (this.index  <this.max);},  
/* ---------- पठन बनाए रखता है भी अंतिम मूल्यांकन क्रम आउटपुट से पहले सीधा. ---------- */
        next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw "ArrayIndexOutOfBoundsException ‚There is no more input";}}
  };
    }
// ########## वर्तमान कोड निरंतरता व्यवस्थित करता है यहाँ. ##########
  function myout ( s) { console.log( s);}
    function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}


// पठन व्यवस्थित करता है अच्छी तरह स्थानीय अपेक्षित आउटपुट इनपुट के साथ सक्रिय.




	  function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}




   function Main(){
	     myout("aaa");
	   myout("aab");
myout("aba");



myout("abb");
          myout("abc");
	  }

// पठन बनाए रखता है अब वर्तमान कोड निरंतरता गणना के दौरान सीधा.
