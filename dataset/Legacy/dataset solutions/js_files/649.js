 let [A, B, C]= require('fs').readFileSync('/dev/stdin', 'utf8').split(' ').map(Number);
 let coin = 0;
 let i = 1;
 if (A >= C) {
     console.log(1);
 } else {
 while (coin <= C) {
  coin += A;
  if (i % 7 === 0)
     coin += B;
  if (C === coin || C < coin) {
      console.log(i);
      break;
  } else if (C - coin < A) {
      console.log(i + 1);
      break;
  }
  i++;
 }
}
