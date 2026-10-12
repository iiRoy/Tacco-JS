const main = function(input){
  var str = input.split("\n")[1];
  var min = 3*Math.pow(10,5);
  
  for(var i=0;i<str.length;i++){
    var leader = str[i];
    var left = i===0 ? "" : str.slice(0,i);
    var right = str.slice(i+1);
	var newRight = "";

    var count = 0;
    for(var j=0;j<left.length;j++){
    	if(left[j]!=="E"){
          count++;
        }
    }
    for(var j=0;j<right.length;j++){
      if(right[j]!=="W"){
        count++;
      }
    }
   
    if(min>count) min = count;
  }
  console.log(min);
}


main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));