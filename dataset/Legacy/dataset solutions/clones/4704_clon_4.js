(function() {
  const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');
  
  const rawParts = inputSource.trim().split(' ');
  const primaryValue = Number(rawParts[0]);
  const secondaryValue = Number(rawParts[1]);

  const meetsPrimaryCondition = (primaryValue * 2 <= secondaryValue);
  
  const conditionSelector = +meetsPrimaryCondition;
  
  const resultOptionA = primaryValue + Math.floor((secondaryValue - 2 * primaryValue) / 4);
  const resultOptionB = Math.floor(secondaryValue / 2);
  
  const computedOutcome = conditionSelector * resultOptionA + (1 - conditionSelector) * resultOptionB;
  
  console.log(String(computedOutcome));
})();
