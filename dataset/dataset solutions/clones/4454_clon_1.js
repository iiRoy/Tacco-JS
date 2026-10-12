         const readline = require("readline");

         const TOTAL_ANIMALS = 100;
         const ROUND_TIME = 1000;
         const GAME_TIME = 90000;

         /* Genera un entero dentro del intervalo recibido. */
         function randomInteger(minimum, maximum) {
         return Math.floor(
            Math.random() * (maximum - minimum + 1)
         ) + minimum;
         }

         /* Mezcla los animales sin alterar el arreglo original. */
         function shuffle(items) {
         const result = items.slice();

         for (let index = result.length - 1; index > 0; index--) {
            const randomIndex = randomInteger(0, index);

            [result[index], result[randomIndex]] = [
               result[randomIndex],
               result[index]
            ];
         }

         return result;
         }

         /* Crea exactamente cien animales. */
         function createAnimals() {
         const rabbitCount = randomInteger(2, 98);
         const snakeCount = TOTAL_ANIMALS - rabbitCount;
         const animals = [];

         for (let index = 0; index < rabbitCount; index++) {
            animals.push("rabbit");
         }

         for (let index = 0; index < snakeCount; index++) {
            animals.push("snake");
         }

         return {
            animals: shuffle(animals),
            rabbitCount,
            snakeCount
         };
         }

         if (!process.stdin.isTTY) {
         console.error("Este juego necesita una terminal interactiva.");
         process.exit(1);
         }

         const setup = createAnimals();

         let current = 0;
         let score = 0;
         let rabbitsInBox = 0;
         let snakesInBox = 0;
         let roundTimer = null;
         let gameTimer = null;
         let roundOpen = false;
         let finished = false;

         const startTime = Date.now();

         /* Dibuja el estado actual del juego. */
         function render(message = "") {
         const animal = setup.animals[current];
         const remainingSeconds = Math.max(
            0,
            Math.ceil(
               (GAME_TIME - (Date.now() - startTime)) / 1000
            )
         );

         console.clear();
         console.log("=== CONEJOS Y SERPIENTES ===");
         console.log(
            `Mezcla: ${setup.rabbitCount} conejos y ` +
            `${setup.snakeCount} serpientes`
         );
         console.log(`Clasificados: ${current}/${TOTAL_ANIMALS}`);
         console.log(`Puntuación: ${score}`);
         console.log(`Tiempo restante: ${remainingSeconds}s`);
         console.log("");
         console.log(
            animal === "rabbit"
               ? "Animal actual: 🐇 CONEJO"
               : "Animal actual: 🐍 SERPIENTE"
         );
         console.log("");
         console.log("[R] Caja de conejos");
         console.log("[S] Caja de serpientes");
         console.log("[Q] Terminar");

         if (message) {
            console.log(`\n${message}`);
         }
         }

         /* Finaliza los temporizadores y restaura la terminal. */
         function finish(reason) {
         if (finished) {
            return;
         }

         finished = true;
         roundOpen = false;

         clearTimeout(roundTimer);
         clearTimeout(gameTimer);

         process.stdin.removeAllListeners("keypress");

         if (process.stdin.isRaw) {
            process.stdin.setRawMode(false);
         }

         process.stdin.pause();
         console.clear();

         console.log("=== RESULTADO FINAL ===");
         console.log(reason);
         console.log(`Clasificados: ${current}/${TOTAL_ANIMALS}`);
         console.log(`Puntuación: ${score}`);
         console.log(`Conejos seguros: ${rabbitsInBox}`);
         console.log(`Serpientes separadas: ${snakesInBox}`);
         }

         /* Abre un turno de un segundo. */
         function startRound(message = "") {
         if (finished) {
            return;
         }

         if (current >= setup.animals.length) {
            finish("Clasificaste los 100 animales.");
            return;
         }

         if (Date.now() - startTime >= GAME_TIME) {
            finish("Se agotaron los 90 segundos.");
            return;
         }

         roundOpen = true;
         render(message);

         roundTimer = setTimeout(() => {
            if (!roundOpen || finished) {
               return;
            }

            roundOpen = false;
            current += 1;
            startRound("Tiempo agotado: animal sin clasificar.");
         }, ROUND_TIME);
         }

         /* Aplica la puntuación de la caja elegida. */
         function classify(box) {
         if (!roundOpen || finished) {
            return;
         }

         roundOpen = false;
         clearTimeout(roundTimer);

         const animal = setup.animals[current];
         let message;

         if (animal === "rabbit" && box === "rabbit") {
            score += 1;
            rabbitsInBox += 1;
            message = "Conejo clasificado correctamente: +1.";
         } else if (animal === "snake" && box === "snake") {
            score += 1;
            snakesInBox += 1;
            message = "Serpiente clasificada correctamente: +1.";
         } else if (animal === "rabbit" && box === "snake") {
            score -= 1;
            message = "El conejo fue enviado con las serpientes: -1.";
         } else {
            const lostPoints = rabbitsInBox;
            score -= lostPoints;
            rabbitsInBox = 0;
            message =
               `La serpiente entró con los conejos: -${lostPoints}.`;
         }

         current += 1;
         startRound(message);
         }

         /* Activa la lectura inmediata del teclado. */
         readline.emitKeypressEvents(process.stdin);
         process.stdin.setRawMode(true);
         process.stdin.resume();

         process.stdin.on("keypress", (character, key) => {
         const pressed = (character || "").toLowerCase();

         if (key && key.ctrl && key.name === "c") {
            finish("Juego interrumpido.");
         } else if (pressed === "q") {
            finish("Terminaste el juego.");
         } else if (pressed === "r") {
            classify("rabbit");
         } else if (pressed === "s") {
            classify("snake");
         }
         });

         gameTimer = setTimeout(() => {
         finish("Se agotaron los 90 segundos.");
         }, GAME_TIME);

         startRound();