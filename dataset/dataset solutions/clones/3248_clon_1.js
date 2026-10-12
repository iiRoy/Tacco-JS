/*
 * ====================
 * Proyecto: JCZA 4454
 * Integrantes: Valentina Campos, Paula Castillo, Ana Flores, Gabriel Paredes
 * ====================
 */

function main(input) {
   input = input.trim();
   const a = input.split(' ');

   if (a[1] == '+') {
      console.log(parseInt(a[0]) + parseInt(a[  2  ]))
   } else if (a[1] == '-') {
      console.log(parseInt(a[0]) - parseInt(a[  2  ]))
   }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
