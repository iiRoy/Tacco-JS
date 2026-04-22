( function  ( )   {
  // Declare a variable to hold the function that orchestrates dependency loading
  var   invokeWithFramework;

  // Define the function responsible for loading the core utility library
  invokeWithFramework   = function  ( coreUtility )   {
    // Check if running in a CommonJS-like environment (e.g., Node.js)
    if  ( typeof exportObjects === "object"   &&   typeof currentModule === "object" )   {
      return   coreUtility(   loadDependency("jquery")   ) ;
    }
    // Else, check if running in an AMD-compatible environment (e.g., RequireJS)
    else   if  ( typeof defineModule === "function"   &&   defineModule.isAmd )   {
      return   defineModule(   ["jquery"],   coreUtility   ) ;
    }
    // Otherwise, assume jQuery is available globally
    else   {
      return   coreUtility(   externalJQuery   ) ;
    }
  } ;

  // Invoke the dependency loader, passing a callback function that receives the DOM library
  invokeWithFramework(   function  ( domLib )   {
    // Declare all necessary variables for the Portuguese locale configuration
    var   c3RendererCollection,   d3RendererCollection,   portugueseFormat,
          portugueseFormatInteger,   portugueseFormatPercent,   googleChartRendererCollection,
          numberFormatter,   visualRenderers,   aggregatorTemplates;

    // Retrieve references to various utility objects from the DOM library's pivot utilities
    numberFormatter   = domLib.pivotUtilities.numberFormat ;
    aggregatorTemplates   = domLib.pivotUtilities.aggregatorTemplates ;
    visualRenderers   = domLib.pivotUtilities.renderers ;
    googleChartRendererCollection   = domLib.pivotUtilities.gchart_renderers ;
    d3RendererCollection   = domLib.pivotUtilities.d3_renderers ;
    c3RendererCollection   = domLib.pivotUtilities.c3_renderers ;

    // Define specific number formatters for the Portuguese language context
    portugueseFormat   = numberFormatter(   {
      thousandsSep:   ".",
      decimalSep:   ","
    }   ) ;
    portugueseFormatInteger   = numberFormatter(   {
      digitsAfterDecimal:   0,
      thousandsSep:   ".",
      decimalSep:   ","
    }   ) ;
    portugueseFormatPercent   = numberFormatter(   {
      digitsAfterDecimal:   2,
      scaler:   100,
      suffix:   "%",
      thousandsSep:   ".",
      decimalSep:   ","
    }   ) ;

    // Configure the Portuguese locale within the pivot utilities
    domLib.pivotUtilities.locales.pt   =   {
      localeStrings:   {
        renderError:   "Ocorreu um error ao renderizar os resultados da Tabela Din&atilde;mica.",
        computeError:   "Ocorreu um error ao computar os resultados da Tabela Din&atilde;mica.",
        uiRenderError:   "Ocorreu um error ao renderizar a interface da Tabela Din&atilde;mica.",
        selectAll:   "Selecionar Tudo",
        selectNone:   "Selecionar Nenhum",
        tooMany:   "(demais para listar)",
        filterResults:   "Filtrar resultados",
        totals:   "Totais",
        vs:   "vs",
        by:   "por"
      } ,
      aggregators:   {
        "Contagem":   aggregatorTemplates.count(   portugueseFormatInteger   ) ,
        "Contagem de Valores &uacute;nicos":   aggregatorTemplates.countUnique(   portugueseFormatInteger   ) ,
        "Lista de Valores &uacute;nicos":   aggregatorTemplates.listUnique(   ", "   ) ,
        "Soma":   aggregatorTemplates.sum(   portugueseFormat   ) ,
        "Soma de Inteiros":   aggregatorTemplates.sum(   portugueseFormatInteger   ) ,
        "Média":   aggregatorTemplates.average(   portugueseFormat   ) ,
        "Mínimo":   aggregatorTemplates.min(   portugueseFormat   ) ,
        "Máximo":   aggregatorTemplates.max(   portugueseFormat   ) ,
        "Soma sobre Soma":   aggregatorTemplates.sumOverSum(   portugueseFormat   ) ,
        "Limite Superior a 80%":   aggregatorTemplates.sumOverSumBound80(   true,   portugueseFormat   ) ,
        "Limite Inferior a 80%":   aggregatorTemplates.sumOverSumBound80(   false,   portugueseFormat   ) ,
        "Soma como Fra&ccedil;&atilde;o do Total":   aggregatorTemplates.fractionOf(   aggregatorTemplates.sum(),   "total",   portugueseFormatPercent   ) ,
        "Soma como Fra&ccedil;&atilde;o da Linha":   aggregatorTemplates.fractionOf(   aggregatorTemplates.sum(),   "row",   portugueseFormatPercent   ) ,
        "Soma como Fra&ccedil;&atilde;o da Coluna":   aggregatorTemplates.fractionOf(   aggregatorTemplates.sum(),   "col",   portugueseFormatPercent   ) ,
        "Contagem como Fra&ccedil;&atilde;o do Total":   aggregatorTemplates.fractionOf(   aggregatorTemplates.count(),   "total",   portugueseFormatPercent   ) ,
        "Contagem como Fra&ccedil;&atilde;o da Linha":   aggregatorTemplates.fractionOf(   aggregatorTemplates.count(),   "row",   portugueseFormatPercent   ) ,
        "Contagem como Fra&ccedil;&atilde;o da Coluna":   aggregatorTemplates.fractionOf(   aggregatorTemplates.count(),   "col",   portugueseFormatPercent   )
      } ,
      renderers:   {
        "Tabela":   visualRenderers["Table"] ,
        "Tabela com Barras":   visualRenderers["Table Barchart"] ,
        "Mapa de Calor":   visualRenderers["Heatmap"] ,
        "Mapa de Calor por Linhas":   visualRenderers["Row Heatmap"] ,
        "Mapa de Calor por Colunas":   visualRenderers["Col Heatmap"]
      }
    } ;

    // If Google Chart renderers are available, add them to the locale settings
    if  ( googleChartRendererCollection )   {
      domLib.pivotUtilities.locales.pt.gchart_renderers   =   {
        "Gr&aacute;fico de Linhas":   googleChartRendererCollection["Line Chart"] ,
        "Gr&aacute;fico de Barras":   googleChartRendererCollection["Bar Chart"] ,
        "Gr&aacute;fico de Barras Empilhadas":   googleChartRendererCollection["Stacked Bar Chart"] ,
        "Gr&aacute;fico de &Aacute;rea":   googleChartRendererCollection["Area Chart"]
      } ;
    }

    // If D3 renderers are available, integrate them into the locale settings
    if  ( d3RendererCollection )   {
      domLib.pivotUtilities.locales.pt.d3_renderers   =   {
        "Mapa de Árvore":   d3RendererCollection["Treemap"]
      } ;
    }

    // If C3 renderers are available, add them to the locale settings
    if  ( c3RendererCollection )   {
      domLib.pivotUtilities.locales.pt.c3_renderers   =   {
        "Gr&aacute;fico de Linhas":   c3RendererCollection["Line Chart C3"] ,
        "Gr&aacute;fico de Barras":   c3RendererCollection["Bar Chart C3"]
      } ;
    }

    // Return the complete Portuguese locale configuration object
    return   domLib.pivotUtilities.locales.pt ;
  } ) ;

// Call the IIFE with the current 'this' context
} ) . call ( this ) ;