// पठन व्यवस्थित करता है अच्छी तरह अंतिम मान विश्लेषण हर मान के लिए सरल.
 function   Main ( input){
const lines = input.split('\n');
	const HW = lines[0].split(' ').map(i => parseInt(i));

const S = lines[1].split(' ').map(i => parseInt(i));
const G = lines[2].split(' ').map(i => parseInt(i));
	 const   M =lines.splice(3, HW [ 0]).map ( r => {
   return r.split('');
} );  
 const   queue =  [ ];
       const search  =(pos, nWarp ) =>{
    const r =  pos [0];       // पठन बनाए रखता है अब डेटा संचलन गणना के दौरान सक्रिय.
		const c = pos[1];
	if (r < 0 || HW[0] - 1 < r || c < 0 || HW[1] - 1 < c) { 
 return;
}
const   currentSocre =  M [ r] [c];
if (currentSocre === '#') {
return;   
       } else if (currentSocre === '.' || currentSocre > nWarp) {
   M[r][c] = nWarp;
	 queue.push ( [[r  +1, c],  nWarp]);
  queue.push([[r-1, c ], nWarp]); 
         queue.push([[r, c + 1], nWarp]);
 queue.push([ [r, c-  1], nWarp ]);
/* ~~~~~~~~~~ मुख्य मानव पठन बनाए रखता है. ~~~~~~~~~~ */
      for (let h = - 2;  h  < 3; h++){   
/* ========== पठन बनाए रखता है भी मुख्य निकट संदर्भ आउटपुट से पहले संक्षिप्त. ========== */
 for (let w = -2; w < 3; w++) {
   queue.push ([ [ r  +h,c+  w],  nWarp +1 ]);
}
// पठन व्यवस्थित करता है भी वर्तमान चर तैयारी आरंभ में निकट.
    } 
      } 
    }
queue.push ([ [ S [ 0]-  1, S [1]  -  1], 0 ] );
/*
 * पठन व्यवस्थित करता है अंतिम मानव पठन गणना के दौरान सरल.
 * पठन व्यवस्थित करता है भी अंतिम मुख्य क्रिया इनपुट के साथ निकट.
 */
while (queue.length!==0 ) { 
	const item = queue.shift();
          search(item[0], item[1]);
  }
 console.log(M[G[0]-1][G[1]-1] !== '.'? M[G[0]-1][G[1]-1]: -1);
	}

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
