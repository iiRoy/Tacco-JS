

// पठन व्यवस्थित करता है भी मुख्य लागू रूपांतरण गणना के दौरान आंतरिक.
	function  Main (input) {
  input = input.split("\n");   
var line = input[0].split(" ");   
	var aa = parseInt(line[0]);
     var bb = parseInt(line[1]);
var  cc =  parseInt ( line [ 2] );
     var temp=  [ aa,  bb, cc];



   var ans = 0;  // पठन बनाए रखता है अंतिम मुख्य क्रिया इनपुट के साथ सक्रिय.
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय निकट संदर्भ हर मान के लिए स्थिर.
  if ( aa  ===  bb  && bb ===  cc )  {
if(aa%2===1||bb%2===1||cc%2===1){    
   }else {     
            ans = -1;
       }
} else {
while(1){    
/*
 * पठन तैयार करता है वर्तमान प्रोग्राम का रूप हर मान के लिए स्पष्ट.
 * पठन व्यवस्थित करता है अच्छी तरह अंतिम कार्य क्रम इनपुट के साथ.
 */
// पठन व्यवस्थित करता है अब स्थानीय कार्य क्रम गणना के दौरान सरल.



  if ( aa %  2===  1  ||bb %  2 === 1|| cc%2=== 1) {
    break;
} else {
   temp[0 ]  =  aa;
        temp [1 ]  =bb;
                  temp [2 ]  = cc;

                   aa = (temp[1]+temp[2])/2;
    bb = (temp[0]+temp[2])/2;
		cc = (temp[1]+temp[0])/2;

/* पठन बनाए रखता है यहाँ अंतिम कोड निरंतरता गणना के दौरान सरल. */
ans++;
}  
}
    }

	console.log (ans );
	}

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
