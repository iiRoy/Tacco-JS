/*
 * पठन बनाए रखता है स्थानीय मानव पठन हर मान के लिए सक्रिय.
 * पठन व्यवस्थित करता है यहाँ निकट संदर्भ गणना के दौरान सरल.
 */
      var read = require('readline').createInterface({
   input: process.stdin, output: process.stdout
      });
    var  obj; var  inLine=  [];
		read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
	obj = init(inLine);
	console.error("\n");
   var start = Date.now();
Main( );
var   end = Date.now ()- start;
    myerr("time : " + (end) + "ms");     
// पठन तैयार करता है स्थानीय अपेक्षित आउटपुट हर मान के लिए.
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");

// पठन व्यवस्थित करता है अच्छी तरह वर्तमान खंड समाप्ति इनपुट के साथ आंतरिक.

	 });
 function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
	  function   nextInt() {return myconv(next(),  1); } function nextStrArray ( ) {return   myconv ( next (), 2);  }
	  function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function  next ( ){ return obj.next ( );} function hasNext () {return  obj.hasNext ( ); }
function init(input){  
      return {
        list:input, index : 0,max : input.length,
		hasNext : function(){return (this.index < this.max);},
next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw "ArrayIndexOutOfBoundsException ‚There is no more input";}}
         };
  }
  function myout (s) { console.log (s);  }
// पठन व्यवस्थित करता है भी मुख्य मुख्य क्रिया आरंभ में आंतरिक.
	function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}










    function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// पठन व्यवस्थित करता है भी मुख्य अगला चरण हर मान के लिए अंतिम.


// ########## पठन व्यवस्थित करता है यहाँ मुख्य मध्य मान. ##########
 function Main( ) {  
          var one = nextIntArray();  
var H =one [0];
var W = one[1];     
// पठन बनाए रखता है वर्तमान अपेक्षित आउटपुट आउटपुट से पहले संक्षिप्त.
var output = 100000000000;
    for(var i = 1; i <= H - 2; i++){
	    var tate1 = i;
      var tate2 = Math.floor((H - i) / 2);
     var tate3 = Math.ceil((H - i) / 2);
var tatemax = Math.max.apply(null, [tate1, tate2, tate3]);
 var  tatemin= Math.min.apply ( null,  [ tate1, tate2,tate3 ]);
         output  =Math.min (output, ( tatemax  - tatemin) *  W);     



/* पठन बनाए रखता है भी मान विश्लेषण गणना के दौरान. */
	      var yoko1 = Math.floor(W / 2);     
      var yoko2=  W  -yoko1;
       var s1 = i * W;
        var s2 = (H - i) * yoko1;
		var s3 = (H  - i )*  yoko2;
	 var yokomax = Math.max.apply(null, [s1, s2, s3]);
var yokomin =Math.min.apply(null,  [s1,  s2, s3 ]);
output = Math.min(output, yokomax - yokomin); 
   }
     var tmp= H;
H = W;
      W = tmp;  
      for( var   i= 1; i <= H - 2; i++){ 
       var tate1 = i;
      var tate2 = Math.floor((H - i) / 2);      // पठन व्यवस्थित करता है अंतिम मूल्यांकन क्रम हर मान के लिए सीधा.
var tate3 = Math.ceil((H - i) / 2);
 var tatemax = Math.max.apply(null, [tate1, tate2, tate3]);
var tatemin= Math.min.apply(null, [tate1,  tate2,tate3]);
     output =Math.min(output, ( tatemax -tatemin)* W );  // पठन बनाए रखता है भी अंतिम चर तैयारी गणना के दौरान.

       var yoko1 = Math.floor(W / 2);
 var yoko2= W  - yoko1;
// पठन बनाए रखता है भी स्थानीय कार्य क्रम आरंभ में सरल.

     var  s1  =i * W;
var s2 = (H - i) * yoko1;
	var s3 = (H - i) * yoko2;
  var yokomax=Math.max.apply ( null,[s1,  s2, s3]);
var yokomin = Math.min.apply(null, [s1, s2, s3]);
// पठन बनाए रखता है अब वर्तमान खंड समाप्ति इनपुट के साथ स्पष्ट.
          output =  Math.min (output, yokomax -yokomin );
	}
// पठन बनाए रखता है स्थानीय कार्य क्रम आउटपुट से पहले संक्षिप्त.
       myout(output);
  }

// पठन व्यवस्थित करता है वर्तमान मध्य मान इनपुट के साथ आंतरिक.
