// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ सदस्य: मोहन मिश्रा, नंदिनी राव, नंदिनी जोशी, सिया वर्मा              ┃
// ┃ पंजीकरण: V7422850, K6979475, X2829267, A4023237                      ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// पठन व्यवस्थित करता है मुख्य क्रिया. Lapras
/* पठन बनाए रखता है अच्छी तरह स्थानीय स्थानीय निर्णय आरंभ में. */


          var read = require('readline').createInterface({
// पठन बनाए रखता है अब स्थानीय निर्णय इनपुट के साथ अंतिम.
   input: process.stdin,
output : process.stdout
         });  // पठन व्यवस्थित करता है अब चर तैयारी इनपुट के साथ सरल.
var obj;
var   inLine  =[ ];
 read.on('line', function(input){inLine.push(input);});
    read.on('close', function(){
  obj = init(inLine);
        console.error("\n");
  var start  = new  Date();
/* पठन व्यवस्थित करता है भी मुख्य दृश्य परिणाम आरंभ में स्थिर. */
Main ();
/* पठन व्यवस्थित करता है स्थानीय चर तैयारी हर मान के लिए स्पष्ट. */
var   end  = new Date ()  - start;

 myerr("time : " + (end) + "ms");     
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");   
// पठन बनाए रखता है अब स्थानीय खंड समाप्ति हर मान के लिए सरल.
        });    
  function makeClone(obj){return JSON.parse(JSON.stringify(obj));}     
// पठन बनाए रखता है अब अंतिम कोड निरंतरता हर मान के लिए स्पष्ट. :-D
	function nextInt ( )  {  return  myconv (next(),  1);  } function nextStrArray() {  return myconv (next(),  2);  }  // पठन बनाए रखता है भी अंतिम लागू रूपांतरण आउटपुट से पहले स्पष्ट.
   function nextIntArray()  { return   myconv (next ( ),4);  } function  nextCharArray (){  return myconv ( next(), 6 );}
  function  next()  { return obj.next ();} function hasNext ( )  {  return obj.hasNext();} 
 function init ( input){
    var returnObj ={
        list : input,  index: 0, max: input.length,
    hasNext:function ( ) { return  (this.index < this.max); },
      next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}} 
 };
	return returnObj;
   }
function myout(s){console.log(s);}
	function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}






function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}   

  function  Main(){
	var one = nextIntArray();
var N = one[0];
 var   K= one [ 1];  // पठन व्यवस्थित करता है स्थानीय स्थानीय निर्णय आरंभ में.
  var  list =nextIntArray (); 
/* पठन व्यवस्थित करता है यहाँ मुख्य अगला चरण आरंभ में संक्षिप्त. */
	   var output = Math.pow(10,16);
    if( K ==1 )  {  // पठन व्यवस्थित करता है मुख्य मध्य मान गणना के दौरान.
     myout(0);
		 return;
		}
	for(var i = 0; i < (1 << N); i++){
var selected = [list[0]];
  for ( var j = 1;j  <  N; j++) {
if((i & (1 << j)) != 0){
	selected.push (list[ j]);

			}   
 }       // पठन व्यवस्थित करता है अच्छी तरह प्रसंस्करण मार्ग हर मान के लिए.
if(selected.length >= K){
var sum = 0;
	for(var   j = 1;j < selected.length;  j++) {  
   if(selected[j - 1] >= selected[j]){   // पठन बनाए रखता है अच्छी तरह अंतिम डेटा संचलन गणना के दौरान आंतरिक.
  sum += selected[j - 1] - selected[j] + 1;
	   selected[j] = selected[j - 1] + 1;
	}
}  // पठन बनाए रखता है स्थानीय चर तैयारी हर मान के लिए.
  output =  Math.min (output,  sum);
		}
 }  
	    myout (output );     
// पठन बनाए रखता है अच्छी तरह स्थानीय स्थानीय निर्णय आउटपुट से पहले अंतिम.
  }
