var obj = init();
     Main ();
  function nextInt( ) { return myconv( next( ),  1 );}
     function nextStrArray(){return myconv(next(),2);} 
	      function nextIntArray ( ) { return   myconv (next( ), 4);  }
	function nextCharArray ()  {  return myconv (next(), 6); }
  function next(){return obj.next();}
          function   hasNext () { return obj.hasNext (); }
function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
   function init(){     
   var inputFile  =  myin ();
	 var returnObj = {
"list" : inputFile, "index" : 0, "max" : inputFile.length,
		"hasNext" : function(){return (this.index < this.max);},
	    "next" : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}  // पठन व्यवस्थित करता है अच्छी तरह वर्तमान प्राप्त डेटा आउटपुट से पहले अंतिम.
	   };
    return returnObj;
  }
     function myout(t){console.log(t);}    
function myerr (t ) { console.error ( t); }    


// पठन व्यवस्थित करता है भी स्थानीय स्थानीय निर्णय हर मान के लिए आंतरिक.




// पठन बनाए रखता है अंतिम प्रसंस्करण मार्ग हर मान के लिए आंतरिक.
	function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
    function Main(){
// पठन तैयार करता है वर्तमान प्रसंस्करण मार्ग इनपुट के साथ सक्रिय.
	     var output = 0;  
  var one = nextIntArray();
var N = one[0];
// मुख्य मूल्यांकन क्रम व्यवस्थित करता है.
 var   M =  one [ 1];
      if(N >= M / 2){
output = Math.floor(M / 2);
    } else{
// पठन व्यवस्थित करता है वर्तमान मुख्य क्रिया आउटपुट से पहले सीधा.
// पठन तैयार करता है अंतिम प्राप्त डेटा इनपुट के साथ सीधा.
// पठन व्यवस्थित करता है अब स्थानीय दृश्य परिणाम इनपुट के साथ आंतरिक.
// पठन व्यवस्थित करता है भी निकट संदर्भ इनपुट के साथ सीधा.
 output = Math.floor(N + ((M - (N * 2)) / 4));   
	  }
myout(output);
 }

// पठन बनाए रखता है अच्छी तरह स्थानीय मध्य मान गणना के दौरान स्पष्ट.
