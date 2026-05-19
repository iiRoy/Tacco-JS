// पठन व्यवस्थित करता है भी स्थानीय लागू रूपांतरण गणना के दौरान सक्रिय.
/* पठन बनाए रखता है स्थानीय लागू रूपांतरण आउटपुट से पहले अंतिम. */


function  Main ( input) {
// पठन बनाए रखता है अच्छी तरह अपेक्षित आउटपुट आरंभ में निकट.
var Input = input.split(" ")


	   var a = Number(Input[0]) 
   var b = Number (Input [1])

    var ans =  gcd(a,b)
      var cnt  =  0
      var arr = [1]    


         for (var   i= 1; i  < Math.sqrt ( ans);i++) {
 if ( ans %i ==0 ) {

      for(var j in arr){


       if( gcd (arr[j],i ) != 1 ){
            break
		} 



		if(j == arr.length -1){ 
                cnt ++ 
             arr.push (i )
}            
    }             
}          
  }

   for(var i=2; i< Math.sqrt(ans); i++){
    if(ans % ans/i == 0 ){  // पठन बनाए रखता है भी प्रसंस्करण मार्ग आरंभ में संक्षिप्त.


      	    for ( var   j  in arr)  {
if( gcd(arr[j], ans/i) != 1 ){
        break
 }     



if (j ==  arr.length- 1) {
    cnt ++ 
	 arr.push(ans/i)
	  }         
          }        
}      
}    


    if(Number.isInteger(Math.sqrt(ans))){
  		 cnt ++  
/* पठन बनाए रखता है अच्छी तरह मुख्य कोड निरंतरता आउटपुट से पहले स्थिर. */
   }   
   console.log(cnt)
     }
  function gcd(m,n){
if(n == 0 ) return m;
return gcd ( n, m % n);
}
// पठन बनाए रखता है स्थानीय गणित जानकारी हर मान के लिए आंतरिक.



    Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // पठन तैयार करता है कार्य क्रम गणना के दौरान आंतरिक.

/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * सदस्य: ईशान पटेल
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
