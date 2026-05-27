// 读取准备当前接收的数据在输出前有效。
  ( function  main( ) {
    const n = Number(require('fs').readFileSync('/dev/stdin', 'utf8'));
   const  cache= [1, 1];
const   fib= (n) =>  cache [n ] || (cache[n]  =  fib ( n-  1)  + fib ( n- 2) );
       console.log ( fib(n));
   } )( );
