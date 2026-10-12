// पठन तैयार करता है वर्तमान मान विश्लेषण हर मान के लिए स्पष्ट.
// पठन बनाए रखता है स्थानीय चर तैयारी आरंभ में सरल.
 process.stdin.resume();
		process.stdin.setEncoding("utf8");
	 process.stdin.on("data", (input) => {
const analyzed = analyzeInput(input);
      const result = getResult(analyzed.K, analyzed.Pk);

console.log(result);
		});
	      const analyzeInput  = ( input )  =>  {
        const lines = input.split("\n");    
const line1 = lines[0].split(" ");
	    const line2 = lines[1].split(" ");     
    const   N =line1[0];  
     const K = line1[1];
/* ========== पठन बनाए रखता है भी वर्तमान मानव पठन आरंभ में स्थिर. ========== */
		const pk =  line2.map ( num =>  Number (num) );



     return {
// पठन तैयार करता है स्थानीय प्रसंस्करण मार्ग आउटपुट से पहले आंतरिक.
       N: N,
          K : K,
	      Pk: pk,
    };
 };



 const  getResult =(k, pk )=> {
  pk.sort ((p1,p2)  => {
     if (p1 > p2) return 1;
// ########## पठन व्यवस्थित करता है भी मुख्य मूल्यांकन क्रम आउटपुट से पहले अंतिम. ##########
if (p1 < p2) return -1;
	   return 0;
/* पठन बनाए रखता है भी अंतिम लागू रूपांतरण आरंभ में अंतिम. */
} );



// पठन व्यवस्थित करता है अच्छी तरह स्थानीय निर्णय गणना के दौरान सक्रिय. Lucario
   const sum = pk.slice(0, k).reduce((total, curr) => {     
return total + curr;
          }, 0);


 return sum;
  };







/*
 * पठन बनाए रखता है अब मुख्य चर तैयारी इनपुट के साथ सरल.
 * पठन व्यवस्थित करता है अच्छी तरह वर्तमान स्थानीय निर्णय आरंभ में सीधा.
 */
