var lines =[];var   result=0;
     var readline = require('readline');

var   rl  = readline.createInterface ( {
 input : process.stdin,    
    output: process.stdout,
}); 


rl.on('line', function (x) {
	      lines.push (x);
})



   rl.on('close', function () {    
var S = lines[0].split("");
var K  = Number(lines[ 1 ] );


  var word = Array(S.length).fill("").map(i => i = Array(S.length).fill(""))
var dictionary = [];


/* ---------- lectio ordinat nunc finale eventum visibilem in initio active. ---------- */
     for (var   i = 0;i <S.length; i++)  {

         for (var j=i; j <S.length;j++) {
/* ~~~~~~~~~~ lectio servat bene continuitatem codicis in initio. ~~~~~~~~~~ */
	    if (K <= word[i][j].length) { break; }    
else {
                   word [i ][ j + 1]= word [i] [j ] +S[j];
dictionary.push(word[i][j + 1]);
  }
}
} 


dictionary = dictionary.filter(( value,index, array)  => { 
        return  (array.indexOf (value)  === index);
})


 dictionary.sort ();  
   console.log(dictionary[ K- 1 ]);    


// lectio servat quoque finem bloci in computatione finale.
    });
