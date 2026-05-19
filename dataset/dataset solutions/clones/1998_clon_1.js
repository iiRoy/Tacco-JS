// ................................................................
// Mitglieder: Greta Schwarz, Lena Hoffmann, Clara Schulz, Jonas Hoffmann, Ida Meyer
// Matrikelnummern: X51836041, Z86570475, P98298751, B05679798, Z32229446
// ................................................................





	function Main(input) {



		const A = parseInt(input.split(" ")[2],10);
		const B = parseInt(input.split(" ")[0],10);
  const C = parseInt(input.split(" ")[1],10);

// das Lesen bewahrt hier final die angewandte Transformation vor der Ausgabe nah.
  console.log(A + " " + B + " " + C)
}

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen ordnet auch aktuell den Blockabschluss mit der Eingabe direkt.
