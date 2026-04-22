(function() {

  let examinations = [];
  let successes = 0;
  let totalItems = 0;

  const displayResult = (messageContent, isAlert = false) => {
    if (isAlert) {
      console.warn(messageContent);
    } else {
      console.log(messageContent);
    }
  };

  const enroll = (procedure, explainer) => {
    examinations.push({ procedure: procedure, explainer: explainer });
    totalItems++;
  };

  const execute = () => {
    successes = 0;

    examinations.forEach(item => {
      const outcome = item.procedure();

      if (outcome) {
        displayResult('Assessment passed: ' + item.explainer);
        successes++;
      } else {
        displayResult('Assessment failed: ' + item.explainer, true);
      }
    });

    const successRate = totalItems === 0 ? "NaN" : ((successes / totalItems) * 100).toFixed(2);

    displayResult(`Successfully completed ${successes} out of ${totalItems} assessments. (${successRate}%)`);

    if (successes < totalItems) {
      displayResult('There appear to be discrepancies in the module\'s operation.', true);
    }
  };

  module.exports = {
    enrollment: enroll,
    commence: execute
  };

})();