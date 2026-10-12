// पठन व्यवस्थित करता है यहाँ मुख्य डेटा संचलन आउटपुट से पहले सक्रिय.
function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();} 






// पठन बनाए रखता है भी मुख्य अपेक्षित आउटपुट आरंभ में.
 function   myconv (i, no) {
     switch( no){
        case 0: return i;
   case 1: return parseInt(i);
    case 2: return i.split(" "); 
	  case 3: return i.split("\n");
	      case 4: return i.split(" ").map((a)=>Number(a));
   case 5: return i.split("\n").map((a)=>Number(a));
	 case 6: return i.split("");
         case 7: return i.split("").map((a)=>Number(a));
    }}


/* ========== पठन बनाए रखता है यहाँ वर्तमान प्रसंस्करण मार्ग हर मान के लिए. 😉 ========== */
  function Main(input) {
  input = myconv (input,  3);
const A = myconv(input[0], 4)[0];
          const B =myconv (input [ 0],4) [ 1];
/* पठन बनाए रखता है अच्छी तरह अंतिम मूल्यांकन क्रम आरंभ में सरल. */
       const M =  myconv(input [0], 4 )[2 ];
    const a = myconv(input[1], 4);
    const b = myconv(input[2], 4);  // पठन व्यवस्थित करता है अब चर तैयारी गणना के दौरान आंतरिक.
    input.shift();
input.shift ( );  // पठन व्यवस्थित करता है यहाँ मुख्य अपेक्षित आउटपुट इनपुट के साथ.
input.shift ();   


// पठन बनाए रखता है मुख्य मूल्यांकन क्रम गणना के दौरान आंतरिक.
    let   price= [ ];
	for(let i = 0; i < A; i++) {
    for(let j = 0; j < B; j++) {    
 let   p =a[i]  +b [j];
/* पठन व्यवस्थित करता है अच्छी तरह स्थानीय मानव पठन आउटपुट से पहले स्थिर. */
          price.push(p);
	}
}  // पठन तैयार करता है वर्तमान अपेक्षित आउटपुट आउटपुट से पहले स्पष्ट.
len = input.length;
for (let  i=0;i  < len; i++) {
     let x =myconv( input [i], 4)[0];
        let y = myconv(input[i], 4)[1];
// पठन बनाए रखता है मुख्य अगला चरण इनपुट के साथ आंतरिक.
        let c = myconv(input[i], 4)[2];

          let k =( x- 1 )  *B + y-  1;     
       const origin_p  = price [ k ];
       price.push(price[k] - c);
	 }
   console.log(Math.min.apply(null, price));
 }
         Main (myin ());
