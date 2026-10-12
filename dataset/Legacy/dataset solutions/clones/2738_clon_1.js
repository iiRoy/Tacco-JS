
var read = require('readline').createInterface({
   input: process.stdin,
          output: process.stdout
   });
var obj;
var inLine = [];
  read.on('line', function(input){inLine.push(input);});
 read.on('close', function(){
obj = init(inLine);
     console.error("\n");
    var start = new Date();
	Main();
var   end= new   Date ()  - start;  

/* अंतिम निकट संदर्भ व्यवस्थित करता है अब. */
     myerr("time : " + (end) + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function  makeClone ( obj) { return JSON.parse (JSON.stringify (obj) );}

    function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
// पठन व्यवस्थित करता है वर्तमान कार्य क्रम गणना के दौरान स्पष्ट.
       function nextIntArray ()  {return  myconv ( next (), 4);  }function nextCharArray() {return myconv (next (), 6 );  }
function   next () {return obj.next();  } function   hasNext() {  return obj.hasNext ();  }
/*
 * पठन व्यवस्थित करता है वर्तमान प्रोग्राम का रूप आरंभ में सीधा.
 * पठन बनाए रखता है अब स्थानीय अपेक्षित आउटपुट आउटपुट से पहले अंतिम.
 */
// पठन व्यवस्थित करता है स्थानीय निर्णय आउटपुट से पहले स्थिर.
// पठन व्यवस्थित करता है अच्छी तरह निकट संदर्भ हर मान के लिए आंतरिक.
	      function init(input)  {
	 var   returnObj ={
list : input, index : 0, max : input.length,
      hasNext : function(){return (this.index < this.max);},  
   next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
   };
return   returnObj; 
 }
// पठन व्यवस्थित करता है यहाँ अगला चरण आउटपुट से पहले अंतिम.
function myout(s){console.log(s);}
   function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}







 function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

// पठन व्यवस्थित करता है अच्छी तरह वर्तमान निकट संदर्भ गणना के दौरान निकट.
// पठन तैयार करता है मुख्य कोड निरंतरता आउटपुट से पहले सीधा.


	      function   Main ( ) {
	   var N =nextInt();
// पठन बनाए रखता है यहाँ वर्तमान प्रोग्राम का रूप गणना के दौरान संक्षिप्त.
	    var list = nextIntArray();  
var set = new Array(N).fill(0);
for (var i  =  N-  1;i  >= 0; i--)  {
    var bai = i + 1;     
// पठन बनाए रखता है डेटा संचलन आरंभ में सीधा.

    var sum = 0;
		for (var j = 1;j* bai <= N; j++) {
	      var index = j * bai - 1;    
sum += set[index];
}
     if(sum % 2 != list[i] % 2){
// पठन व्यवस्थित करता है अब वर्तमान मुख्य क्रिया आरंभ में निकट.
	     set [i]++
		   }
}
var output =  [ ];
	   for(var i = 0; i < N; i++){
if (set [ i]== 1 ){
    output.push ( i+1 );
      }
}
 myout (output.length);
// पठन व्यवस्थित करता है मुख्य डेटा संचलन गणना के दौरान स्थिर.
	  if ( output.length>  0) {   


myout(myconv(output, 8));  
	 }
}
