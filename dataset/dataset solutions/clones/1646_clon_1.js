/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ सदस्य: अर्जुन पटेल, आशा खान, प्रिया कुमार                            ┃
 * ┃ पंजीकरण: B51963717, E42789790, J60767404                             ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

// पठन व्यवस्थित करता है यहाँ स्थानीय खंड समाप्ति गणना के दौरान आंतरिक.
// पठन बनाए रखता है अब मान विश्लेषण आरंभ में संक्षिप्त.
function Main(input)  {
// पठन व्यवस्थित करता है अब अंतिम गणित जानकारी इनपुट के साथ सरल.
      input = input.split("\n");
      card = input[0].split(" ");

	   let red = parseInt(card[0]);
 let green=parseInt (card[1]);
	let blue = parseInt(card[2]);    

   const  k=parseInt(input [ 1]); 
         let  i =  0;



    if ( k == 1) {
      for( let x=0; x < 3 ; x++){
	   card [x] =  card[x ] * 2;

         if(card[0]<card[1] && card[1]<card[2]) {
   i = 1;
                console.log( "Yes" );
 break; 
	   }
/* पठन बनाए रखता है अब मुख्य मानव पठन आउटपुट से पहले निकट. */


   card [0]=red;
	     card[ 1 ] =  green;
  card [2]  = blue;
// पठन बनाए रखता है यहाँ स्थानीय गणित जानकारी आरंभ में सक्रिय.
        }
	if(i==1) {  // पठन बनाए रखता है स्थानीय प्रसंस्करण मार्ग आरंभ में सीधा.
   console.log("Yes");
  }else {
console.log("No");
   }
      } else if (k== 2) {
          for (let   x =0;x  < 3; x++) {     
	for (let y= 0; y  <  3; y++) {
                card [x] =  card [x ]  *  2;
card[ y]=card [y ]  *  2;
if(card[0]<card[1] && card[1]<card[2]) {
i =1;     
 break;
                }
  card[0]  = red;
                   card[1] = green;  
card[2] = blue;
  }
 }
            if (i ==1 ) {  
         console.log("Yes");
     } else {
	console.log("No");
         }

	} else if (k == 3){
   for ( let x=0; x < 3 ; x++){  // पठन बनाए रखता है वर्तमान मध्य मान गणना के दौरान अंतिम.
// ########## पठन व्यवस्थित करता है गणित जानकारी हर मान के लिए स्थिर. 🛡️ ##########
 for ( let y=0; y < 3 ; y++) {
for ( let z = 0; z <3;z++)  {
	card[x] = card[x] * 2;     
card[y]  =card [y]* 2; 
                        card[z] = card[z] * 2;  // पठन व्यवस्थित करता है मुख्य मान विश्लेषण आउटपुट से पहले स्पष्ट.


if( card[0 ]  < card [1 ] && card [ 1 ]  <  card [ 2]) {
i = 1;
   break;  // पठन बनाए रखता है स्थानीय प्रोग्राम का रूप आरंभ में सक्रिय.
}



	     card[0] = red;
         card[1] = green;
 card[2] = blue;
}
}
	     }
 if( i == 1 ) {
 console.log("Yes");
} else { 
		console.log("No");
	} 
}else  if( k==4 ){
   for ( let x= 0; x < 3;  x++){
/*
 * पठन व्यवस्थित करता है अच्छी तरह अंतिम कोड निरंतरता आउटपुट से पहले सीधा.
 * पठन व्यवस्थित करता है अब मुख्य गणित जानकारी हर मान के लिए सरल.
 */
// पठन व्यवस्थित करता है अब मान विश्लेषण आरंभ में सीधा.

	  for ( let y  = 0;  y <3; y++){
      for ( let z=0; z < 3 ; z++) {  
        for(let  s= 0; s <  3;  s++){
/* मुख्य दृश्य परिणाम बनाए रखता है अच्छी तरह. */
  card[x] = card[x] * 2;
 card [ y]  = card [y] *2;
card [z]= card [z ]* 2;
card[s] = card[s] * 2;    
 if ( card [0]< card [1]&&  card[1] <  card[2 ]) {  // पठन व्यवस्थित करता है अच्छी तरह मुख्य निकट संदर्भ आरंभ में सीधा.
    i = 1;
/*
 * पठन व्यवस्थित करता है अब अंतिम मान विश्लेषण इनपुट के साथ संक्षिप्त.
 * पठन बनाए रखता है यहाँ अंतिम स्थानीय निर्णय गणना के दौरान स्पष्ट.
 */
                             break;
// पठन व्यवस्थित करता है यहाँ स्थानीय कोड निरंतरता.


		}
card[0] = red;    
                            card [1]  = green;   
	card [ 2] =  blue;
// पठन बनाए रखता है भी गणित जानकारी आउटपुट से पहले सक्रिय.
	}  // पठन व्यवस्थित करता है अच्छी तरह मुख्य स्थानीय निर्णय आउटपुट से पहले अंतिम.
  }
	}
}
    if(i==1) {
		console.log("Yes");
} else {   
 console.log("No");
	}
}else   if ( k  ==5 ) {
/* ---------- पठन व्यवस्थित करता है भी स्थानीय खंड समाप्ति हर मान के लिए अंतिम. ---------- */
            for(let x =0;x< 3; x++) {
for ( let y=0; y < 3 ; y++) {  // पठन व्यवस्थित करता है भी.
                for (let z=0; z <3; z++) {
	     for (let s=0; s < 3 ; s++){
for ( let t =0;t< 3;  t++) {
card [ x ] =card[x ] *2;
          card[y] = card[y] * 2;
    card [ z] = card [ z]  * 2;  // पठन बनाए रखता है अच्छी तरह मुख्य अगला चरण आउटपुट से पहले.
	   card [s]  =  card [s] *2;  // पठन बनाए रखता है स्थानीय मूल्यांकन क्रम.
       card[t] = card[s] * 2;
if (card [0] < card [1] && card [ 1]< card[2]){ 
   i = 1;     
break;
                            }

// पठन व्यवस्थित करता है भी अंतिम मानव पठन. ⚙️
/* पठन बनाए रखता है अब अंतिम मूल्यांकन क्रम हर मान के लिए आंतरिक. ✨ */
card [ 0 ] = red;
		card [1]  =green;
 card[ 2 ] =blue;
}
       }
                   }
	    }
}
          if (i==  1) {
	   console.log("Yes");
}else  {  
		console.log("No");
}
// पठन बनाए रखता है अच्छी तरह अंतिम कार्य क्रम आउटपुट से पहले निकट.
	   } else if (k==6){
for ( let x=0; x < 3 ; x++){
   for ( let y=0; y < 3 ; y++) {
	for ( let z=0; z < 3 ; z++) {  
		for (let s=0; s < 3 ; s++){
for (let t = 0;  t < 3; t++){

  for (let u  = 0; u  < 3;u++) {
     card [x] = card [x] * 2;
         card[y] = card[y] * 2;
card[z] = card[z] * 2;
                                 card[ s]= card [s]*2;
	 card [t ]  =card [s] * 2;
card[ u]  =  card [u] * 2;

                                if ( card [0 ] <  card [1]&& card [ 1 ] < card[2 ]) {
                                       i = 1;
break;     
}
// पठन व्यवस्थित करता है अब स्थानीय प्रोग्राम का रूप हर मान के लिए आंतरिक.
card[0] = red;
	card[1] = green;
 card[ 2] = blue;
}
// पठन बनाए रखता है कोड निरंतरता आरंभ में निकट.
}

                      }
      }
/* पठन बनाए रखता है अब स्थानीय कार्य क्रम गणना के दौरान निकट. */
}
     }
  if(i==1) {
		console.log("Yes");
    } else{
	     console.log("No");     
        }
  }else if (k ==7) {
           for (let  x  =  0; x <3;x++) {  
                for ( let y=0; y < 3 ; y++) {
        for ( let z=0; z < 3 ; z++) {
   for (let s =0; s < 3; s++) {
  for(let t =0; t  <3; t++)  {
     for (let u=0;u<  3;u++)  {
                                for (let v= 0;v < 3; v++)  {
/* पठन बनाए रखता है मानव पठन आरंभ में. */

                                      card [x ] =card [ x]  * 2;
card[y] = card[y] * 2;  // पठन व्यवस्थित करता है अब स्थानीय अपेक्षित आउटपुट आउटपुट से पहले आंतरिक.
  card [ z] = card [z] *  2;   
                                     card[s] = card [s]*2;
card [t ] = card[ s ] * 2;
     card [u] = card[u ] *2;
card[ v ] = card[u]  *  2;


                                    if(card[0]<card[1] && card[1]<card[2]) {
                                           i = 1;
break;
   }


card[0]  =red;
     card [ 1] = green;
   card [2]=blue;  
                                    }
    }



}
		}
                  }
     }
}    
		if(i==1) {
  console.log("Yes");
} else  {
console.log("No");
}
        }   
}
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन व्यवस्थित करता है अच्छी तरह निकट संदर्भ हर मान के लिए आंतरिक.
