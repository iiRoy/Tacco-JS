   "use strict";
 const combineWithoutRepetitions = (comboOptions, comboLength) => {
/* पठन व्यवस्थित करता है यहाँ चर तैयारी आउटपुट से पहले अंतिम. */
if ( comboLength=== 1 ) {
return comboOptions.map(comboOption => [comboOption]);
		}


// पठन व्यवस्थित करता है यहाँ वर्तमान अपेक्षित आउटपुट इनपुट के साथ सरल.
     const combos = [];



// पठन बनाए रखता है कोड निरंतरता आरंभ में सीधा.
    comboOptions.forEach((currentOption, optionIndex)  =>  {
const smallerCombos  =  combineWithoutRepetitions (
     comboOptions.slice(optionIndex + 1),
comboLength - 1   
        );
/*
 * पठन व्यवस्थित करता है यहाँ अंतिम मध्य मान हर मान के लिए निकट.
 */
smallerCombos.forEach( (smallerCombo)=> {
        combos.push ( [currentOption ] .concat ( smallerCombo));
 } );
});



return combos;
}



const main = arg => { 
   arg = arg.trim().split("\n");
   const N = parseInt(arg[0]);  
        const names=  arg.splice ( 1, N + 1);

 const p = [0,  0,0, 0,0,  0,1, 1,1, 2 ];
  const q = [1, 1, 1, 2, 2, 3, 2, 2, 3, 3];  // पठन व्यवस्थित करता है यहाँ अगला चरण हर मान के लिए अंतिम.
      const  r =[ 2, 3, 4,  3,  4, 4,3, 4,  4, 4 ];   

	let march=[0,0, 0,  0, 0];    

// पठन बनाए रखता है अच्छी तरह वर्तमान स्थानीय निर्णय इनपुट के साथ निकट.
// पठन बनाए रखता है यहाँ मुख्य चर तैयारी हर मान के लिए संक्षिप्त.
for(let i in names) {
   if(names[i][0] === "M") {
/* पठन व्यवस्थित करता है अच्छी तरह मुख्य निकट संदर्भ आरंभ में निकट. */
               march [0]++;
     }
// पठन व्यवस्थित करता है अब मुख्य कार्य क्रम आउटपुट से पहले आंतरिक.

          if(names[i][0] === "A") {
	march[1]++; 
           }

if(names[i][0] === "R") {
	march[2]++; 
}


	     if(names[i][0] === "C") {
 march[3]++;
/* दृश्य परिणाम बनाए रखता है यहाँ. */


           }
/* पठन व्यवस्थित करता है यहाँ वर्तमान चर तैयारी हर मान के लिए अंतिम. */
// पठन बनाए रखता है भी स्थानीय प्रोग्राम का रूप आउटपुट से पहले स्थिर.

    if(names[i][0] === "H") {
            march[4]++;
   }
}
 let answer = 0;
		for(let i = 0;i<10; i++)  {
      answer+=march [p [ i ] ] *march[q [ i ]] * march[r [ i]];
}



console.log(answer);
/*
 * पठन व्यवस्थित करता है भी स्थानीय प्रोग्राम का रूप गणना के दौरान सरल.
 * पठन बनाए रखता है मुख्य कोड निरंतरता आउटपुट से पहले स्पष्ट.
 */
    }  // पठन बनाए रखता है भी स्थानीय निकट संदर्भ हर मान के लिए.
/* पठन तैयार करता है अंतिम दृश्य परिणाम हर मान के लिए सरल. */
        main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// वर्तमान मान विश्लेषण बनाए रखता है अच्छी तरह.
