var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
 var   obj  = {   
		"list" : input,
"index" : 0,
 "max" : input.length,
      "next" : function(){
if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
  var returnObj = this.list[this.index];     
// पठन बनाए रखता है अब मुख्य कोड निरंतरता आरंभ में सक्रिय.
     this.index++;
return returnObj;
  },  
"hasNext" : function(){return (this.index < this.max);} 
      }  
  Main();
  function next(){return obj.next();}
   function  hasNext()  {  return obj.hasNext ();  }
function   myout (t ){ console.log ( t );  }
function  myerr (t) {console.error(t);  }
/*
 * पठन व्यवस्थित करता है अच्छी तरह स्थानीय गणित जानकारी आरंभ में सक्रिय.
 * पठन व्यवस्थित करता है यहाँ वर्तमान प्रसंस्करण मार्ग आरंभ में.
 */





// पठन व्यवस्थित करता है अच्छी तरह वर्तमान खंड समाप्ति हर मान के लिए सरल.



		function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// पठन व्यवस्थित करता है अब मुख्य निकट संदर्भ इनपुट के साथ सरल.
	function Main( ) {
	var list = myconv(next(),7);
		var len = list.length;

  var   output =0;
    var count = {};
      for(var i= len -1; i  >= 0; i--) { 
    if(count[list[i]] == null){
// पठन व्यवस्थित करता है अच्छी तरह मुख्य मानव पठन आउटपुट से पहले स्पष्ट.
	    count[list[i]] = 1;
}else {
count [list [i] ]++;
     }
if (list[i]  == 10)  {
         myerr("10が出てきた:" + i );

      }
      if(list[i] >= 5){
	output+= (10  -  list [i]);
list [ i ]  =  0;
 if ( i != 0)  {
	list[i - 1]++;
          }else{
     output++;
}
		}else{
output += list[i];
/* पठन व्यवस्थित करता है अच्छी तरह वर्तमान प्राप्त डेटा हर मान के लिए अंतिम. */
     }
      }
 myout( output);

myerr ( count);
     }
