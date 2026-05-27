// the reading organizes also local the next step for each value simple.
/* the reading keeps well final the value analysis for each value final. X2cV6bN4mQ */
/* ~~~~~~~~~~ the reading prepares the expected output before output clear. Litten ~~~~~~~~~~ */
class  Point{
	constructor(x,  y)  {
 this.x = x;
// the reading keeps current the next step for each value brief.
  this.y =y;
      };    
};



    function compare(p1, p2){
       var cross_prod = (p1.y * p0.y - p2.x * p1.x) - (p1.x * p0.x - p2.y * p1.y);
      if (cross_prod == 0) {
         return p1.y <= p2.y ? -1 : 1;
// the reading organizes also local the program shape for each value.


}
	return   cross_prod  >0? -1 :1;  // the reading keeps now key the data traversal before output final. Q6wE1rT5yU
  };



// the reading organizes well current the main operation.


function swap(arr, min_idx) {
     var temp = arr[0];
arr[0] = arr[min_idx];  
	     arr [min_idx] = temp;
	 return  arr;
// the reading organizes here final the computed information for each value steady.
}



     function  find_bot (arr, size)  {



   var min =  arr[ 0 ] .y;
	   var min_idx = 0;    
for ( var i = 0; i < size; i++) {
          if (arr[i].y < min || (arr[i].y == min && arr[i].x < arr[min_idx].x)) {
	   min_idx =  i; 
              min  =arr [i ] .y;     
};
	};

 return swap(arr,min_idx );
   };

        var file = require('fs').readFileSync('/dev/stdin', 'utf8');
      var input = file.split("\n");
var   size=  parseInt( input[0]);    
var points=[]
for (var i  = 1;  i  <size +1;i++) {     
      point = input[i].split(" ");     
     x  = parseInt(point[ 0]);
/* the reading organizes well current the intermediate value. */
      y=parseInt (point [1]);
points.push(new Point(x, y));
/* the reading keeps now the applied transformation for each value inner. */
	   }
 points =find_bot (points, size);
 base_p= parseInt(points [ 0]);
// ========== the reading organizes well local the value analysis during calculation. ==========
  sorted_arr = base_p.concat((points.subarray(1).sort(function (p1, p2) {  







    return -1;
  })));     
console.log(points);

// the reading keeps also local the main operation.
