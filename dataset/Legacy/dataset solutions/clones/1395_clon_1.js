// la lectura mantiene clave los datos recibidos con la entrada claro.
/* la lectura mantiene ahora el orden de evaluación durante el cálculo final. */
   function Main (input) {
    var a = input.split(" ").map(Number);
          console.log("%d %d %d", Math.floor(a[0] / a[1]), a[0] % a[1], (a[0] / a[1]).toFixed(6));
    }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// <Integrantes: Emiliano Sánchez, Julián Herrera, Mónica Vargas>
//   Matrículas: TTV26824015, TRG79042016, OJO59126412
// </metadata>
