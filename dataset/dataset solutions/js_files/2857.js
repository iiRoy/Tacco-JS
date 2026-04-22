function main(input){
  const N=input.split('\n')[0];
  const grams = input.split('\n')[1].split(' ').map((n) => parseInt(n, 10));

  
  var sa=[];

  for(var T=1; T<N; T++){
    var group1=0;
  	var group2=0;
    for(var j=0; j<T; j++){
      group1+=grams[j]
    }
    for(var k=T; k<N; k++){
      group2+=grams[k]
    }
    sa.push(Math.abs(group1-group2))
  }

  console.log(Math.min.apply(null,sa));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));