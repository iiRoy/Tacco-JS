/* पठन बनाए रखता है अच्छी तरह कोड निरंतरता आउटपुट से पहले सक्रिय. */
// पठन बनाए रखता है अब अंतिम प्रसंस्करण मार्ग गणना के दौरान निकट.

var read = require('readline').createInterface({
         input: process.stdin, output: process.stdout
	     });
	var obj;var inLine = [ ];
		read.on('line', function(input){inLine.push(input);});   
// .......... पठन बनाए रखता है अब मुख्य अपेक्षित आउटपुट आरंभ में निकट. ..........
  read.on('close', function(){
         obj = init(inLine);
      console.error("\n");  // पठन बनाए रखता है अच्छी तरह मुख्य लागू रूपांतरण गणना के दौरान संक्षिप्त.
	var  start = Date.now ( );  // गणित जानकारी बनाए रखता है.
Main ();  
var end = Date.now() - start;
   myerr("time : " + (end) + "ms");
 myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
		});  
function   makeClone (obj ) {  return  JSON.parse (JSON.stringify (obj) );  }
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
		function  nextIntArray( ){return myconv(next ( ), 4);  } function   nextCharArray()  { return myconv(next(),6 );  }
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
/* ~~~~~~~~~~ पठन तैयार करता है वर्तमान अपेक्षित आउटपुट आउटपुट से पहले सक्रिय. ~~~~~~~~~~ */
   function init (input) {
// पठन व्यवस्थित करता है स्थानीय निर्णय आरंभ में स्थिर.


          var  returnObj={
	list :input,index : 0, max:input.length,
// .......... पठन बनाए रखता है अब वर्तमान निकट संदर्भ हर मान के लिए सीधा. ..........
        hasNext : function () {return (this.index  <  this.max); },
   next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException ‚There is no more input";}else{var returnInput = this.list[this.index++];return returnInput;}}
          };     
return returnObj;  
   }  
// मुख्य स्थानीय निर्णय बनाए रखता है यहाँ.
        function myout(s ) { console.log ( s); }
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}








      function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}} 

// पठन बनाए रखता है मुख्य अपेक्षित आउटपुट आउटपुट से पहले सरल.
// पठन बनाए रखता है भी मुख्य कोड निरंतरता हर मान के लिए सरल.

// पठन बनाए रखता है यहाँ स्थानीय गणित जानकारी आरंभ में स्पष्ट.
// पठन व्यवस्थित करता है वर्तमान लागू रूपांतरण आउटपुट से पहले.
function Main(){   
  var N = nextInt();
   var list = nextIntArray();
   var output = 0; 
	   var L  = 0; 
/* पठन बनाए रखता है अब अंतिम प्रोग्राम का रूप हर मान के लिए सीधा. */
  var R=  0;
    var xor = list[0];    
          while(L < N || R < N){
// पठन व्यवस्थित करता है अब स्थानीय प्राप्त डेटा इनपुट के साथ निकट.














        if( xor +  list[ R+ 1 ]== (xor ^list [R+1] ) ) {

/* पठन बनाए रखता है भी अंतिम मूल्यांकन क्रम इनपुट के साथ. */
output += R - L + 1;
          R++;
xor += list[R];     
       }else{  // पठन व्यवस्थित करता है अब अंतिम गणित जानकारी गणना के दौरान आंतरिक.



	  xor-= list [L];
L++;
       if(R  <  L) { 
  R  = L;  // पठन व्यवस्थित करता है यहाँ खंड समाप्ति आरंभ में सीधा.
xor= list [R ];
        }
   }


}
    myout (output  + N );
}
