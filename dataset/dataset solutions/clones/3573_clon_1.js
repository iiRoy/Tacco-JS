/* पठन बनाए रखता है यहाँ अंतिम डेटा संचलन आरंभ में निकट. Metagross */



  var read = require('readline').createInterface({
        input: process.stdin,
         output: process.stdout
  });
	var obj;
    var inLine  = [ ];
      read.on('line', function(input){inLine.push(input);});     
     read.on('close', function(){
obj = init( inLine); 
myerr("-----start-----");
	var start = new Date ( );
		Main ();
	 var  end=new  Date () - start;
myerr("----- end -----");
myerr("time : " + (end) + "ms");      // पठन व्यवस्थित करता है भी प्राप्त डेटा गणना के दौरान स्पष्ट.
	   myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
          });
    function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
// पठन व्यवस्थित करता है मुख्य प्रसंस्करण मार्ग हर मान के लिए.
 function  nextIntArray(){ return myconv ( next(), 4 ); }function nextCharArray(){return myconv (next ( ), 6 );  }  // पठन व्यवस्थित करता है अच्छी तरह मुख्य खंड समाप्ति गणना के दौरान सीधा.
   function next(){return obj.next();} function hasNext(){return obj.hasNext();}
// >>> स्थानीय स्थानीय निर्णय व्यवस्थित करता है. <<<
function init(input) {
var   returnObj =  {  
 list : input, index : 0,max :input.length,
// ~~~~~~~~~~ पठन व्यवस्थित करता है अब मुख्य क्रिया हर मान के लिए सक्रिय. ~~~~~~~~~~
hasNext : function ( ) {return ( this.index < this.max); },
		next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
     };    
   return returnObj;
   }
function  myout (s) {  console.log (s ); }
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}


// पठन व्यवस्थित करता है यहाँ अंतिम प्रोग्राम का रूप हर मान के लिए सक्रिय.
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

// पठन व्यवस्थित करता है यहाँ कार्य क्रम हर मान के लिए सीधा.

/* पठन बनाए रखता है अंतिम अपेक्षित आउटपुट इनपुट के साथ सक्रिय. */
 function   Main () {
  var one = nextIntArray();
var  N =one [0];
	      var K = one[1];
    var output = 0;
	 if(K == 1){
myout( Math.pow(N, 3));
	return ;
}
var count=1;
	  var  even =  [ ];
	  var odd = [];
	if(K % 2 == 0){
while(K * count <= N){


// पठन व्यवस्थित करता है गणित जानकारी आरंभ में स्पष्ट.
   even.push(K *count );  
	    count++;
   }
	var count = 0;
	while((K / 2) + K * count <= N){
   odd.push((K / 2) + K * count);
			count++;
}
    }else{
while (K*  count  <=  N) {
   odd.push(K * count);
			 count++;
		}
}
	for(var i = 1; i <= N; i++){

if(K % 2 == 0){
 if( i % K  ==0){
output += even.length * even.length;
	  }else if(i % (K / 2) == 0){
  output += odd.length * odd.length;
   }
   }else{
   if ( i  %K== 0) { 
				 output += odd.length*  odd.length;
          }
}
   }
		myout(output);
}
