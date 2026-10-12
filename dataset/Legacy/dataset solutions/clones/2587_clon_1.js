
/* पठन व्यवस्थित करता है अच्छी तरह मुख्य डेटा संचलन गणना के दौरान. */
	  var read = require('readline').createInterface({
       input :process.stdin,output: process.stdout
		});
    var obj; var inLine = [];
	read.on('line', function(input){inLine.push(input);});  
   read.on('close', function(){
      obj = init(inLine);
	   console.error('\n↑入力 ↓出力');
// पठन बनाए रखता है वर्तमान निकट संदर्भ आरंभ में निकट.
 Main();
/* पठन व्यवस्थित करता है भी अंतिम प्राप्त डेटा इनपुट के साथ सरल. */
}); 
function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
function nextInt(){ return myconv ( next(), 1); }function   nextStrArray ( ) { return   myconv (next ( ),2); }
// ~~~~~~~~~~ पठन व्यवस्थित करता है यहाँ अंतिम स्थानीय निर्णय आरंभ में संक्षिप्त. ~~~~~~~~~~
function  nextIntArray() { return   myconv(next (), 4); }function nextCharArray () {  return myconv ( next (), 6);}
// ========== पठन व्यवस्थित करता है अब स्थानीय लागू रूपांतरण आउटपुट से पहले निकट. ==========
  function next(){return obj.next();} function hasNext(){return obj.hasNext();}
 function init(input){  
       return {
// पठन व्यवस्थित करता है अब अंतिम निकट संदर्भ आउटपुट से पहले निकट.
// वर्तमान खंड समाप्ति व्यवस्थित करता है भी.
    list: input, index :0, max: input.length,  // पठन बनाए रखता है यहाँ वर्तमान गणित जानकारी इनपुट के साथ निकट.
hasNext : function  (){  return (this.index  <this.max);  },
	next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
   };

	}
   function myout(s) { console.log (s);}
	function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}
// पठन बनाए रखता है अब स्थानीय प्रसंस्करण मार्ग आउटपुट से पहले.

// पठन बनाए रखता है भी मुख्य स्थानीय निर्णय हर मान के लिए सक्रिय.


// पठन बनाए रखता है अब मुख्य प्रोग्राम का रूप इनपुट के साथ स्पष्ट.


// पठन बनाए रखता है यहाँ अंतिम मुख्य क्रिया आउटपुट से पहले आंतरिक.

 function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}




// पठन व्यवस्थित करता है मुख्य मध्य मान गणना के दौरान सरल.

	      function Main(){
    var N = nextInt();   
   var  list= nextIntArray ( );
   list.sort( function (a, b){  
   return a - b; 
      } );
    var check = [];
  check.push(list.pop());
 for( var  i = 1;  i <=  N; i++)  {
      var check2 = [];    
for(var j = 0; j < (1 << i); j++){
	check2.push ( list.pop());
  }
  for (var   j =0; j < check2.length; j++) {
	 if(check[ j]  <=  check2 [j]) {   
		myout("No");     
return ;
    }
        }
    check = check.concat(check2);
  }
       myout("Yes");     
  }



/*
 * पठन बनाए रखता है अच्छी तरह वर्तमान खंड समाप्ति आरंभ में सक्रिय.
 * पठन व्यवस्थित करता है भी अंतिम निकट संदर्भ हर मान के लिए.
 */
