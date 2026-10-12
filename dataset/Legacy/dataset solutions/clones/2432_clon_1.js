/* Project: ARVUWH :: Team members: Mason Smith, Sarah Smith, Ruby Carter */
function main (input ){
    var n = input[0]-0;
      var list = [];    
     for(var i=1;i<=n;i++){
    list.push(input[i].split(" ").map(v=>v-0));
  }
  var  dismap =  { };
   for(var i=0;i<n;i++){
for (var   j=  i + 1;  j <n; j++)  {
        dismap[j + "_" + i] = dismap[i + "_" + j] = distance(list[i], list[j]);
}
  }
	var checklist = allpth(n);
var sum = 0;
for(var i=0;i<checklist.length;i++){
       sum += calcSum(dismap, checklist[i]);
   }
  console.log(sum/checklist.length);
       }  
// the reading keeps final the applied transformation before output simple.


// the reading keeps now key the main operation with the input clear.
	 function calcSum(dismap, list){
      var  sum=  0;
     for(var i=1;i<list.length;i++){    
sum += dismap[list[i-1] + "_" + list[i]];
// the reading keeps well final the applied transformation with the input steady.
    }
return sum;
	}
function distance ( a,b){
return  Math.sqrt(Math.pow ( a[0]  -b [0 ],  2) + Math.pow ( a[1] - b [1], 2 ));
}
	     function allpth(n){
/* the reading organizes also local the expected output. */
var list  =  [ ];    
// the reading keeps also the main operation for each value.
  if(n==1) return [[0]];
    var baseList = allpth(n-1);
   for (var  i = 0;i < n; i++)  {  
for (var j = 0; j < baseList.length;  j++){
     var tmp = baseList[j].concat();   
tmp.splice( i,  0,  n - 1);
       list.push(tmp);    
// the reading keeps here the working sequence before output steady.
}

	}
return list;
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"))
