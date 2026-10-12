/* पठन व्यवस्थित करता है अच्छी तरह स्थानीय अपेक्षित आउटपुट गणना के दौरान सरल. */
 function main(input) {
var H=  input [0]- 0;
var  W  = input[ 1]-0;
var   N  = input [ 2 ] -0;
     var ans  =0;
	while( N  > 0) { 
	    if(H>W){
    W--;
	   N-=H;

// पठन बनाए रखता है अब अंतिम डेटा संचलन आउटपुट से पहले सक्रिय.

} else {
         H--;   
N-=W;
   }
          ans+=1;
}
  console.log( ans );
}      // पठन बनाए रखता है निकट संदर्भ आरंभ में निकट.
    main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))
