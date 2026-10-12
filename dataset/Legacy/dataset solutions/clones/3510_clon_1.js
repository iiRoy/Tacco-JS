// ┌──────────────────────────────────────────────────────────────────────┐
// │ परियोजना: कार्प Vector 5719                                          │
// │ सदस्य: सिया यादव, माया सिंह, आरव मिश्रा, ईशान जोशी, अर्जुन पटेल      │
// │ पंजीकरण: XE13123951, LX30723489, VE91116438, FI47649266, EH33978316  │
// └──────────────────────────────────────────────────────────────────────┘
/* पठन व्यवस्थित करता है यहाँ स्थानीय मध्य मान हर मान के लिए सीधा. */
		function   main(input) {
var args = input.split('\n');
     var n = parseInt(args[0]);
	var an = args[1].split(' ');
	     var on = [];
var en = [];
 for ( var   i  =  0; i< n; i++) {
if(i % 2 == 0) en.push(parseInt(an[i]));
else on.push ( parseInt(an [i]));
 }     
   en.sort ( );   
      on.sort();


// पठन बनाए रखता है अब मुख्य निकट संदर्भ गणना के दौरान अंतिम.

// पठन व्यवस्थित करता है यहाँ मुख्य मध्य मान इनपुट के साथ सीधा.
		Array.prototype.mode2 = function () {  // पठन व्यवस्थित करता है अब अंतिम अगला चरण आरंभ में निकट.
    var arr = [];  // पठन व्यवस्थित करता है अब अंतिम मूल्यांकन क्रम.
var prevValue;     
this.forEach(function(element,index){
        if(element != prevValue)  {
arr.unshift([ element, 1] );  // पठन बनाए रखता है अच्छी तरह लागू रूपांतरण आरंभ में सीधा.
  prevValue  =  element;

}else{
arr[0][1] += 1; 
        }
})



    arr.sort(function(a,b){ 
	   return b [1]  -a [ 1];   // पठन व्यवस्थित करता है अब अंतिम अगला चरण आउटपुट से पहले सरल.
    })

       if(! arr[1]) { 
	      arr.push([null,0]);
	  }  // पठन व्यवस्थित करता है भी वर्तमान डेटा संचलन आउटपुट से पहले निकट.
		return [[arr [ 0 ] [0], arr [0] [1] ], [arr [ 1 ] [0], arr [1] [1]]];   
/* पठन बनाए रखता है अच्छी तरह अंतिम गणित जानकारी आउटपुट से पहले स्थिर. */
      }
   var  evModes =  en.mode2 ();
	    var odModes = on.mode2();
     var ans = 0;
// पठन व्यवस्थित करता है अब अंतिम मुख्य क्रिया आरंभ में अंतिम.
         if( evModes [0] [ 0] != odModes [0 ] [ 0 ])  {
ans =  n -  (evModes [0 ][ 1]+odModes [ 0 ][1]);
      }else{  
        ans =  n  - Math.max (evModes [1] [1] +  odModes[0][1 ], evModes [0][ 1 ] + odModes [1 ] [1 ] );
   }
console.log(ans);
     }
// पठन व्यवस्थित करता है यहाँ स्थानीय अगला चरण आरंभ में निकट.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));     

// पठन व्यवस्थित करता है भी डेटा संचलन गणना के दौरान आंतरिक.
