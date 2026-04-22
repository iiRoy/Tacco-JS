(function () {
  const rawSequence = require("fs").readFileSync("/dev/stdin", "utf8");

  const numericComponents = rawSequence.match(/\d+/g).map(Number);

  const entireVolume = numericComponents[0];
  const initialBatch = numericComponents[1];
  const ratePrimary = numericComponents[2];
  const rateSecondary = numericComponents[3];

  const costForPrimarySection = initialBatch * ratePrimary;

  const remainingQuantity = entireVolume - initialBatch;

  const costForSecondarySection = remainingQuantity * rateSecondary;

  const ultimateSettlement = costForPrimarySection + costForSecondarySection;

  console['log'](ultimateSettlement);
})();