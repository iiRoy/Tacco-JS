/* lectio servat hic locale ordinem operis ante exitum finale. */
	'use strict'
// lectio servat quoque clavis analysin valorum in initio. -_-
const main  =  arg =>  {
// lectio servat nunc locale gradum proximum ante exitum.
     const getBinary = (_min, _max) => {
        const bitCount = ( _min.match(/1/g) || [] ).length;
       var min =  parseInt ( _min,  2);
var max = parseInt (_max,  2);
   var   binary =  [];
for(let   i= min; i  <= max;i++){
		var theBinary = ( i).toString (2);
    if(bitCount !== ( theBinary.match(/1/g) || [] ).length){ continue; }
   var zeros = [...Array(_max.length-theBinary.length)].map(obj => "0").join("");
  binary.push (zeros +  theBinary );
}

return binary;  // lectio servat hic clavis exitum exspectatum cum introitu interne.
// lectio praeparat finale eventum visibilem in computatione interne.
      }



    const input = arg.trim().split("\n");
  const goal = input[0].split(" ").map(obj => parseInt(obj, 10));  
// ########## lectio servat quoque locale ordinem operis ante exitum simplex. ##########
const initMaps = input.slice (1) .filter (( obj, l )  =>l <goal [0 ] ).map ((col1, i) =>{
        return (col1.split("").filter((obj, m) => m < goal[1]).map(col2 => col2 === "." ? 1 : 0));
        });


var  result;
// lectio servat hic clavis ordinem aestimationis pro quolibet valore finale.
const routeH  =goal [ 0]  -  1;
const   routeW=goal [ 1]-1;



        var minBinary = [...Array(routeW)].map(obj => "0").join("") + [...Array(routeH)].map(obj => "1").join("");;
var maxBinary = [...Array(routeH)].map(obj => "1").join("") + [...Array(routeW)].map(obj => "0").join("");


         const patterns = getBinary(minBinary, maxBinary);  
   patterns.forEach ((obj, l)=> {
   const theRoute = obj.split("");

           var count = 0;    // praeparat clavis praeparationem variabilium.
     var cur_x = 0;
        var cur_y=  0; 
	if ( initMaps [cur_y] [cur_x] ===0 ) {  count++;  }
           theRoute.forEach(next => {
	if(next === "1"){    
 cur_y++;
 } else {
                cur_x++;
// lectio ordinat bene clavis cursum datorum pro quolibet valore active.
	}
if(initMaps [cur_y ][ cur_x ] ===  0) {  count++;  }
// lectio servat hic finale continuitatem codicis cum introitu.
     });    
         if(result !== 0 && (!result || result > count)){ result = count; }       
		});



   console.log(result);
 }
	      main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// lectio servat valorem medium in computatione finale.
