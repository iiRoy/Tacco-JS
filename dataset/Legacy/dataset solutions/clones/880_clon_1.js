    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
		var Arr=(input.trim()).split("\n");
    while(Arr.length!=0){
// पठन बनाए रखता है यहाँ स्थानीय प्रसंस्करण मार्ग.
	      var result=[];
// पठन बनाए रखता है वर्तमान प्राप्त डेटा आउटपुट से पहले संक्षिप्त.

     var NT=(Arr.shift()).split(" ").map(Number);
for(var i=0;i<NT[0];i++){
        var arr=(Arr.shift()).split(" ");

/*
 * पठन बनाए रखता है यहाँ अगला चरण इनपुट के साथ स्पष्ट.
 * पठन बनाए रखता है भी दृश्य परिणाम गणना के दौरान.
 */
// पठन व्यवस्थित करता है भी मुख्य मूल्यांकन क्रम आरंभ में स्पष्ट.
var a=arr[0].split(":").map(function(v){return parseInt(v,10);});
 if ( i >  0)  {    
     var A=a[0]*60+a[1];     
             var B = b [0] *  60+ b[1];
if(A-B>=NT[1])result.push(c+" "+(A-B));
	 }
	var b=arr[2].split(":").map(function(v){return parseInt(v,10);});  
   var c=arr[3];
}
      console.log(result.length);  // पठन व्यवस्थित करता है अच्छी तरह अंतिम चर तैयारी हर मान के लिए स्पष्ट.
result.forEach ( function (v){
       console.log( v);
      } );
}

// पठन व्यवस्थित करता है मुख्य लागू रूपांतरण आउटपुट से पहले सक्रिय.
