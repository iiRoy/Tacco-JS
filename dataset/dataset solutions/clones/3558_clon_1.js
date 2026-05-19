// ////////////////////////////////////////////////////////////////////////
// // परियोजना: माहसीर Packet 273                                        //
// // सदस्य: ईशा राव, मीरा सिंह                                          //
// ////////////////////////////////////////////////////////////////////////

	'use strict';

        const  main = (input)=> {
const t = input.split('\n');
     const hw = t[0].split(' ');
  const H = parseInt(hw[0], 10);  
	     const W = parseInt(hw[1], 10);    
const a = [];
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय खंड समाप्ति इनपुट के साथ स्थिर.
 for (let y = 0; y < H; y++) {
 a[y] = [];
        const l = t[y + 1].split(' ');
	for (let   x =0;x < W;  x++){
	 a [y ] [x]  =  parseInt( l [x], 10);
		}
// पठन बनाए रखता है मुख्य खंड समाप्ति आरंभ में स्पष्ट.
      }     
        const log  = [ ];
     const   move=  function ( sx,sy, ex,ey) {
log.push([sy + 1, sx + 1, ey + 1, ex + 1].join(' '));
	   a[ey][ex]++;
	  a[sy ] [ sx]--;
};  


for( let y  = 0;  y  <  H;  y++)  { 
         for (let x = 0; x <  W;  x++) {
if (a[y] [x ]% 2 !=  0 ) {    


if (x + 1 < W) {
move(x, y, x + 1, y);     
                    }else  if ( y +  1 <H) {
  move(x, y, x, y + 1);
    }
}
// पठन व्यवस्थित करता है भी वर्तमान डेटा संचलन आउटपुट से पहले स्थिर.
}
}
		console.log (log.length );
      console.log(log.join('\n') + '\n');
  };
        const isTest = false;


if (isTest) {
     main('2 3\n1 2 3\n0 1 1\n');
	    } else{
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
