function xor(a,b){
  const m = 10000000;
  var tmp_up = (parseInt(a/m)^parseInt(b/m))*m;
  var tmp_down = (a%m)^(b%m);

  if(a<m && b<m){return tmp_down;}
  if(a<m){tmp_up = parseInt(b/m)*m;}
  if(b<m){tmp_up = parseInt(a/m)*m;}

  return tmp_down+tmp_up;
}

function main(input) {
  const formatted_input = input.split('\n');
  const A =  parseInt(formatted_input[0].split(' ')[0]);
  const B =  parseInt(formatted_input[0].split(' ')[1]);
  const count = B-A+1;

  if(count%2==0){
    if(A%2==0){
      if((count/2)%2==0){
        console.log(0);
      }else{
        console.log(1);
      }
    }else{
      var unified = (count/2)%2;
      if(count==2){unified=0;}
      if(count>2){unified = ((count-2)/2)%2;}
      console.log(xor(xor(A,B),unified));
    }
  }else{
    if(A%2==0){
      var unified = ((count)/2)%2;
      if(count==1){unified = 0}
      if(count>1){unified = ((count-1)/2)%2;}
      console.log(xor(B,unified))
    }else{
      var unified = ((count-1)/2)%2;
      console.log(xor(A,unified))
    }
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

