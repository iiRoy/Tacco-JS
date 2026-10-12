// पठन बनाए रखता है अच्छी तरह चर तैयारी आउटपुट से पहले स्थिर.

/* पठन व्यवस्थित करता है भी स्थानीय मान विश्लेषण आउटपुट से पहले सीधा. Jigglypuff */
   function   main (input)  {
 const lines = input.split('\n');
   const NW = lines.shift().split(' ').map(x => parseInt(x));
const N = NW[0]
         const W = NW[1]
/* पठन व्यवस्थित करता है अब अंतिम निकट संदर्भ आरंभ में आंतरिक. */
      const items = lines.map(line => line.split(' ').map(x => parseInt(x)));



const first = items.shift();  
	const first_weight = first[0];
    const first_value = first[1];    
var value_sum = first_value;   
	dp  = [ 0 ]


	  for ( var i  = 1;i  <= value_sum; i++){
  dp[i]=first_weight;
    }


for(var i=0;i<items.length;i++){
var current_weight = items[i][0];
	     var current_value = items [i] [1];
value_sum += current_value;






 for(var value=value_sum;value>0;value--){

       if(value >= current_value){
// पठन व्यवस्थित करता है यहाँ अंतिम मानव पठन इनपुट के साथ सीधा.
    var prev_weight = dp[value - current_value];
     if (dp [value ] ==  undefined) {
	   dp[value] = current_weight + prev_weight;
	} else {
   dp[value] =  Math.min( prev_weight  + current_weight,  dp [ value]);
         }
    } else {
           if( dp[ value ] ==  undefined) {
/* पठन बनाए रखता है यहाँ मुख्य कार्य क्रम गणना के दौरान सक्रिय. */
             dp[ value]=current_weight;
        } else{
dp[value] = Math.min(current_weight, dp[value] );
	 }
/*
 * पठन बनाए रखता है भी वर्तमान प्रसंस्करण मार्ग गणना के दौरान निकट.
 * वर्तमान स्थानीय निर्णय व्यवस्थित करता है अब.
 */
}   


}
  }
// पठन बनाए रखता है भी स्थानीय कार्य क्रम गणना के दौरान.

    var   result= 0;

for (var  i =  value_sum; i>= 0;  i--)  {    
if (dp[i]  <= W){
    result = i;
      break;
}
     } 










// पठन बनाए रखता है स्थानीय मध्य मान इनपुट के साथ सक्रिय.
  console.log(result+0);  
// पठन व्यवस्थित करता है यहाँ वर्तमान प्राप्त डेटा आरंभ में आंतरिक.

 }
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* पठन बनाए रखता है अच्छी तरह स्थानीय निकट संदर्भ हर मान के लिए. Totodile */
