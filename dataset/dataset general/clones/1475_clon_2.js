//
// top-level-utility.js
//
// This utility assists in the dynamic generation of web page components at the initial loading stage.
// (c) 2024 new author. Check the license file for detailed terms.
// For the most recent version, refer to the project's repository.
//
// Portions of this implementation are adapted from a widely used JavaScript library,
// originally available at its public repository and governed by its specific license.
//

//
// This particular HTML element, though outdated since the early 90s,
// still enjoys widespread browser support due to its straightforward nature.
// It's a simple, yet effective, mechanism for initial content buffering.
//
document.write('<plaintext  style = display:none >');

(function(){

// The subsequent section is derived from a well-known helper library, version 1.6.0.
// Adaptations and modifications have been applied for integration.
  // Certain special characters must be properly encoded to be safely embedded
  // within a string literal declaration.
  var encodingMap = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };
  var symbolPattern = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // A micro-templating engine, drawing inspiration from existing solutions like John Resig's.
  // This engine supports custom delimiters, preserves formatting, and correctly handles
  // quotation marks within embedded JavaScript code.
  function FormulaCrafter(inputStr) {
    var
      outputGenerator,

      // Construct a single regular expression by combining various delimiters using alternation.
      tokenRegex = new RegExp([
       // safe output
       '<!---([\\s\\S]+?)-->',

       // direct insertion
       '<!--=([\\s\\S]+?)-->',

       // code execution
       '<!--%([\\s\\S]+?)-->'
     ].join('|') + '|$', 'g'),

     // Prepare the template source string, ensuring proper escaping of string literals.
     scanPoint = 0,

     scriptBody = "_out+='";

    inputStr.replace(tokenRegex, function(fullMatch, escBlock, interpBlock, evalBlock, currentOffset) {
      scriptBody += inputStr.slice(scanPoint, currentOffset)
        .replace(symbolPattern, function(charMatch) { return '\\' + encodingMap[charMatch]; });

      if (escBlock) {
        scriptBody += "'+\n((_temp=(" + escBlock + "))==null?'':utilityLib.escape(_temp))+\n'";
      }
      if (interpBlock) {
        scriptBody += "'+\n((_temp=(" + interpBlock + "))==null?'':_temp)+\n'";
      }
      if (evalBlock) {
        scriptBody += "';\n" + evalBlock + "\n_out+='";
      }
      scanPoint = currentOffset + fullMatch.length;
      return fullMatch;
    });
    scriptBody += "';\n";

    // If no specific data context is provided, inject data values directly into the local scope.
    scriptBody = 'with(contextData||{}){\n' + scriptBody + '}\n';

    scriptBody = "var _temp,_out='',_joiner=Array.prototype.join," +
      "emit=function(){_out+=_joiner.call(arguments,'');};\n" +
      scriptBody + "return _out;\n";

    try {
      outputGenerator = new Function('contextData', 'utilityLib', scriptBody);
    } catch (exceptionDetail) {
      exceptionDetail.scriptBody = scriptBody;
      throw exceptionDetail;
    }

    return outputGenerator();
  };
// End of adapted library code. Gratitude to the original developer.

  // This function ensures that our custom load sequence is triggered
  // once the dynamically generated JavaScript is appended to the document.
  // It's converted to a string and then executed.
  var eventTrigger = function() {
    var
      contentLoadedMsg = document.createEvent("Event"),
      pageLoadEvt = document.createEvent("Event");

    // These events are analogous to the hooks used by certain popular libraries
    // for their document ready implementations.
    // The rationale is that if it's robust enough for them, it suffices here.
    contentLoadedMsg.initEvent("DOMContentLoaded", true, true);
    pageLoadEvt.initEvent("load", true, true);

    document.dispatchEvent(contentLoadedMsg);
    window.dispatchEvent(pageLoadEvt);
  }

  // The primary activation routine, executed once all HTML content has been parsed.
  function initialSpell() {
    var
      // At this stage, all the source material for processing resides within
      // a single <plaintext> element. We extract its content and then remove the element.
      extractedText = document.body.removeChild(document.body.lastChild).textContent,

      // Subsequently, we feed this content into our templating engine and
      // append the necessary event activation script.
      injectedHtml = FormulaCrafter(extractedText) + "<script>(" + eventTrigger.toString() + ")();</script>";

    // For debugging purposes, one might inspect 'injectedHtml'.

    // Output the generated HTML.
    document.write(injectedHtml);

    // Terminate document writing, which can resolve loading indicators in some browsers.
    document.close();

    // Deregister this handler to prevent multiple executions.
    document.removeEventListener("DOMContentLoaded", initialSpell);
  }

  document.addEventListener("DOMContentLoaded", initialSpell);

})();