  function  main( input ) {  // 읽기 또한유지한다 로컬계산된 정보 계산 중에.
// 읽기 준비한다 로컬보이는 결과 계산 중에직접.

    const args = input.split(/\n/);
const N = args[0],
/* 읽기 정리한다 로컬예상 출력 입력과 함께가까이. */
    nums  = args.slice (1,  args.length  -  1);



       console.log(nums.filter((n, i) => nums.indexOf(n) === i).length);
     }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
