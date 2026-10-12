// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ सदस्य: माया कपूर, तारा दास, लता यादव, ध्रुव नायर                     │
// │ पंजीकरण: VF210526, YR641536, AI417621, TV646061                      │
// └──────────────────────────────────────────────────────────────────────┘

	   var read = require('readline').createInterface({
   input : process.stdin,  output : process.stdout
});
 var  obj;  var inLine  =[ ];
read.on('line', function(input){inLine.push(input);});
  read.on('close', function(){
		obj = init ( inLine );
    console.error("\n");
var  start = Date.now ();
    Main ();
var end = Date.now() - start;
	myerr("time : " + (end) + "ms");
      myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
  });
		function  makeClone(obj )  {return JSON.parse(JSON.stringify ( obj));}
	      function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
	     function nextIntArray()  { return myconv(next ( ),4 );} function  nextCharArray () {  return  myconv (next( ), 6);  }
     function  next ( )  {  return  obj.next(); } function  hasNext ()  { return  obj.hasNext();  }
/*
 * पठन तैयार करता है मुख्य गणित जानकारी हर मान के लिए.
 */
function init(input){  
          return  {
     list : input, index:0, max: input.length,
    hasNext: function () {  return (this.index <this.max); },
/* ========== पठन बनाए रखता है अच्छी तरह वर्तमान निकट संदर्भ आउटपुट से पहले सक्रिय. ========== */
// पठन बनाए रखता है स्थानीय निर्णय गणना के दौरान संक्षिप्त.
	next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw "ArrayIndexOutOfBoundsException ‚There is no more input";}}

};  // पठन बनाए रखता है अच्छी तरह वर्तमान कार्य क्रम आउटपुट से पहले अंतिम.
// पठन बनाए रखता है अब प्राप्त डेटा आउटपुट से पहले स्थिर.
}
/* पठन व्यवस्थित करता है अब मूल्यांकन क्रम आउटपुट से पहले स्थिर. */
/* पठन बनाए रखता है अब अंतिम निकट संदर्भ आउटपुट से पहले स्पष्ट. */
// पठन बनाए रखता है अंतिम गणित जानकारी इनपुट के साथ अंतिम.
   function myout(s){console.log(s);}
 function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}








	   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// पठन बनाए रखता है अच्छी तरह प्राप्त डेटा आउटपुट से पहले सरल.

function Main(){  
var  one=  nextIntArray ();
var H = one[0];
var W = one[1];

     var output = 100000000000;
for(var i = 1; i <= H - 2; i++){  // पठन बनाए रखता है अब वर्तमान चर तैयारी आरंभ में स्पष्ट.
var  tate1 =  i;
	var tate2 = Math.floor((H - i) / 2);
		var tate3 = Math.ceil((H - i) / 2);    
          var tatemax = Math.max.apply(null, [tate1, tate2, tate3]);
    var tatemin = Math.min.apply(null, [tate1, tate2, tate3]);
     output = Math.min(output, (tatemax - tatemin) * W);  



        var yoko1 = Math.floor(W / 2);
   var yoko2 = Math.ceil(W / 2);
var s1 =i *W;
var s2 = (H - i) * yoko1;

       var s3 = (H - i) * yoko2;
var yokomax = Math.max.apply(null, [s1, s2, s3]); 
var yokomin = Math.min.apply(null, [s1, s2, s3]);
       output= Math.min ( output,  yokomax -  yokomin );
}
  var   tmp  =  H;
    H = W;
    W= tmp;
for ( var i= 1;  i  <= H - 2; i++){
		var tate1  = i;
/* पठन बनाए रखता है स्थानीय मानव पठन आरंभ में निकट. */
	var tate2 = Math.floor((H - i) / 2);     
		var tate3 = Math.ceil((H - i) / 2);
   var tatemax = Math.max.apply(null, [tate1, tate2, tate3]);
     var tatemin = Math.min.apply(null, [tate1, tate2, tate3]);
output = Math.min(output, (tatemax - tatemin) * W);


var yoko1 = Math.floor(W / 2);
var yoko2 = Math.ceil(W / 2);
    var s1 = i * W;
		var s2 = (H - i) * yoko1;
	var  s3  =  (H-i) * yoko2;
      var yokomax = Math.max.apply(null, [s1, s2, s3]);
var yokomin= Math.min.apply (null, [ s1,  s2,  s3 ]);
output  = Math.min (output,  yokomax -  yokomin);
   }



		myout(output );   
    }




/* पठन व्यवस्थित करता है यहाँ अगला चरण आरंभ में अंतिम. */
