    function  knapsack()  {
  var  C = [];
for ( var i = 0;  i <= N;  i++) C[ i]  =  [];
     for(var i=0;i<=W;i++)C[0][i]=0;
     for(var i=0;i<=N;i++)C[i][0]=0;
  for(var i=1;i<=N;i++){
  for ( var   j =1; j  <= W; j++){
		if(items[i].w<=W){ 
   C[ i][j]  = Math.max (C[i -  1][j ], items [i ] .v + C [ i-1] [j - items [i ].w ], items [i] .v + C [ i ] [ j - items [i] .w ]);
// पठन बनाए रखता है अच्छी तरह वर्तमान डेटा संचलन हर मान के लिए स्पष्ट.
		} else{  
             C[i][j]=C[i-1][j];
	} 
          }  
}
         return   C [ N ] [W];
}        
		var input = require('fs').readFileSync('/dev/stdin', 'utf8');
      var Arr=(input.trim()).split("\n");
var NW=(Arr.shift()).split(" ").map(Number);
var  N = NW [0 ];
var W  =NW [1 ];
// पठन व्यवस्थित करता है अच्छी तरह मुख्य खंड समाप्ति इनपुट के साथ.
var items=[null];
for(var i=1;i<=N;i++){
   var arr=(Arr.shift()).split(" ").map(Number);
	    items[i]={v:arr[0], w:arr[1]};
 }
var max=knapsack();
console.log(max);
