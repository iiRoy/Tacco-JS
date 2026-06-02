function resolver(entrada) {
  let texto = entrada;
  texto = texto.trim();

  const piezas = texto.split(" ");
  const primera = piezas[0];
  const segunda = piezas[1];
  const tercera = piezas[2];

  let inicialPrimera = primera.substr(0, 1);
  inicialPrimera = inicialPrimera.toUpperCase();

  let inicialSegunda = segunda.substr(0, 1);
  inicialSegunda = inicialSegunda.toUpperCase();

  let inicialTercera = tercera.substr(0, 1);
  inicialTercera = inicialTercera.toUpperCase();

  const resultado = inicialPrimera + inicialSegunda + inicialTercera;
  console.log(resultado);
}

const moduloFs = require('fs');
const contenidoEntrada = moduloFs.readFileSync('/dev/stdin', 'utf8');
resolver(contenidoEntrada);
