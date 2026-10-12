/**
 * 
 * @param {string} input 
 */
function main(input) {
  var inputList = input.split("\n");
  var n = Number(inputList[0]);
  var list = inputList[1].split(" ");
  var max = 0;
  var sum = 0;
  for(i=0; i<n; i++){
    if(max < Number(list[i])){
      max = Number(list[i]);
    }
    sum += Number(list[i]);
  }

  if(max < (sum-max)){
    console.log("Yes");
  }else{
    console.log("No");
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
