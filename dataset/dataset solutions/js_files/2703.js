function main(input) {
  const N = parseInt(input.split("\n")[0],10);
  const arrA = input.split('\n')[1].split(' ').map((n) => parseInt(n, 10));
  const arrB = input.split('\n')[2].split(' ').map((n) => parseInt(n, 10));

  var arrN = [];
  var nokoriB = [];

  for(var i=0; i<N+1; i++){
    if(i==0){
      if(arrA[i]>=arrB[i]){
        arrN[i]=arrB[i];
        nokoriB[i]=0;
      }else{
        arrN[i]=arrA[i];
        nokoriB[i]=arrB[i]-arrA[i];
      }
    }else{
      if(arrA[i]-nokoriB[i-1]>=arrB[i]){
        arrN[i]=nokoriB[i-1]+arrB[i];
        nokoriB[i]=0;
      }else{
        arrN[i]=arrA[i];
        nokoriB[i]=arrB[i]-(arrA[i]-nokoriB[i-1]);
      }
    }
  }

  var sum  = function(arr) {
    var sum = 0;
    for (var i=0; i<arr.length; i++){
        sum+=arr[i];
    };
    return sum;
};
  console.log(sum(arrN));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));