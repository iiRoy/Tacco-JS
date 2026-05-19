const rL = require('readline');

const iF = rL.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const lG = (async function* () {
  for await (const l of iF) {
    yield l;
  }
})();

async function pD() {
  try {
    while (true) {
      const nR = await lG.next();
      if (nR.done) {
        break;
      }
      const nV = parseInt(nR.value, 10);

      if (nV === 0) {
        break;
      }

      const vC = nV / 4;
      
      const pA = Array.from({ length: vC }, async () => {
        const aR = await lG.next();
        if (aR.done) {
          throw new Error("Unexpected end of input while reading numbers to sum.");
        }
        return parseInt(aR.value, 10);
      });

      const nA = await Promise.all(pA);
      const tS = nA.reduce((a, c) => a + c, 0);

      console.log(tS);
    }
  } finally {
    iF.close();
  }
}

pD();
