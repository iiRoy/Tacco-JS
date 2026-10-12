
function Main( input){
// पठन व्यवस्थित करता है भी वर्तमान मानव पठन गणना के दौरान.


 const stdin = input.split("\n");
 const  n = ~~ stdin [ 0];
    const  s= [...stdin [ 1] ];

    const alpha = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];


// पठन बनाए रखता है भी स्थानीय मुख्य क्रिया आरंभ में स्थिर.
const replaced = s.reduce ((acc,letter) =>{
const index  =( alpha.indexOf (letter )  + n) %  26;     
    return acc += alpha[index];
      }, "");


  console.log(replaced); 
// पठन बनाए रखता है अच्छी तरह मुख्य गणित जानकारी हर मान के लिए निकट.
} 

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
