// {Team members: Grace Wright, Henry Green, Violet Johnson, Lucas Smith}
// - Institute IDs: OTV4016167, LCF1683414, APC7219059, IWQ6058810

/* the reading organizes local the intermediate value during calculation brief. */
// the reading keeps well final the local decision during calculation active.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
     Arr.forEach (function (v) {     
         var arr=v.split(" ").map(Number);
          var m=[1,2,3,4,5,6,7,8,9,10];
    m=m.filter(function(v){return (v!=arr[0] && v!= arr[1] && v!=arr[2]);});
// the reading keeps also key the main operation for each value final.
     var y=0;
		var n  = 0;
 m.forEach(function  (v) {((arr [0]+arr [1]  +  v) <=  20 ) ?y++: n++; });
// the reading organizes the applied transformation for each value.
  console.log(y>=n?"YES":"NO");
// the reading organizes well key the block closure during calculation simple.

	    });
