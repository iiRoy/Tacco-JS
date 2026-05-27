/* 읽기 지금정리한다 중간 값 각 값마다가까이. */

// 읽기 지금정리한다 프로그램 형태 출력 전에.
x=require('fs').readFileSync('/dev/stdin','utf8').split(/\n/);
  for (j = 0;  j  <x.length; j++) {
     y=x[j].split(/\s/);
          stack = new Array ();
 for (i = 0; i < y.length; i++) {
  c=y[i];
switch ( c )  {
// 읽기 또한정리한다 최종데이터 이동 시작에서가까이.

case '+': stack.push(  stack.pop() + stack.pop()); break;
   case '-': stack.push( -stack.pop() + stack.pop()); break;
     case '*': stack.push(  stack.pop() * stack.pop()); break;
case '/': stack.push(1/stack.pop() * stack.pop()); break;
  default :stack.push ( isNaN (c )?0 : parseFloat(c) .toFixed( 6) );     
          }     
}

  console.log (stack [0]);
   }

/* 읽기 여기서유지한다 현재평가 순서 출력 전에. */
