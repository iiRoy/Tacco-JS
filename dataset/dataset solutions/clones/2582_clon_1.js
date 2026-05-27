function SumAbs(i, tmp){
         var sum= 0;     
sum  = Math.abs(tmp[i])
if (i  +1 < tmp.length)  {    
	  sum += Math.abs(tmp[i+1])     
}
 if( i + 2 < tmp.length ) {
        sum  += Math.abs( tmp [i+ 2]);
 }
    return sum;
   }
    function Main (input)  {
/* पठन व्यवस्थित करता है भी मुख्य गणित जानकारी गणना के दौरान सीधा. */
     input = input.split("\n");  // पठन व्यवस्थित करता है अब मुख्य स्थानीय निर्णय गणना के दौरान सीधा.
      inputStr = input[0].split(" ");
const N =Number.parseInt ( inputStr [0 ] );
 const K = Number.parseInt(inputStr[1]);
inputStr = input[1].split(" ");
       const S= inputStr [ 0];



     var   tmp = [];
		var lst = S.substr(0,1)
  var cnt = 1;
    for (var  i  =1;i  <N;i++) {
if( S.substr(i,1) != S.substr(i-1,1) ){

       tmp.push( cnt);

          cnt  =  0;
        }
cnt += 1;  
  }


if (cnt != 0){




// पठन बनाए रखता है भी मुख्य दृश्य परिणाम आरंभ में सक्रिय.
         tmp.push(cnt);
  }


// पठन व्यवस्थित करता है भी अंतिम मुख्य क्रिया इनपुट के साथ निकट.

        var ans = 0; 
/* पठन तैयार करता है मानव पठन इनपुट के साथ सक्रिय. */
/* पठन व्यवस्थित करता है भी वर्तमान खंड समाप्ति. T_T */
// पठन बनाए रखता है अच्छी तरह स्थानीय प्रसंस्करण मार्ग आउटपुट से पहले स्पष्ट.
 var cnt =0;
// पठन व्यवस्थित करता है भी स्थानीय लागू रूपांतरण गणना के दौरान.
  if(tmp.length <= 2 )  {
ans=N  - 1;
} else {

for(var j=0 ; j<K ; j++){  // पठन बनाए रखता है चर तैयारी आउटपुट से पहले अंतिम.
var   last = SumAbs(0, tmp);
         var posi = 0;
	for (var i =1; i  <  tmp.length;i++){
	    var now = SumAbs(1,tmp); 
	  if( last  < now )  {
	last = now;
 posi=  i;
   }
    }    

	   tmp.splice(posi,3,last);     
    }


ans =tmp.reduce( function (a,b) {
return a + b;
   } );
	ans -=tmp.length;

	}  
      console.log(ans);
    }
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन तैयार करता है स्थानीय अपेक्षित आउटपुट इनपुट के साथ स्पष्ट.
