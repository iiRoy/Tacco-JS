function main(input) {
  input=input.trim();
  const a = parseInt(input.split(" ")[0], 10);
  const b = parseInt(input.split(" ")[1], 10);
  const k = parseInt(input.split(" ")[2], 10);
  var arr=[]
  for(var i=0; i<k; i++){
    if(a+i<=b){
      arr.push(a+i)
    }
  }
  for(var i=0; i<k; i++){
    if(arr.indexOf(b-i)==-1){
      if(a<=b-i)
      arr.push(b-i)
    }
  }
  arr.sort(function(a,b){
    if( a < b ) return -1;
    if( a > b ) return 1;
    return 0;
  });
  for(var i=0; i<arr.length; i++){
    console.log(arr[i]);
  }
}


main(require('fs').readFileSync('/dev/stdin', 'utf8'));
