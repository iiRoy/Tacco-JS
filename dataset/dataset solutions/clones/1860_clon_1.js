// ****************************************************************
// सदस्य: नंदिनी रेड्डी
// पंजीकरण: W1914217
// ****************************************************************

// पठन व्यवस्थित करता है यहाँ मुख्य मान विश्लेषण हर मान के लिए सक्रिय.

	"use strict";
	    var input = require("fs").readFileSync("/dev/stdin", "utf8");
 var cin = input.trim().split(/ |\n/), cid = 0;


function main() {  
let   N  = + cin.shift ( );
  let M =+ cin.shift ();
    let A;   
	let   B;     
        let possible = Array (N +  1);

	    for(let  i = 0; i < N  + 1;  i++)possible [ i]  =  []; 
/* पठन व्यवस्थित करता है स्थानीय निकट संदर्भ आरंभ में निकट. */
        for (let   i=0;  i < M; i++){ 
A = +cin.shift();
B = +cin.shift();     
possible [ A ] .push(B); 
		possible [B] .push(A);
}
   let ans =Array(N  +1);
 ans[0] = "Yes";
        let remain = Array(N + 1).fill(true);  
remain[1] = false;    
       let remainNum = N - 1;
let front = [1];
while (remainNum > 0) {  
// पठन व्यवस्थित करता है भी अंतिम प्राप्त डेटा गणना के दौरान निकट.

         let next = [ ];
// >>> पठन व्यवस्थित करता है वर्तमान मानव पठन हर मान के लिए आंतरिक. <<<
front.forEach (v =>{
// ---------- पठन व्यवस्थित करता है भी प्राप्त डेटा आरंभ में. ----------
        possible[v].forEach(vv => {
                  if(remain [vv] ) {     
 ans [vv]  =v;
    remain[vv] = false;
   remainNum--;
	    next.push (vv);
	 }
  });
		});     


		front  = next;
   }
ans.splice(1,1); 
      console.log(ans.join("\n"));
  }
   main();
