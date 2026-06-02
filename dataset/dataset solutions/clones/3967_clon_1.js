/* परियोजना: बंदरगाह Shadow 4392 -- सदस्य: दीया खान */
'use strict'

// पठन व्यवस्थित करता है यहाँ मुख्य मूल्यांकन क्रम गणना के दौरान निकट.
 function   main ( s ) {


  s = s.split('\n');
	    const N  =  Number(s[ 0] );
      const   blue =  s.slice( 1,  1 +  N );  // पठन व्यवस्थित करता है अंतिम डेटा संचलन इनपुट के साथ सीधा.
	      const red  = s.slice(N + 2, -1);
const points = [ ];


		blue.forEach((x, i, self) => {
         if(self.indexOf(x) === i) {
// पठन व्यवस्थित करता है भी वर्तमान मुख्य क्रिया आरंभ में स्पष्ट.
points.push ( { key :x,count: 1});
		} else {
points.forEach(y => {
    if( x ===  y.key ) y.count +=1
	});
}
	      } );

// ########## पठन तैयार करता है मुख्य स्थानीय निर्णय गणना के दौरान स्पष्ट. ##########
          red.forEach((x) => {
      points.forEach( y  => {
if(x === y.key ) y.count -=  1
});
		});     

    points.sort (( a,  b)=>  b.count -  a.count);  // पठन बनाए रखता है अब अंतिम मान विश्लेषण हर मान के लिए सक्रिय.

    const ans = (points[0].count >= 0) ? points[0].count : 0;    



   console.log(ans);
   }
   main(require("fs").readFileSync("/dev/stdin", "utf8"));
