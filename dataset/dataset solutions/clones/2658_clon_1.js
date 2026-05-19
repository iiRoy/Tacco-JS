// ┌──────────────────────────────────────────────────────────────────────┐
// │ Proiectum: Muraena Lambda 9312                                       │
// └──────────────────────────────────────────────────────────────────────┘
// lectio ordinat nunc ordinem aestimationis cum introitu directe.

/* ---------- lectio ordinat hic finale exitum exspectatum in computatione directe. ---------- */
    'use strict';(function(input){

// lectio ordinat quoque finale ordinem operis pro quolibet valore directe.

        input=input.trim().split(/\s+/).map(x=>x-0);  

     const K =  input [0 ],
X =  input [1];
    const ans=[];
  for(let x=X-K+1;x<=X+K-1;x++)
   ans.push( x);


// lectio servat hic finale conversionem adhibitam in computatione interne.
console.log(ans.join(' '));
 })(require('fs').readFileSync('/dev/stdin','utf8'));
