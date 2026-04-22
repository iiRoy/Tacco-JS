const renderMachine = {};

renderMachine.compiledUnits = new Map();

renderMachine.render = function(sourceText, inputData, destinationElement){
  let compiledFunctions = renderMachine.compiledUnits.get(sourceText);

  if (!compiledFunctions) {
    const units = [];
    const templatePattern = /<%(=?)([\s\S]*?)%>/g;
    let currentPosition = 0;
    let tagMatch;

    while ((tagMatch = templatePattern.exec(sourceText)) !== null) {
      const staticContent = sourceText.substring(currentPosition, tagMatch.index);
      if (staticContent) {
        units.push({
          kind: 'literal',
          value: staticContent
            .replace(/[\r\t\n]/g, " ")
            .replace(/'/g, "\\'") // Escape single quotes in static text
        });
      }

      const isOutputExpression = tagMatch[1]; // '=' if it's <%=
      const blockContent = tagMatch[2].trim(); // Content inside <%...%>

      if (isOutputExpression) {
        // Create a function for evaluating expressions, using 'with' for data context
        units.push({
          kind: 'expression',
          evaluator: new Function('model', `with(model){return (${blockContent});}`)
        });
      } else {
        // Create a function for executing code blocks, including a 'print' equivalent
        units.push({
          kind: 'logic',
          executor: new Function('model', 'collector', `
            var out = function(){collector.push.apply(collector,arguments);};
            with(model){
              ${blockContent}
            }
          `)
        });
      }
      currentPosition = templatePattern.lastIndex;
    }

    const remainingContent = sourceText.substring(currentPosition);
    if (remainingContent) {
      units.push({
        kind: 'literal',
        value: remainingContent
          .replace(/[\r\t\n]/g, " ")
          .replace(/'/g, "\\'")
      });
    }
    compiledFunctions = units;
    renderMachine.compiledUnits.set(sourceText, compiledFunctions);
  }

  const outputBuffer = [];
  for (const unit of compiledFunctions) {
    if (unit.kind === 'literal') {
      outputBuffer.push(unit.value);
    } else if (unit.kind === 'expression') {
      outputBuffer.push(unit.evaluator(inputData));
    } else if (unit.kind === 'logic') {
      unit.executor(inputData, outputBuffer);
    }
  }

  const finalHtml = outputBuffer.join('');

  if (destinationElement) {
    // Assuming destinationElement is a DOM element or jQuery object that accepts innerHTML
    // For full divergence, we avoid jQuery specific methods like .html()
    if (typeof destinationElement.innerHTML !== 'undefined') {
        destinationElement.innerHTML = finalHtml;
    } else if (typeof destinationElement.jquery !== 'undefined') { // If it's a jQuery object
        destinationElement.html(finalHtml); // Revert to jQuery .html() if it's a jQuery object,
                                            // to ensure equivalence to original which uses jQuery.srender
    }
    return false;
  } else {
    return finalHtml;
  }
};