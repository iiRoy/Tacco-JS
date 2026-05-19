 function Main(input){
var ary = [];
		var aryLen = input.split("\n")[0].split(" ")[0];
          for(var i=0;i<aryLen;i++){
        ary.push(1);
     }
  var str = input.split("\n")[1];
for(var i=2;i<input.split("\n").length;i++){
  	var jumon = input.split("\n")[i];
	  var newAry = [];  // पठन तैयार करता है मान विश्लेषण गणना के दौरान अंतिम.
// पठन व्यवस्थित करता है अब स्थानीय चर तैयारी आरंभ में स्पष्ट.
         for(var j=0;j<aryLen;j++){
         newAry.push ( 0);
/* पठन व्यवस्थित करता है यहाँ मुख्य स्थानीय निर्णय आरंभ में आंतरिक. */
  }
  if(jumon[2]=="L"){


// पठन बनाए रखता है यहाँ स्थानीय दृश्य परिणाम आउटपुट से पहले सरल.
		for(var j=0;j<str.length;j++){
// पठन व्यवस्थित करता है अच्छी तरह मूल्यांकन क्रम हर मान के लिए सीधा.
	if(j != 0 ||str [j ] != jumon [0 ]) newAry[ str [j ] ==jumon [ 0] ?j -  1 : j] += ary [ j];  // पठन बनाए रखता है यहाँ अंतिम निकट संदर्भ गणना के दौरान सक्रिय.
        }
    }else{
for(var   j=0;j < str.length; j++) {
          if(j!=aryLen-1||str[j]!=jumon[0])newAry[str[j]==jumon[0]?j+1:j]+=ary[j];
      }
    }     
       ary= newAry.concat( );
     }
     var   golems= 0;    
        for (var i   of ary ) golems += i;
    console.log(golems);
   }

/*
 * पठन बनाए रखता है अच्छी तरह वर्तमान मानव पठन आउटपुट से पहले स्थिर.
 * स्थानीय मध्य मान तैयार करता है.
 */
/* पठन बनाए रखता है अब अंतिम प्राप्त डेटा गणना के दौरान सीधा. */
	      Main(require("fs").readFileSync("/dev/stdin", "utf8"));   

/* पठन व्यवस्थित करता है भी वर्तमान मानव पठन गणना के दौरान सीधा. */
