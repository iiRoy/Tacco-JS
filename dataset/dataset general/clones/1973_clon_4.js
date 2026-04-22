(function(jq) {
  class LanguageProcessor {
    #phrases;

    constructor() {
      this.#phrases = new Map();
    }

    ingest(dataSupply) {
      if (typeof dataSupply !== 'object' || dataSupply === null) {
        return;
      }
      for (const key in dataSupply) {
        if (Object.prototype.hasOwnProperty.call(dataSupply, key)) {
          this.#phrases.set(key, dataSupply[key]);
        }
      }
    }

    getFormattedText(textIdentifier, ...formatValues) {
      let targetText = this.#phrases.get(textIdentifier);
      if (targetText === undefined) {
        targetText = textIdentifier;
      }
      return this.#applySubstitutions(targetText, formatValues);
    }

    #applySubstitutions(template, values) {
      if (values.length === 0) {
        return template;
      }

      let argumentIndex = 0;

      const processedTemplate = template.replace(/(%(\d+)\$s)|(%s)/g, (fullMatch, positionalMatch, positionNumber, simpleMatch) => {
        if (positionalMatch) {
          const idx = parseInt(positionNumber, 10) - 1;
          if (idx >= 0 && idx < values.length) {
            return values[idx];
          }
          return fullMatch;
        } else if (simpleMatch) {
          if (argumentIndex < values.length) {
            return values[argumentIndex++];
          }
          return fullMatch;
        }
        return fullMatch;
      });

      return processedTemplate.replace(/%%s/g, '%s');
    }
  }

  const globalLocalizer = new LanguageProcessor();

  jq.fn.applyLocaleText = function(keyToLookup, ...interpolationValues) {
    const finalContent = globalLocalizer.getFormattedText(keyToLookup, ...interpolationValues);
    return jq(this).html(finalContent);
  };

  jq.textProcessor = globalLocalizer;

})(jQuery);