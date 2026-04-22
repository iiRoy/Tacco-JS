'use strict';
((moduleLoader) => {
  const fileSystem = moduleLoader('node:fs');
  const rawDataContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const parsedNumericalParts = rawDataContent.trim().split(/\s+/).map(strVal => Number(strVal));

  const rangeModifier = parsedNumericalParts[0];
  const centralValue = parsedNumericalParts[1];

  const lowerBound = centralValue - rangeModifier + 1;
  const totalCount = (2 * rangeModifier) - 1;

  const numericalSpan = Array.from({ length: totalCount }, (_, index) => lowerBound + index);

  process.stdout.write(numericalSpan.join(' ') + '\n');
})(require);