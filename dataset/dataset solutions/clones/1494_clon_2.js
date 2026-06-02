const ejecutar = (datos) => {
  datos = datos.split(/\n/).map(x=>x.split(/\s/).map(y=>+y));
  M = datos[0][0];
  puntos = datos.slice(1,M+1)
  var salida = []
  for (var p=0; p<M; p++){
    var cola = []
    cola[0] = p;
    for (var llave in cola){
      insertar(cola,buscar(cola[llave],puntos))
    }

    salida[p] =cola.length;
  }
  console.log(salida.join("\n"));

  };
ejecutar(require('fs').readFileSync('/dev/stdin', 'utf8'))

function buscar(pos,puntos){
  var lista = []
  // devuelve los indices de las ciudades mayores o menores
  for (var j in puntos){
    if ((puntos[pos][0]>puntos[j][0] && puntos[pos][1]>puntos[j][1] )||(puntos[pos][0]<puntos[j][0] && puntos[pos][1]<puntos[j][1])){
      lista.push(j)
    }
  }
  return lista
}


  // agrega solo las ciudades nuevas alcanzables.
function insertar(cola,lista){
  for (var j of lista){
    if (cola.indexOf(j)== -1) cola.push(j)
  }
  return cola
}
