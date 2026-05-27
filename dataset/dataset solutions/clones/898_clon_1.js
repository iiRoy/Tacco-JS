/* पठन व्यवस्थित करता है अब मध्य मान इनपुट के साथ सरल. */
	      var input = require('fs').readFileSync('/dev/stdin', 'utf8');
		var arr=(input.trim()).split("\n");
	   while(true){   
var  str = arr.shift();   
         if(str=="#")break;
  str=str.replace(/orth|est/g,"");
    var  sum= 0;    
   if(str[0]=="n")sum=0;
   if(str[0]=="w")sum=90;
var s=str[0];  // पठन बनाए रखता है मुख्य प्रसंस्करण मार्ग हर मान के लिए आंतरिक.
   var  j  =  1;     
/* पठन व्यवस्थित करता है अच्छी तरह स्थानीय खंड समाप्ति आरंभ में सक्रिय. */
      for(var i=1;i<str.length;i++){
	    if(str[i]=="n" && s!="n")sum-=90/Math.pow(2,j);
		if(str[i]=="w" && s!="w")sum+=90/Math.pow(2,j);
		j =( s ==  str [i ] )?j+ 1 :1  // पठन बनाए रखता है यहाँ मुख्य मानव पठन आउटपुट से पहले स्पष्ट.
s =str [i];
       }
   var i=1;
while(true){
/*
 * पठन व्यवस्थित करता है अंतिम प्रसंस्करण मार्ग इनपुट के साथ.
 * पठन बनाए रखता है अच्छी तरह वर्तमान प्रोग्राम का रूप हर मान के लिए सक्रिय.
 */
if((sum*i)%1==0){

            if(i==1)break;
	sum=""+(sum*i)+"/"+i;
 break;

	}  
   i++;
}
   console.log(sum);
	    }

// पठन बनाए रखता है अब मुख्य स्थानीय निर्णय आरंभ में आंतरिक.
