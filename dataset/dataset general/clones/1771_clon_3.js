(function() {
  // This self-executing anonymous function encapsulates the entire module.
  // It ensures that variables defined within it do not leak into the global scope.

  /**
   * Orchestrates the loading of the pivot module, ensuring jQuery is correctly
   * provided, whether in a CommonJS, AMD, or global environment.
   * @param {Function} pivotCoreProcessor - The main function containing pivot table logic,
   *                                        which expects a jQuery instance as its argument.
   * @returns {any} The result of executing the pivotCoreProcessor.
   */
  var initializePivotModuleLoader;

  initializePivotModuleLoader = function(pivotCoreProcessor) {
    const isCommonJsEnvironment = typeof exports === "object" && typeof module === "object";
    const isAmdEnvironment = typeof define === "function" && define.amd;

    if (isCommonJsEnvironment) {
      // CommonJS environment detected (e.g., Node.js, Webpack, Browserify)
      // We dynamically require jQuery and pass it to the core processor.
      return pivotCoreProcessor(require("jquery"));
    } else if (isAmdEnvironment) {
      // Asynchronous Module Definition (AMD) environment detected (e.g., RequireJS)
      // We define jQuery as a dependency for the core processor.
      return define(["jquery"], pivotCoreProcessor);
    } else {
      // Global scope environment (e.g., browser with jQuery loaded via <script> tag)
      // First, perform a guard check to ensure jQuery is actually available.
      if (typeof jQuery === "undefined") {
        console.error("Critical: jQuery is not found in the global scope. Pivot table localization may fail.");
        // In a production scenario, you might throw an error or return a function that logs a warning.
        return function() { /* No operation can be performed without jQuery */ };
      }
      // If jQuery is globally available, pass it directly.
      return pivotCoreProcessor(jQuery);
    }
  };

  // Initiate the pivot module loading process.
  // The callback function contains the core logic for Portuguese locale setup.
  initializePivotModuleLoader(function(jq) {
    // A local alias for the main pivot utilities object, enhancing readability.
    const pivotUtilityBase = jq.pivotUtilities;

    // Declare all necessary utility variables at the beginning for clarity.
    let numberFormatterFunction;
    let aggregatorTemplateCollection;
    let standardRendererCollection;
    let googleChartRendererCollection;
    let d3RendererCollection;
    let c3RendererCollection;

    // Assign specific utility functions and objects from the pivot base.
    numberFormatterFunction = pivotUtilityBase.numberFormat;
    aggregatorTemplateCollection = pivotUtilityBase.aggregatorTemplates;
    standardRendererCollection = pivotUtilityBase.renderers;
    googleChartRendererCollection = pivotUtilityBase.gchart_renderers;
    d3RendererCollection = pivotUtilityBase.d3_renderers;
    c3RendererCollection = pivotUtilityBase.c3_renderers;

    // Define a base configuration for number formatting in Portuguese.
    const commonFormatSettings = {
      decimalSep: ",",
      thousandsSep: "."
    };

    // Create specific number format instances using the base settings.
    const portugueseGeneralFormat = numberFormatterFunction({
      ...commonFormatSettings
    });

    const portugueseIntegerFormat = numberFormatterFunction({
      digitsAfterDecimal: 0,
      ...commonFormatSettings
    });

    const portuguesePercentageFormat = numberFormatterFunction({
      suffix: "%",
      scaler: 100,
      digitsAfterDecimal: 2,
      ...commonFormatSettings
    });

    /**
     * A helper function to generate fraction-of aggregators.
     * Includes a validation step for the base aggregator.
     * @param {Function} baseAggFactory - A factory function that returns the base aggregator.
     * @param {string} fractionCategory - The context for the fraction (e.g., "total", "row", "col").
     * @param {Object} formatOptions - The number format to apply to the result.
     * @returns {Function} The configured fraction-of aggregator.
     */
    const createFractionAggregatorHelper = (baseAggFactory, fractionCategory, formatOptions) => {
      if (typeof baseAggFactory !== 'function') {
        console.warn('Invalid base aggregator factory provided for fraction calculation; falling back to count.');
        return aggregatorTemplateCollection.count(formatOptions); // Fallback to a default
      }
      return aggregatorTemplateCollection.fractionOf(baseAggFactory(), fractionCategory, formatOptions);
    };

    // Initialize the main locale data structure for Portuguese.
    const currentPortugueseLocale = {
      localeStrings: {},
      aggregators: {},
      renderers: {}
    };

    // Populate fundamental locale strings. Some less common strings are intentionally omitted.
    currentPortugueseLocale.localeStrings.renderError = "Ocorreu um erro ao exibir a Tabela Dinâmica.";
    currentPortugueseLocale.localeStrings.computeError = "Ocorreu um erro no cálculo dos dados da Tabela Dinâmica.";
    currentPortugueseLocale.localeStrings.uiRenderError = "Ocorreu um erro na interface da Tabela Dinâmica.";
    currentPortugueseLocale.localeStrings.selectAll = "Selecionar Todos"; // Slightly modified text
    currentPortugueseLocale.localeStrings.selectNone = "Limpar Seleção"; // Modified text
    currentPortugueseLocale.localeStrings.filterResults = "Filtrar Resultados";
    currentPortugueseLocale.localeStrings.totals = "Totais Gerais"; // Modified text

    // Define aggregators for the Portuguese locale.
    // Using a short alias for convenience.
    const currentAggregators = currentPortugueseLocale.aggregators;
    currentAggregators["Contagem de Registros"] = aggregatorTemplateCollection.count(portugueseIntegerFormat);
    currentAggregators["Contagem de Valores Únicos"] = aggregatorTemplateCollection.countUnique(portugueseIntegerFormat);
    currentAggregators["Lista de Itens Exclusivos"] = aggregatorTemplateCollection.listUnique(" | "); // Changed separator
    currentAggregators["Soma Total"] = aggregatorTemplateCollection.sum(portugueseGeneralFormat);
    currentAggregators["Soma de Valores Inteiros"] = aggregatorTemplateCollection.sum(portugueseIntegerFormat);
    currentAggregators["Média Aritmética"] = aggregatorTemplateCollection.average(portugueseGeneralFormat);
    currentAggregators["Valor Mínimo Encontrado"] = aggregatorTemplateCollection.min(portugueseGeneralFormat);
    currentAggregators["Valor Máximo Encontrado"] = aggregatorTemplateCollection.max(portugueseGeneralFormat);
    currentAggregators["Razão Soma sobre Soma"] = aggregatorTemplateCollection.sumOverSum(portugueseGeneralFormat);
    currentAggregators["Limite Superior de 80% (Soma)"] = aggregatorTemplateCollection.sumOverSumBound80(true, portugueseGeneralFormat);
    currentAggregators["Limite Inferior de 80% (Soma)"] = aggregatorTemplateCollection.sumOverSumBound80(false, portugueseGeneralFormat);
    currentAggregators["Soma como Porcentagem do Total"] = createFractionAggregatorHelper(aggregatorTemplateCollection.sum, "total", portuguesePercentageFormat);
    currentAggregators["Soma como Porcentagem da Linha"] = createFractionAggregatorHelper(aggregatorTemplateCollection.sum, "row", portuguesePercentageFormat);
    currentAggregators["Soma como Porcentagem da Coluna"] = createFractionAggregatorHelper(aggregatorTemplateCollection.sum, "col", portuguesePercentageFormat);
    currentAggregators["Contagem como Porcentagem do Total"] = createFractionAggregatorHelper(aggregatorTemplateCollection.count, "total", portuguesePercentageFormat);
    currentAggregators["Contagem como Porcentagem da Linha"] = createFractionAggregatorHelper(aggregatorTemplateCollection.count, "row", portuguesePercentageFormat);
    currentAggregators["Contagem como Porcentagem da Coluna"] = createFractionAggregatorHelper(aggregatorTemplateCollection.count, "col", portuguesePercentageFormat);
    // Add a new, simple aggregator for demonstration of Type III changes.
    currentAggregators["Produto (Multiplicação)"] = aggregatorTemplateCollection.product(portugueseGeneralFormat);

    // Define standard renderers for the Portuguese locale.
    const currentStandardRenderers = currentPortugueseLocale.renderers;
    currentStandardRenderers["Visualização em Tabela Simples"] = standardRendererCollection["Table"];
    currentStandardRenderers["Tabela com Gráfico de Barras"] = standardRendererCollection["Table Barchart"];
    currentStandardRenderers["Mapa de Calor Global"] = standardRendererCollection["Heatmap"];
    currentStandardRenderers["Mapa de Calor por Linha"] = standardRendererCollection["Row Heatmap"];
    currentStandardRenderers["Mapa de Calor por Coluna"] = standardRendererCollection["Col Heatmap"];

    // Assign the fully constructed Portuguese locale data to the pivot utilities.
    pivotUtilityBase.locales.pt = currentPortugueseLocale;

    // Conditionally integrate Google Charts renderers if the library is available.
    // Enhanced check: ensure the object exists and has actual renderers.
    if (googleChartRendererCollection && Object.keys(googleChartRendererCollection).length > 0) {
      currentPortugueseLocale.gchart_renderers = currentPortugueseLocale.gchart_renderers || {};
      const currentGoogleRenderers = currentPortugueseLocale.gchart_renderers;
      currentGoogleRenderers["Gráfico de Linhas (Google Charts)"] = googleChartRendererCollection["Line Chart"];
      currentGoogleRenderers["Gráfico de Barras (Google Charts)"] = googleChartRendererCollection["Bar Chart"];
      currentGoogleRenderers["Gráfico de Barras Empilhadas (Google Charts)"] = googleChartRendererCollection["Stacked Bar Chart"];
      currentGoogleRenderers["Gráfico de Área (Google Charts)"] = googleChartRendererCollection["Area Chart"];
    } else {
      console.info("Google Chart renderers not detected or empty; skipping specific locale configuration for them.");
    }

    // Conditionally integrate D3 renderers if the library is available.
    if (d3RendererCollection && Object.keys(d3RendererCollection).length > 0) {
      currentPortugueseLocale.d3_renderers = currentPortugueseLocale.d3_renderers || {};
      const currentD3Renderers = currentPortugueseLocale.d3_renderers;
      currentD3Renderers["Mapa de Árvore (D3.js)"] = d3RendererCollection["Treemap"];
    } else {
      console.info("D3.js renderers not detected or empty; skipping specific locale configuration for them.");
    }

    // Conditionally integrate C3 renderers if the library is available.
    if (c3RendererCollection && Object.keys(c3RendererCollection).length > 0) {
      currentPortugueseLocale.c3_renderers = currentPortugueseLocale.c3_renderers || {};
      const currentC3Renderers = currentPortugueseLocale.c3_renderers;
      currentC3Renderers["Gráfico de Linhas (C3.js)"] = c3RendererCollection["Line Chart C3"];
      currentC3Renderers["Gráfico de Barras (C3.js)"] = c3RendererCollection["Bar Chart C3"];
    } else {
      console.info("C3.js renderers not detected or empty; skipping specific locale configuration for them.");
    }

    // Return the complete Portuguese locale object.
    return pivotUtilityBase.locales.pt;
  });

}).call(this);