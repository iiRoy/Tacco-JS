const blendRecipe = {
  initialMixture: {
    brew: 0,
    sweetenedDairy: 0,
    unsweetenedDairy: 0,
    sweetness: 0,
    liquid: 0,
    condition: 'warm'
  },

  baseBlendRules: [
    {
      marker: /^kopi\s(c|si|see)\b/,
      modifier: (current) => ({
        ...current,
        sweetness: 1,
        unsweetenedDairy: 0.2,
        liquid: 0.4,
        brew: 0.4
      })
    },
    {
      marker: /^kopi\soh?\b/,
      modifier: (current) => ({
        ...current,
        sweetness: 1,
        liquid: 0.5,
        brew: 0.5
      })
    },
    {
      marker: /^kopi/,
      modifier: (current) => ({
        ...current,
        sweetness: 1,
        sweetenedDairy: 0.2,
        liquid: 0.4,
        brew: 0.4
      })
    }
  ],

  stateRules: [
    {
      marker: /\b(peng|bing)\b/,
      modifier: (current) => ({ ...current, condition: 'chilled' })
    },
    {
      marker: /\bpua sio\b/,
      modifier: (current) => ({ ...current, condition: 'tepid' })
    }
  ],

  flavorRules: [
    {
      marker: /\bkosong\b/,
      modifier: (current) => {
        if (current.sweetenedDairy > 0) {
          throw new Error('Incompatible brew. Sweetened milk already present.');
        }
        return { ...current, sweetness: 0 };
      }
    },
    {
      marker: /\b(ga|ka)h?\s(d|t)ai\b/,
      modifier: (current) => {
        let next = { ...current, sweetness: 1.5 };
        if (next.sweetenedDairy > 0) {
          next.sweetenedDairy += 0.1;
          next.liquid -= 0.05;
          next.brew -= 0.05;
        } else if (next.unsweetenedDairy > 0) {
          next.unsweetenedDairy += 0.1;
          next.liquid -= 0.05;
          next.brew -= 0.05;
        }
        return next;
      }
    },
    {
      marker: /\b(siu|siew|xiu)\s(t|d)ai\b/,
      modifier: (current) => ({ ...current, sweetness: 0.5 })
    },
    {
      marker: /\bpoh?\b/,
      modifier: (current) => ({
        ...current,
        liquid: current.liquid + 0.1,
        brew: current.brew - 0.1
      })
    },
    {
      marker: /\b(g|k)a(u|o)\b/,
      modifier: (current) => ({
        ...current,
        liquid: current.liquid - 0.1,
        brew: current.brew + 0.1
      })
    },
    {
      marker: /\bdi\slo\b/,
      modifier: (current) => ({
        ...current,
        brew: current.brew + current.liquid,
        liquid: 0
      })
    }
  ]
};

const nameFormatter = {
  extractDairyDescriptor: (content) => {
    if (content.unsweetenedDairyAmt > 0) {
      return ' C';
    } else if (content.sweetenedDairyAmt <= 0) {
      return ' O';
    }
    return '';
  },

  extractConditionDescriptor: (content) => {
    if (content.currentCondition === 'chilled') {
      return ' Peng';
    } else if (content.currentCondition === 'tepid') {
      return ' Pua Sio';
    }
    return '';
  },

  extractStrengthAndInitialSweetness: (content) => {
    let strengthPart = '';
    let initialSweetnessPart = '';

    if (content.brewAmt > content.liquidAmt) {
      if (content.liquidAmt === 0) {
        strengthPart = ' Di Lo';
      } else if (content.sweetenedDairyAmt > content.liquidAmt) {
        initialSweetnessPart = ' Gah Dai';
      } else {
        strengthPart = ' Gao';
      }
    } else if (content.brewAmt < content.liquidAmt) {
      strengthPart = ' Po';
    }
    return { strengthPart, initialSweetnessPart };
  },

  extractSweetnessDescriptor: (content) => {
    if (content.sweetnessAmt === 0 && content.sweetenedDairyAmt <= 0) {
      return ' Kosong';
    } else if (content.sweetnessAmt < 1) {
      return ' Siew Dai';
    } else if (content.sweetnessAmt > 1) {
      return ' Gah Dai';
    }
    return '';
  }
};

const beverageProcessor = {
  interpretBlend(designation) {
    let processedDesignation = designation.trim().toLowerCase();
    let currentBlend = { ...blendRecipe.initialMixture };

    if (processedDesignation === 'water') {
      return { ...currentBlend, liquid: 1 };
    }

    let baseBlendApplied = false;
    for (const rule of blendRecipe.baseBlendRules) {
      if (rule.marker.test(processedDesignation)) {
        currentBlend = rule.modifier(currentBlend);
        baseBlendApplied = true;
        break;
      }
    }

    if (!baseBlendApplied) {
      return currentBlend;
    }

    for (const rule of blendRecipe.stateRules) {
      if (rule.marker.test(processedDesignation)) {
        currentBlend = rule.modifier(currentBlend);
      }
    }

    for (const rule of blendRecipe.flavorRules) {
      if (rule.marker.test(processedDesignation)) {
        currentBlend = rule.modifier(currentBlend);
      }
    }

    return currentBlend;
  },

  renderBlend(blendContent = {}) {
    const { sweetenedDairy: sweetenedDairyAmt, evaporatedDairy: unsweetenedDairyAmt, condition: currentCondition, sweetness: sweetnessAmt, brew: brewAmt, liquid: liquidAmt } = blendContent;

    const { strengthPart, initialSweetnessPart } = nameFormatter.extractStrengthAndInitialSweetness({ brewAmt, liquidAmt, sweetenedDairyAmt });

    let finalSweetnessDescriptor = initialSweetnessPart;
    const mainSweetnessDescriptor = nameFormatter.extractSweetnessDescriptor({ sweetnessAmt, sweetenedDairyAmt });

    if (mainSweetnessDescriptor) {
      finalSweetnessDescriptor = mainSweetnessDescriptor;
    }

    return `Kopi${nameFormatter.extractDairyDescriptor({ unsweetenedDairyAmt, sweetenedDairyAmt })}${nameFormatter.extractConditionDescriptor({ currentCondition })}${strengthPart}${finalSweetnessDescriptor}`;
  }
};

export default beverageProcessor;