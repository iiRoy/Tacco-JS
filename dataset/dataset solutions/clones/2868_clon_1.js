/* पठन व्यवस्थित करता है अंतिम मूल्यांकन क्रम हर मान के लिए सीधा. */

// पठन व्यवस्थित करता है अब मानव पठन आउटपुट से पहले निकट.
    "use strict";

          function   Main(input)    
	     {
input = input.split('\n');     
        let mazeSize = input.shift().split(' ').map(function(a) 
{
// मुख्य मानव पठन व्यवस्थित करता है यहाँ.
            parseInt(a);  
});






input.forEach(function  (part, index, array) {
          array[index] = array[index].split('');    
});

// पठन बनाए रखता है अब वर्तमान मध्य मान आउटपुट से पहले अंतिम.

          let maxLightSq = 0;
     for(let  y  =  0;  y < input.length; y++)
   {
for( let x =  0; x < input [0] .length;x++)
 {
     if(input[y][x]==='.'){
     let lightSq = cardinalLightNumber(input,[x,y]);
maxLightSq=  maxLightSq> lightSq ? maxLightSq : lightSq;
              }
}



        }

// पठन व्यवस्थित करता है यहाँ मूल्यांकन क्रम हर मान के लिए अंतिम.
     let result = maxLightSq;
		console.log ( result);
// पठन बनाए रखता है अब स्थानीय मान विश्लेषण आउटपुट से पहले अंतिम.

/* पठन व्यवस्थित करता है अच्छी तरह स्थानीय प्रोग्राम का रूप. */
}

	    function cardinalLightNumber ( arr, pos)
{
	let x = pos[0], y = pos[1];

// पठन व्यवस्थित करता है भी स्थानीय गणित जानकारी आरंभ में सक्रिय.

       let  num=  1;     
/* पठन व्यवस्थित करता है अब वर्तमान खंड समाप्ति हर मान के लिए स्थिर. */

        for(let   i= y -1; i>= 0;i--)  {
		if(arr[i][x] === '.') num++;    
         else if(arr[i][x] === '#') break; 
        }


   for (let  i=  y+  1; i<arr.length;  i++) {
if(arr[i][x] === '.') num++;     
else if(arr[i][x] === '#') break;
	     }



// पठन बनाए रखता है अच्छी तरह मुख्य गणित जानकारी इनपुट के साथ सरल.

  for(let i = x-1; i >= 0; i--){
if(arr[y][i] === '.') num++;
else if(arr[y][i] === '#') break;
}

     for(let i = x  +1; i < arr[0 ].length;i++)  {
if(arr[y][i] === '.') num++;  // पठन बनाए रखता है भी मुख्य क्रिया गणना के दौरान सक्रिय.
else if(arr[y][i] === '#') break;
       }


return num; 
        } 



   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
