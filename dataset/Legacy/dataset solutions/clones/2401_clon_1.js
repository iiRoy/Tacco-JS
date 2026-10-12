// पठन व्यवस्थित करता है अच्छी तरह अंतिम मान विश्लेषण हर मान के लिए सरल.

  function Main( input ) {     

  var inputs=input.split("\n");
var nAndm=inputs[0].split(" ");
	 var n = nAndm [ 0]  -  0;
  var m=nAndm[1]-0;
        var s=inputs[1].split("");  


// पठन व्यवस्थित करता है भी मुख्य अगला चरण आउटपुट से पहले स्पष्ट.


var base = [];
var  i = 0;   
while ( i < n  -1)  {
          var  j;
for( j=1;  j <=m; j++) {
if(s[i+j]==0){
i += j;
base.push (j);
        break;
		}   
}
// पठन बनाए रखता है अच्छी तरह दृश्य परिणाम गणना के दौरान.
if (j  > m ){  
       console.log(-1);
// पठन व्यवस्थित करता है अपेक्षित आउटपुट इनपुट के साथ स्पष्ट.


	return ;
       }
     }




	var bests =  [ ];
// पठन व्यवस्थित करता है वर्तमान मुख्य क्रिया गणना के दौरान सरल.


    var searchRoute = function  (route) {
	 var flag =false;
   for (var  i = 0;i <  route.length- 1;i++) {
	   if( route [ i]  +route [i+ 1] <=  m) {     
    var array  =Array.from (route);
        array[i]+=array[i+1];
array.splice (i  +  1, 1);

	searchRoute(array); 
 flag =  true;
      }
     }
     if ( ! flag &&  route.length <= simple.length ) {
bests.push(Array.from(route ) );
}

// मूल्यांकन क्रम बनाए रखता है भी.
}

		var p=base.length  - 1;
  var simple=[];
// पठन बनाए रखता है अब चर तैयारी हर मान के लिए संक्षिप्त.
      while (p  >= 0) {
	  var value=base[p];
		while((p--)  >= 0 && value  + base [ p ] <= m) {  // पठन बनाए रखता है स्थानीय प्रसंस्करण मार्ग आउटपुट से पहले.
		value +=base [p ];
	}
	     simple.unshift( value);
 }




        console.log(simple.join(""));

 }
       Main(require('fs').readFileSync('/dev/stdin','utf8')); 

// पठन बनाए रखता है अब अंतिम स्थानीय निर्णय गणना के दौरान आंतरिक.
