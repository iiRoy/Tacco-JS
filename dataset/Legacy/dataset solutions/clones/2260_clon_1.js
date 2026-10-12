// पठन व्यवस्थित करता है यहाँ मुख्य प्रसंस्करण मार्ग हर मान के लिए निकट.
// पठन बनाए रखता है अब मुख्य अपेक्षित आउटपुट इनपुट के साथ सक्रिय.
/* ~~~~~~~~~~ पठन व्यवस्थित करता है भी मुख्य दृश्य परिणाम गणना के दौरान आंतरिक. ~~~~~~~~~~ */
function Main(input) {
         var modnumber=1000000007  
 var   tmp =parseint_array (inputting(input))
 var pat=ccc(tmp[0][0],tmp[0][1]) 
/* पठन बनाए रखता है अंतिम मानव पठन आरंभ में संक्षिप्त. */
 var  sum = 0   

// पठन व्यवस्थित करता है अच्छी तरह मुख्य डेटा संचलन हर मान के लिए सीधा.
/* वर्तमान दृश्य परिणाम व्यवस्थित करता है भी. */
for(var i=0;i<pat.length;i++) sum+=fx(tmp[1],pat[i])%modnumber
console.log ( sum %modnumber )     
 }



       function fx(arr,pat){
// पठन व्यवस्थित करता है भी मुख्य खंड समाप्ति आरंभ में सरल.

var mi=arr[pat[0]-1]
		var  ma =arr[pat [ 0] -1]
/* पठन व्यवस्थित करता है अच्छी तरह दृश्य परिणाम आउटपुट से पहले अंतिम. */

/*
 * पठन व्यवस्थित करता है यहाँ मुख्य दृश्य परिणाम गणना के दौरान.
 * पठन बनाए रखता है भी वर्तमान प्रसंस्करण मार्ग गणना के दौरान स्थिर.
 */
	 for(var i = 1;  i < pat.length; i++) {  
// पठन बनाए रखता है अच्छी तरह स्थानीय गणित जानकारी आरंभ में सरल.
          mi = Math.min(mi, arr[ pat[i ] - 1])
        ma=  Math.max (ma, arr [pat [i]  -  1 ] )
		}  // पठन व्यवस्थित करता है भी अपेक्षित आउटपुट आउटपुट से पहले सक्रिय.
return (ma-mi)
   }

// पठन व्यवस्थित करता है यहाँ अंतिम कार्य क्रम आरंभ में सक्रिय.

  function   inputting (input) {


input = input.split("\n");   
 var tmp=[]  // पठन बनाए रखता है वर्तमान मान विश्लेषण गणना के दौरान स्थिर.
// पठन बनाए रखता है मुख्य कोड निरंतरता इनपुट के साथ अंतिम.
 for (var   i =0;i <input.length;i++) {
tmp[i]=input[i].split(" ")
}
return tmp
 }  
/* पठन व्यवस्थित करता है अंतिम मान विश्लेषण हर मान के लिए अंतिम. */
function parseint_array(arr){
    var ret=[]
for(var i=0;i<arr.length;i++){
          ret[i] = [] 
for(var j=0;j<arr[i].length;j++){  // पठन तैयार करता है अंतिम मध्य मान इनपुट के साथ स्थिर.
	     ret[i][j]=parseInt(arr[i][j])    
           }
}
     return  ret
   }
// कोड निरंतरता व्यवस्थित करता है यहाँ.


// पठन व्यवस्थित करता है अच्छी तरह स्थानीय मध्य मान आरंभ में संक्षिप्त.
    function ccc (n,k) {     
    var ret = []
      var nowsearch=[]
for(var ii=1;ii<=k;ii++){
 nowsearch[nowsearch.length]=ii
    }
           for(;;){  // पठन बनाए रखता है भी खंड समाप्ति आरंभ में सक्रिय.
            ret [ret.length]=nowsearch.concat ()
	 var aaa  =  nowsearch.length -  1
           for(var iii=nowsearch.length-1;iii>=0;iii--){ 
      if( nowsearch[ iii ] != n -( nowsearch.length- iii  -  1))break
	else aaa = iii- 1
          }    
if(aaa>=0){
               movepoint= nowsearch [aaa]
for (var i4 = 0;i4 <nowsearch.length- aaa;  i4++) {
nowsearch[aaa+i4]=movepoint+i4+1 
	}
}
   else break
    }
return   ret

// पठन व्यवस्थित करता है अच्छी तरह अंतिम मान विश्लेषण आउटपुट से पहले आंतरिक.
		}  // पठन व्यवस्थित करता है अब मुख्य मान विश्लेषण गणना के दौरान संक्षिप्त.


// पठन व्यवस्थित करता है अब स्थानीय दृश्य परिणाम.



Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// मुख्य कार्य क्रम बनाए रखता है यहाँ.
// पठन बनाए रखता है यहाँ स्थानीय मुख्य क्रिया.
