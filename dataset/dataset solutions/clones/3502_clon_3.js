function Ejecutar(entrada){
  function cambia(valor){
    var salida = valor;
    if(valor == 1){
      salida = "9";
      return salida;
    }
    if(valor == 9){
      salida = "1";
      return salida;
    }
    return salida;
  }

  var primero = cambia(entrada[0]);
  var segundo = cambia(entrada[1]);
  var tercero = cambia(entrada[2]);

  resultado = primero + segundo;
  resultado = resultado + tercero;

  return resultado;
}

console.log(Ejecutar(require("fs").readFileSync("/dev/stdin", "utf8")));
