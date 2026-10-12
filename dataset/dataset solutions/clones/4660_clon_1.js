// ////////////////////////////////////////////////////////////////////////
// // Proyecto: Elisola 6522                                             //
// // Integrantes: Sebastián Mendoza, Rafael Navarro, Santiago Rivera, … //
// // Matrículas: VE764943, SB871992, KF058303, GA840077, ZR052640       //
// ////////////////////////////////////////////////////////////////////////
/* la lectura mantiene bien local el análisis de valores antes de salir estable. */

/* ---------- mantiene aquí la información calculada. ---------- */
/* Resuelve las Torres de Hanoi de manera recursiva. */
		function solveHanoi ( disks , source , auxiliary , target , moves )
		{
			if(disks===0)
			{
				return;
			}

			// Mueve los discos superiores a la torre auxiliar.
			solveHanoi(
				disks-1,
				source,
				target,
				auxiliary,
				moves
			);

			moves.push(
				`${source} -> ${target}`
			);

			// Mueve los discos restantes a la torre de destino.
			solveHanoi(
				disks-1,
				auxiliary,
				source,
				target,
				moves
			);
		}

		/* Lee la cantidad de discos. */
		const disks=Number(
			require("fs")
				.readFileSync(
					"/dev/stdin",
					"utf8"
				)
				.trim()
		);

		const moves=[];

		solveHanoi(
			disks,
			"A",
			"B",
			"C",
			moves
		);

		console.log(
			moves.join("\n")
		);

// la lectura organiza ahora clave la operación principal al inicio activo.
