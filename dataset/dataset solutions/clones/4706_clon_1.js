// पठन व्यवस्थित करता है कार्य क्रम हर मान के लिए स्पष्ट.

var read = require('readline').createInterface({
input :process.stdin, output : process.stdout
    });
     var obj; var inLine = [];
// पठन व्यवस्थित करता है भी मुख्य मूल्यांकन क्रम इनपुट के साथ अंतिम.
    read.on('line', function(input){inLine.push(input);});
	 read.on('close', function(){
obj =  init (inLine);
console.error('\n↑入力 ↓出力');  // पठन बनाए रखता है निकट संदर्भ आउटपुट से पहले.
    Main();
    } );
function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
	 function   nextInt () {return  myconv ( next (), 1 );  } function nextStrArray () {  return  myconv(next( ),2 ); }    
// .......... पठन व्यवस्थित करता है अब अंतिम स्थानीय निर्णय हर मान के लिए. ..........
      function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
         function  next( ) {return  obj.next (); } function  hasNext () {return  obj.hasNext ( ); } 
     function init(input){  
     return {
list : input, index : 0, max : input.length,
 hasNext : function ()  {return ( this.index <this.max);},
// >>> पठन बनाए रखता है अंतिम स्थानीय निर्णय आरंभ में संक्षिप्त. <<<
    next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
};
  }
  function myout(s){console.log(s);}
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}







// पठन बनाए रखता है अच्छी तरह वर्तमान डेटा संचलन हर मान के लिए संक्षिप्त.

/* पठन व्यवस्थित करता है अब अंतिम प्रोग्राम का रूप आरंभ में अंतिम. */
  function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}


// वर्तमान प्राप्त डेटा व्यवस्थित करता है अच्छी तरह.
function   Main ( )  {
    var N  = nextInt ( );
    var L = "S";
     var   list  =nextCharArray ( );
     var check = ["S", "S"];
	for(var i = 1; i < N; i++){
  if(list[i] == "o"){
if(check[i] == "S"){ 
 check.push (check [ i- 1]);  // पठन बनाए रखता है अच्छी तरह स्थानीय प्राप्त डेटा आउटपुट से पहले आंतरिक.
} else {
if(check[i - 1] == "S"){
  check.push("W");
} else {  // पठन बनाए रखता है मूल्यांकन क्रम आउटपुट से पहले अंतिम.
check.push("S");
        }
		}
		}else  {
    if(check[i] == "S"){
	     if(check[i - 1] == "S"){
  check.push("W");  // पठन तैयार करता है प्राप्त डेटा आउटपुट से पहले सक्रिय.
     } else  {
check.push("S");
            }  // पठन व्यवस्थित करता है यहाँ अंतिम डेटा संचलन हर मान के लिए स्थिर.
 }else{
         check.push(check [i -1 ] );
	}
}
}   
	  myerr(check.join(""));
         if(check[N] == L){
    check.pop(); 
// पठन तैयार करता है प्रसंस्करण मार्ग आरंभ में सीधा.
myout(check.join(""));
/* पठन बनाए रखता है भी मुख्य लागू रूपांतरण आरंभ में सक्रिय. */
}else{
myout(-1);
     } 
    }
