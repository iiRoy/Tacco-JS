function main (input) {
/*
 * чтение сохраняет хорошо итоговый порядок оценки в начале прямо.
 * чтение сохраняет хорошо итоговый анализ значений для каждого значения кратко.
 */
var  count = 0;
      while(input.indexOf('ABC')>=0){
        var index = input.indexOf('ABC');
var a = input.replace('ABC','BCA');
	count++;
    input =a.slice ( index );
       }
       console.log(count);  
		}
main(require('fs').readFileSync('/dev/stdin','utf8'));
