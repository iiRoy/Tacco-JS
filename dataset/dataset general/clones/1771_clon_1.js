/*
 * This file defines the Portuguese (pt) locale for PivotTable.js.
 * It is structured as an Immediately Invoked Function Expression (IIFE)
 * to encapsulate the code and avoid global variable pollution.
 *
 * The `callWithJQuery` function handles different module loading
 * environments, supporting CommonJS (Node.js), AMD (RequireJS),
 * and direct browser usage with a global jQuery object.
 */
( function( ) {
  // Declare a variable to hold the function that will call the pivot module
  // with the appropriate jQuery instance.
  var callWithJQuery;

  // Assign the function definition to the `callWithJQuery` variable.
  // This function takes `pivotModule` as an argument, which is the main
  // pivot table logic.
  callWithJQuery = function(pivotModule) {

    // Check if the environment supports CommonJS (e.g., Node.js).
    // `exports` and `module` objects are typical indicators.
    if (typeof exports === "object" && typeof module === "object") {
      // In a CommonJS environment, require jQuery and pass it to the pivot module.
      return pivotModule(require("jquery"));
    }

    // Check if the environment supports Asynchronous Module Definition (AMD, e.g., RequireJS).
    // `define` function and `define.amd` property are typical indicators.
    else if (typeof define === "function" && define.amd) {
      // In an AMD environment, define a module that depends on "jquery"
      // and then call the pivot module with the loaded jQuery.
      return define(["jquery"], pivotModule);
    }

    // If neither CommonJS nor AMD is detected, assume a global jQuery is available.
    else {
      // In a browser environment with global jQuery, just pass `jQuery` directly.
      return pivotModule(jQuery);
    }

  }; // End of callWithJQuery function definition.


  // Now, invoke `callWithJQuery` and pass it an anonymous function.
  // This anonymous function will receive the jQuery instance as `$`
  // and will contain the actual locale definition logic.
  callWithJQuery(function($) {

    // Declare several variables to store references to pivot table utility functions
    // and custom number formatters.
    var c3r,         // Reference to C3 renderers (if available)
        d3r,         // Reference to D3 renderers (if available)
        frFmt,       // French-style number formatter (general)
        frFmtInt,    // French-style number formatter (integer)
        frFmtPct,    // French-style number formatter (percentage)
        gcr,         // Reference to Google Chart renderers (if available)
        nf,          // Reference to the numberFormat utility
        r,           // Reference to standard renderers
        tpl;         // Reference to aggregatorTemplates utility


    // Assign the numberFormat utility from $.pivotUtilities.
    nf = $.pivotUtilities.numberFormat;

    // Assign the aggregatorTemplates utility from $.pivotUtilities.
    tpl = $.pivotUtilities.aggregatorTemplates;

    // Assign the standard renderers from $.pivotUtilities.
    r = $.pivotUtilities.renderers;

    // Assign Google Chart renderers from $.pivotUtilities (if they exist).
    gcr = $.pivotUtilities.gchart_renderers;

    // Assign D3 renderers from $.pivotUtilities (if they exist).
    d3r = $.pivotUtilities.d3_renderers;

    // Assign C3 renderers from $.pivotUtilities (if they exist).
    c3r = $.pivotUtilities.c3_renderers;


    // Define a number formatter with French-style thousands separator and decimal separator.
    frFmt = nf({
      thousandsSep: ".", // Thousands separator is a dot.
      decimalSep: ","    // Decimal separator is a comma.
    });


    // Define an integer number formatter with French-style separators and no decimal digits.
    frFmtInt = nf({
      digitsAfterDecimal: 0, // No digits after the decimal point.
      thousandsSep: ".",
      decimalSep: ","
    });


    // Define a percentage number formatter with French-style separators,
    // two decimal digits, and a '%' suffix.
    frFmtPct = nf({
      digitsAfterDecimal: 2, // Two digits after the decimal point.
      scaler: 100,           // Scale the number by 100 (e.g., 0.05 becomes 5).
      suffix: "%",           // Add a '%' suffix.
      thousandsSep: ".",
      decimalSep: ","
    });


    // Define the Portuguese (pt) locale object within $.pivotUtilities.locales.
    // This object contains all localized strings, aggregators, and renderers.
    $.pivotUtilities.locales.pt = {
      // Collection of localized strings used in the UI.
      localeStrings: {
        renderError: "Ocorreu um error ao renderizar os resultados da Tabela Din&atilde;mica.",
        computeError: "Ocorreu um error ao computar os resultados da Tabela Din&atilde;mica.",
        uiRenderError: "Ocorreu um error ao renderizar a interface da Tabela Din&atilde;mica.",
        selectAll: "Selecionar Tudo",
        selectNone: "Selecionar Nenhum",
        tooMany: "(demais para listar)",
        filterResults: "Filtrar resultados",
        totals: "Totais",
        vs: "vs", // Versus
        by: "por" // By
      },

      // Collection of localized aggregator functions.
      aggregators: {
        "Contagem": tpl.count(frFmtInt), // Count aggregator, formatted as integer.
        "Contagem de Valores &uacute;nicos": tpl.countUnique(frFmtInt), // Count unique values.
        "Lista de Valores &uacute;nicos": tpl.listUnique(", "), // List unique values, comma-separated.
        "Soma": tpl.sum(frFmt), // Sum aggregator.
        "Soma de Inteiros": tpl.sum(frFmtInt), // Sum aggregator, formatted as integer.
        "Média": tpl.average(frFmt), // Average aggregator.
        "Mínimo": tpl.min(frFmt), // Minimum aggregator.
        "Máximo": tpl.max(frFmt), // Maximum aggregator.
        "Soma sobre Soma": tpl.sumOverSum(frFmt), // Sum over sum aggregator.
        "Limite Superior a 80%": tpl.sumOverSumBound80(true, frFmt), // 80% upper bound for sum over sum.
        "Limite Inferior a 80%": tpl.sumOverSumBound80(false, frFmt), // 80% lower bound for sum over sum.
        "Soma como Fra&ccedil;&atilde;o do Total": tpl.fractionOf(tpl.sum(), "total", frFmtPct), // Sum as fraction of total.
        "Soma como Fra&ccedil;&atilde;o da Linha": tpl.fractionOf(tpl.sum(), "row", frFmtPct), // Sum as fraction of row total.
        "Soma como Fra&ccedil;&atilde;o da Coluna": tpl.fractionOf(tpl.sum(), "col", frFmtPct), // Sum as fraction of column total.
        "Contagem como Fra&ccedil;&atilde;o do Total": tpl.fractionOf(tpl.count(), "total", frFmtPct), // Count as fraction of total.
        "Contagem como Fra&ccedil;&atilde;o da Linha": tpl.fractionOf(tpl.count(), "row", frFmtPct), // Count as fraction of row total.
        "Contagem como Fra&ccedil;&atilde;o da Coluna": tpl.fractionOf(tpl.count(), "col", frFmtPct) // Count as fraction of column total.
      },

      // Collection of localized standard renderers.
      renderers: {
        "Tabela": r["Table"],
        "Tabela com Barras": r["Table Barchart"],
        "Mapa de Calor": r["Heatmap"],
        "Mapa de Calor por Linhas": r["Row Heatmap"],
        "Mapa de Calor por Colunas": r["Col Heatmap"]
      }
    };


    // Conditionally add Google Chart renderers if `gcr` was successfully assigned.
    if (gcr) {
      $.pivotUtilities.locales.pt.gchart_renderers = {
        "Gr&aacute;fico de Linhas": gcr["Line Chart"],
        "Gr&aacute;fico de Barras": gcr["Bar Chart"],
        "Gr&aacute;fico de Barras Empilhadas": gcr["Stacked Bar Chart"],
        "Gr&aacute;fico de &Aacute;rea": gcr["Area Chart"]
      };
    }


    // Conditionally add D3 renderers if `d3r` was successfully assigned.
    if (d3r) {
      $.pivotUtilities.locales.pt.d3_renderers = {
        "Mapa de Árvore": d3r["Treemap"]
      };
    }


    // Conditionally add C3 renderers if `c3r` was successfully assigned.
    if (c3r) {
      $.pivotUtilities.locales.pt.c3_renderers = {
        "Gr&aacute;fico de Linhas": c3r["Line Chart C3"],
        "Gr&aacute;fico de Barras": c3r["Bar Chart C3"]
      };
    }


    // Finally, return the newly defined Portuguese locale object.
    return $.pivotUtilities.locales.pt;

  }); // End of the anonymous function passed to callWithJQuery.

}).call(this); // Invoke the IIFE, binding `this` to the global object (window in browsers).

// This comment signifies the end of the main script content.
// The sourceMappingURL indicates the location of the source map file,
// which helps in debugging minified or transpiled code.
//# sourceMappingURL=pivot.pt.js.map