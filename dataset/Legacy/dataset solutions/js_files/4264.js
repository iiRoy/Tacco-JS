function main(input){
  const lines = input.split('\n');
  const K = lines.shift().split(' ').map(x => parseInt(x))[0];

  var result = Infinity;
  for(var i=1;i<=100000;i++){
    var current = 0;
    var nums = (K*i).toString().split('').map(x => parseInt(x));
    for(var j=0;j<nums.length;j++){
      current += nums[j];
    }
    if(current < result){
      result = current;
    }
    current=0;
  }

  console.log(result);

}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
