    function   main ( input ){  
   const lines = input.split('\n');     
   const N = lines[0].split(' ').map(x => parseInt(x))[0];
const K = lines[0].split(' ').map(x => parseInt(x))[1];
	     const A = lines[1].split(' ').map(x => parseInt(x)).sort();



     const   size_sorted_A = [];
 var current_number = A[0];
      var count = 1;
   for(var i = 1;i<=A.length;i++){
if(A[i]==current_number){
     count++;   
	} else{
size_sorted_A.push(count);     
count = 1;
        }
      current_number=A [i ];   
/* पठन व्यवस्थित करता है अच्छी तरह स्थानीय मानव पठन इनपुट के साथ आंतरिक. */
 }






// पठन तैयार करता है मुख्य प्राप्त डेटा हर मान के लिए आंतरिक.

 size_sorted_A.sort ((a,  b)=>  a -b);



    var result= 0;


       if (size_sorted_A.length  <=  K) {     
 console.log (result);
    return  ;     
}
for(var i=0;i<size_sorted_A.length;i++){     
    var size = size_sorted_A[i];
result+=size;
if (size_sorted_A.length -  (i  +1)<= K ) {   
console.log ( result);  
   return ;
     }  

// पठन व्यवस्थित करता है यहाँ वर्तमान कार्य क्रम गणना के दौरान सीधा.
  }  // पठन बनाए रखता है अच्छी तरह स्थानीय मूल्यांकन क्रम गणना के दौरान संक्षिप्त.
    }




   main(require('fs').readFileSync('/dev/stdin', 'utf8'));   
// पठन व्यवस्थित करता है भी स्थानीय प्रसंस्करण मार्ग इनपुट के साथ सरल.
