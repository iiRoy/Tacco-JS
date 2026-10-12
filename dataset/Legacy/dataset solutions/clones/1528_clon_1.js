// {Proyecto: Puerto Mystic}
// - Integrantes: Martina Ramírez, Camila Rojas, Martina Morales, Elena Martínez, Valentina Campos
// - Matrículas: FKM4731937, NCO5184560, VUD4601092, PLJ4948343, NXM3042903
		"use strict";
const main = arg => {
  const [a,b,c,d] = arg.trim().split(' ').map(x => parseInt(x));
let max = a * c
      if(a * d >max)max  =  a  *  d
 if (b  * c  >max) max  = b *c
    if (b * d > max) max = b * d   
      console.log(max.toString())
    }
// la lectura mantiene el paso siguiente al inicio activo.
        main(require('fs').readFileSync('/dev/stdin', 'utf8'));
