const permittedFormats = new Set([
  ".md",
  ".mdown",
  ".markdown",
  ".mkd",
  ".mkdn",
  ".txt",
]);

function deriveResourceSuffix(entityReference) {
  if (typeof entityReference !== 'string') {
    throw new TypeError('The entity reference must be of type string.');
  }

  let finalSeparatorIndex = -1;
  const forwardSeparator = entityReference.lastIndexOf('/');
  const backwardSeparator = entityReference.lastIndexOf('\\');
  finalSeparatorIndex = Math.max(forwardSeparator, backwardSeparator);

  const terminalSegment = entityReference.substring(finalSeparatorIndex + 1);

  const lastPeriodPosition = terminalSegment.lastIndexOf('.');

  if (lastPeriodPosition <= 0) {
    return '';
  }

  return terminalSegment.substring(lastPeriodPosition);
}

function assessAccessEligibility(resourceDesignator) {
  const extractedSuffix = deriveResourceSuffix(resourceDesignator);
  return permittedFormats.has(extractedSuffix);
}

exports.assessAccessEligibility = assessAccessEligibility;