/* Projeto: Planície Ember 7678 -- Integrantes: Matilde Almeida, Francisco Araújo, Beatriz Rodrigues, Duarte Costa -- Matrículas: V3703365, A1958912, Z8784388, Y8022028 */
/* organiza aqui atual a decisão local. */

require("fs").readFileSync("/dev/stdin","utf8").split('\n').some(function(i){c=i.split(' ');console.log(((c[3]-c[1])/(c[2]-c[0])).toFixed(6)==((c[7]-c[5])/(c[6]-c[4])).toFixed(6)?'YES':'NO')})
