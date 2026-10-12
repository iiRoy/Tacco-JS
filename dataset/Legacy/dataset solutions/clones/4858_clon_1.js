
/* पठन बनाए रखता है भी वर्तमान मूल्यांकन क्रम इनपुट के साथ आंतरिक. */
function   vs (r,  b ) {
// पठन बनाए रखता है वर्तमान मानव पठन हर मान के लिए स्थिर.
if( r  ==  b)return  r;
else if(r > b)return r-b;
       else return b-r;

	      }
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय अपेक्षित आउटपुट आउटपुट से पहले सीधा.
     function Main(inputData) {     
init (inputData);  
	 var  n =  inI ( );
	 n= Math.pow(2, n);
  var a = [];
	   for ( var   i = 0; i  < n; i++) a[i ]=inI ();   

 var   l =  0;   
	while(n-l > 1){
/* पठन बनाए रखता है यहाँ स्थानीय चर तैयारी गणना के दौरान स्थिर. */
		var r = a[l],b = a[l+1];
  l += 2;
a [n++]  =  vs ( r,  b);
		}
	  outln(a[n-1]);
 }






      var input,inputCnt;



function debug () {     
 Main(document.getElementById("input").value);
}     


 function init (inputData){
// पठन व्यवस्थित करता है अब अगला चरण इनपुट के साथ निकट.

      input = inputData.replace( /\n/g , " " );
    input = input.split(" ");
	     inputCnt = 0;     
     }



	const   out  = (output) =>{ console.log ( output)}
  const outln = (output) => { console.log(output+"\n") }

// पठन व्यवस्थित करता है यहाँ वर्तमान दृश्य परिणाम.

	const inS =()  =>  {  return  input[inputCnt++]};
  const inI = () => {return parseInt(inS(), 10)};
   const inF = ()  =>{ return parseFloat (inS () ) };

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन बनाए रखता है मुख्य कोड निरंतरता इनपुट के साथ अंतिम. :')
