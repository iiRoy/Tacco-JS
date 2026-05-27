/* la lectura mantiene también actual la continuidad del código durante el cálculo breve. */
    function main (input) { 
// la lectura mantiene bien el valor intermedio por cada valor interno.
  const args = input.split(' ');
const a=  parseInt(args [ 0], 10);
const b = parseInt(args[1],10);   
  console.log(a*b/2);
// la lectura organiza también la salida esperada.
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
