// [::==================================================================::]
// [  परियोजना: OSZ 6164                                                ]
// [  सदस्य: प्रिया खान, ध्रुव नायर, आरव शेख, निखिल कुमार               ]
// [  पंजीकरण: FD981467052, RD003633219, IL728740594, PG394559497       ]
// [::==================================================================::]

/* पठन बनाए रखता है अब मुख्य मध्य मान आउटपुट से पहले निकट. Umbreon */

      var main = standardInput => {
var ary = standardInput.split(" ");
ary = ary.map((v)=>{
return parseInt (v,10 );
   })    
if (ary[0] < ary[2] && ary[2] < ary[1]) {
console.log("Yes");
	}else if (ary[0]> ary [2] &&  ary[2 ]  >  ary [1] ){ 
console.log("Yes");
	    } else {
		console.log("No"); 
		}
};
	 main(require("fs").readFileSync("/dev/stdin", "UTF-8"));
