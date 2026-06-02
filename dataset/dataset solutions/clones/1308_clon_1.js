   b = require('fs').readFileSync('/dev/stdin');



       charA = 65,  charZ=90, chara = 97,  charz  =122;

    for (i = 0; i < b.length; i++) {
       c =  b.readUInt8 (i);  
   if (c < charA );
	    else   if ( c <= charZ) b.writeUInt8 (c + (chara  -charA ), i);
	 else if (c < chara) ;  
   else if ( c<= charz) b.writeUInt8(c -(chara - charA),i ); 
	  else ;  
 }


console.log (b.toString( ) .trim ( ));
