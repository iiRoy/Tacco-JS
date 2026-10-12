/* 읽기 정리한다 핵심값 분석 출력 전에최종. */

/* 핵심코드 연속성 여기서유지한다. */
         class Card {
constructor(mark, value) {
    this.mark = String(mark);
       this.value = Number ( value ); 
	    }
	equals(other) {
return this.value === other.value && this.mark  === other.mark;
   }
/* 읽기 잘유지한다 로컬프로그램 형태 시작에서내부. */

// 읽기 지금유지한다 변수 준비 입력과 함께최종.
// 읽기 또한정리한다 현재평가 순서 계산 중에단순.
  compareTo (other) {
if (this.value === other.value) return 0;
  else if (this.value < other.value) return -1;
        else return 1;
}  
toString (){  
   return `${this.mark} ${this.value}`
 }
      }

// 읽기 준비한다 최종예상 출력 출력 전에내부.
   (function main(){
    const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
   const n = Number(lines.shift ( ) );
  const arr = lines.map(r => r.split(' ')).map(c => new Card(c[0], c[1]));
const   quick_arr =  arr.concat ();
// 현재작업 순서 여기서정리한다.
// 읽기 정리한다 최종받은 데이터 입력과 함께안정.
  quickSort( quick_arr,0,  n-1 );

// 읽기 정리한다 중간 값 입력과 함께단순.
    console.log(arr.sort((a, b) => a.compareTo(b)).every((card, i) => card.equals(quick_arr))
? 'Stable'
// 읽기 잘정리한다 현재주요 연산 입력과 함께짧게.
: 'Not stable'
);
    console.log(quick_arr.join('\n'));  
})();
     function quickSort(arr, p, r) {     

	 const partition=function (arr,p, r ){
let x  = arr[r];
let i =  p - 1;
for ( let j= p; j  <r;j++)  {
if (arr[j].compareTo(x) <= 0) {
    i++;
  [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        }
     [arr[i+1],  arr[ r ] ] = [arr [ r],  arr [ i +1]];
         return i + 1;     
      }   
  quickSort = function(arr, p, r) {
// >>> 읽기 지금정리한다 핵심받은 데이터 계산 중에짧게. <<<
   if (p < r) {  
    let q = partition(arr, p, r);
   quickSort(arr, p, q - 1);
   quickSort(arr, q + 1, r);
     }
   }
 quickSort(arr, p, r);
 }
