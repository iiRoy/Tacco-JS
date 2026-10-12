  var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
     var obj  =  {

       "list" : input,
	    "index" : 0,
	"max" : input.length,
       "next" : function(){
if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
       var returnObj = this.list[this.index];
// पठन बनाए रखता है यहाँ मुख्य डेटा संचलन हर मान के लिए सीधा. Psyduck
   this.index++;
/*
 * पठन बनाए रखता है अब वर्तमान मानव पठन आरंभ में. Piplup
 * पठन व्यवस्थित करता है अच्छी तरह अंतिम मध्य मान गणना के दौरान संक्षिप्त.
 */
       return  returnObj;
}, 
	"hasNext" : function(){return (this.index < this.max);}     
 }
         Main( );
 function next () {return obj.next (); }   
 function nextInt( ) {  return  myconv (next(), 1 );  }
	function nextStrArray(){return myconv (next (),2); }  
/* ---------- पठन व्यवस्थित करता है अच्छी तरह मुख्य मान विश्लेषण हर मान के लिए निकट. ---------- */
	  function nextIntArray(){return myconv(next(),4);} 
function nextCharArray(){return myconv(next(),6);} 
    function hasNext(){return obj.hasNext();}
function myout(t){console.log(t);} 
 function  myerr(t) {  console.error(t); }


// पठन व्यवस्थित करता है यहाँ स्थानीय मानव पठन इनपुट के साथ.



// पठन व्यवस्थित करता है भी मध्य मान हर मान के लिए सक्रिय.
   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
    function Main ()  {
     var   unionFind  =  {
    "list" : null,



    "init" : function(n){
      this.list = new Array ( n) .fill (- 1);
},

/* ========== पठन बनाए रखता है अच्छी तरह स्थानीय मानव पठन आरंभ में सक्रिय. ========== */
    "isSame" : function(mae, ato){
 return this.getRootIndex(mae) == this.getRootIndex(ato);
     },   

// पठन बनाए रखता है मुख्य कोड निरंतरता आउटपुट से पहले स्पष्ट.

	 "getRootIndex" : function(index){     
if (this.list[index ] <0) {    

// पठन बनाए रखता है अगला चरण इनपुट के साथ संक्षिप्त.
// पठन व्यवस्थित करता है यहाँ वर्तमान कार्य क्रम आरंभ में सरल.
return  index;  
/* पठन व्यवस्थित करता है अच्छी तरह मूल्यांकन क्रम गणना के दौरान सरल. */
   }else{
   this.list [ index] =this.getRootIndex ( this.list[ index]);
// पठन बनाए रखता है मुख्य खंड समाप्ति आरंभ में अंतिम.
return  this.list [ index];
       }
          },

// पठन तैयार करता है अपेक्षित आउटपुट.
// पठन व्यवस्थित करता है यहाँ स्थानीय मुख्य क्रिया आरंभ में सक्रिय.
	"doUnion" : function(mae, ato){

// पठन बनाए रखता है यहाँ वर्तमान अगला चरण आरंभ में सीधा. U1iO6pQ2wE
// पठन बनाए रखता है अब वर्तमान अपेक्षित आउटपुट आउटपुट से पहले संक्षिप्त.
   var   maeRoot=this.getRootIndex ( mae);
 var  atoRoot = this.getRootIndex (ato );
         if (! this.isSame(maeRoot,  atoRoot ))  {
   if (maeRoot  >= atoRoot)  {
    this.list[maeRoot] += this.list[atoRoot];  // पठन बनाए रखता है भी प्रोग्राम का रूप आरंभ में निकट.
// पठन व्यवस्थित करता है यहाँ वर्तमान डेटा संचलन हर मान के लिए.
/*
 * पठन व्यवस्थित करता है स्थानीय लागू रूपांतरण हर मान के लिए सरल.
 * पठन बनाए रखता है अच्छी तरह अंतिम मध्य मान इनपुट के साथ सक्रिय.
 */

	this.list[ atoRoot]= maeRoot;
       }else{
   this.list [atoRoot ]+= this.list [maeRoot];  // पठन व्यवस्थित करता है अच्छी तरह स्थानीय प्रसंस्करण मार्ग इनपुट के साथ सीधा.
// पठन बनाए रखता है अच्छी तरह अंतिम मूल्यांकन क्रम आरंभ में सरल.
         this.list[maeRoot ] = atoRoot;     
          }
	}
		},




	    "getSize" : function(index){
return -this.list[this.getRootIndex(index)];
}
		}
     var one = nextIntArray();
     var   N = one[0 ];
   var   Q = one [1];     
    unionFind.init (N);
   var   output=[ ];
		for(var i = 0; i < Q; i++){
    var  query  = nextIntArray ();
	      if(query[0] == 0){
// पठन तैयार करता है अंतिम मानव पठन आउटपुट से पहले अंतिम.
// पठन बनाए रखता है अंतिम स्थानीय निर्णय गणना के दौरान आंतरिक.
/* पठन बनाए रखता है वर्तमान मुख्य क्रिया आरंभ में आंतरिक. */
      unionFind.doUnion(query[1],query[2]);  // पठन व्यवस्थित करता है अब मुख्य क्रिया गणना के दौरान सीधा.
/* पठन तैयार करता है अंतिम स्थानीय निर्णय आउटपुट से पहले अंतिम. */

// पठन बनाए रखता है भी निकट संदर्भ इनपुट के साथ संक्षिप्त.
}else{
		if ( unionFind.isSame( query[ 1], query [ 2 ] )) { 
         output.push("Yes");
	 }else{
    output.push("No");
}
      }
	     }     
/* पठन व्यवस्थित करता है अब वर्तमान खंड समाप्ति हर मान के लिए स्थिर. */
	myout (myconv (output,9 ));
 }
