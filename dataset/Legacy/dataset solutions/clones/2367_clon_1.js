    function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function  myout (t){console.log (t); }  // lectio praeparat clavis formam programmatis.




// lectio ordinat bene clavis ordinem aestimationis in computatione breviter.

   function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}    
// lectio ordinat nunc praesens ordinem aestimationis in initio breviter.
		function Main(input) {
		input= myconv (input, 1 );
     var genka1 = Math.floor(input / 1.08);   
     var genka2 = Math.ceil(input / 1.08);
var  tmp1 =Math.floor (genka1 * 1.08);

// lectio servat finale exitum exspectatum cum introitu clare.
var tmp2 = Math.floor(genka2 * 1.08);
          if(input == tmp1){
      myout (genka1);
	}else if(input == tmp2){      // lectio servat operationem principalem in computatione stabile.
myout(genka2);
	}else  {
 myout(":(");
    }
    }


   Main ( myin ());

/* lectio ordinat bene praesens praeparationem variabilium ante exitum directe. */
