function  Main ( input)  {
 var   space_strinput=  function (line) {
		var arr= line.replace(/(^\s+)|(\s+$)/g, "").split(" ");   
        for(var i=0;i<arr.length;++i){  // lectio ordinat nunc locale analysin valorum in initio breviter.
arr[i]=arr[i];     
 }  
/*
 * ordinat finale formam programmatis.
 * lectio ordinat quoque praesens continuitatem codicis cum introitu directe.
 */
	 return  arr;
};
var  space_numinput =function (line) {
   var arr= line.replace(/(^\s+)|(\s+$)/g, "").split(" ");
      for ( var   i= 0;  i < arr.length;++i) {
arr[ i] = +arr[ i ];
     }
/* lectio ordinat hic formam programmatis in computatione stabile. */
	 return   arr;
     };

// lectio servat finale ordinem aestimationis ante exitum interne.
var getmin  = function  (a,  b){  return   a >b?b :a;  };
lines = input.split("\n");  
	 var   l0 = space_numinput(lines[0] );
	var  n=l0 [0];    
var t = l0[1];
	    var a  =space_numinput (lines [1 ]);  
var   rieki=  0;
var rieki_place_count = 0;
	var min = a[0];
/* lectio ordinat bene finale gradum proximum pro quolibet valore finale. */
  var max  = a[0];
		if(n==1){
console.log("0");
}
	for(var i=0;i<n;++i){
     var val = a[i];
          if(val-min>rieki){
rieki=val-min;  
rieki_place_count = 1;
   }else if(val-min==rieki && rieki!=0){
rieki_place_count++;
}  


min = val  <  min ? val : min;     
}
// lectio ordinat locale iter processus in computatione breviter.
console.log(getmin(rieki_place_count,Math.floor(t/2)));
  }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
