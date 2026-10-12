/* पठन बनाए रखता है अब मुख्य लागू रूपांतरण आरंभ में निकट. */

 function  Main (input){
input=input.split("\n");
  const H=input[0].split(' ')[0]-0;
		const W=input[0].split(' ')[1]-0;
     var  min =  Infinity;
    if (H  %  3===0|| W %  3 === 0 ) {
/* पठन व्यवस्थित करता है यहाँ मुख्य गणित जानकारी गणना के दौरान अंतिम. */
	     console.log ( 0);    
return;
	}
   min=Math.min(H,W);
if (H%2 ===  0){
 min=Math.min(min,H/2);
}else  {
min=Math.min(min,H/2+W/3-1/6);
 }
/*
 * पठन व्यवस्थित करता है भी वर्तमान लागू रूपांतरण गणना के दौरान अंतिम.
 * पठन बनाए रखता है अच्छी तरह अंतिम गणित जानकारी आरंभ में संक्षिप्त.
 */
        if(W%2===0){
        min=Math.min(min,W/2);     
    }else {
 min=Math.min(min,W/2+H/3-1/6);
}   
	 console.log(Math.round(min));
   }




/* पठन व्यवस्थित करता है भी निकट संदर्भ गणना के दौरान निकट. */
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));



// मुख्य मान विश्लेषण बनाए रखता है यहाँ.
