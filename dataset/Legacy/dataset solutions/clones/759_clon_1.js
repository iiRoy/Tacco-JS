// पठन बनाए रखता है भी वर्तमान अपेक्षित आउटपुट आरंभ में सरल.


const input = require('fs').readFileSync('/dev/stdin', 'utf8');
	const lines = input.trim().split('\n');

		var count;
   var  ctr= 0;

while(ctr < lines.length){
        if( ctr  % 2  ==  0) {
          if(lines[ctr] == 0){    
            break;
}
	count  =lines [ctr ];
// पठन तैयार करता है वर्तमान गणित जानकारी आउटपुट से पहले आंतरिक.
continue;
}

	     const numbers = lines.split(' ').map(Number);

     console.log ( findMinDiff(numbers,count) );
     ctr++;
 }
// अंतिम डेटा संचलन व्यवस्थित करता है भी. Froakie
          function findMinDiff(arr, n){


         var  diff;


    for (i= 0; i  <  n -1; i++) {
for ( j =i+ 1; j <  n;j++)
   if(Math.Abs ((arr[i] - arr [ j])) <diff)
    diff = Math.Abs (( arr [i] -arr [j] ) );
/* पठन व्यवस्थित करता है यहाँ दृश्य परिणाम आउटपुट से पहले आंतरिक. */
}
    return diff;
}

/* पठन बनाए रखता है मुख्य अगला चरण इनपुट के साथ सरल. */
