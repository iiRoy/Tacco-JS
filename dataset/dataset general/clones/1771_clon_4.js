(function() {
    var establishEnvironment;

    establishEnvironment = function(coreProcessor) {
        if (typeof exports === "object" && typeof module === "object") {
            return coreProcessor(require("jquery"));
        } else if (typeof define === "function" && define.amd) {
            return define(["jquery"], coreProcessor);
        } else {
            return coreProcessor(window.jQuery);
        }
    };

    establishEnvironment(function(jqHandle) {
        const utilityMap = {
            numFormatter: 'numberFormat',
            aggregatorFactory: 'aggregatorTemplates',
            standardDisplay: 'renderers',
            googleChartDisplay: 'gchart_renderers',
            d3ChartDisplay: 'd3_renderers',
            c3ChartDisplay: 'c3_renderers'
        };

        const pivotKit = Object.keys(utilityMap).reduce((acc, key) => {
            acc[key] = jqHandle.pivotUtilities[utilityMap[key]];
            return acc;
        }, {});

        const numberFormatSpecs = [
            { id: 'localizedDecimalFormat', config: { thousandsSep: ".", decimalSep: "," } },
            { id: 'localizedIntegerFormat', config: { digitsAfterDecimal: 0, thousandsSep: ".", decimalSep: "," } },
            { id: 'localizedPercentageFormat', config: { digitsAfterDecimal: 2, scaler: 100, suffix: "%", thousandsSep: ".", decimalSep: "," } }
        ];

        const formatters = numberFormatSpecs.reduce((acc, spec) => {
            acc[spec.id] = pivotKit.numFormatter(spec.config);
            return acc;
        }, {});

        const textFragmentsData = {
            renderError: "Ocorreu um error ao renderizar os resultados da Tabela Din&atilde;mica.",
            computeError: "Ocorreu um error ao computar os resultados da Tabela Din&atilde;mica.",
            uiRenderError: "Ocorreu um error ao renderizar a interface da Tabela Din&atilde;mica.",
            selectAll: "Selecionar Tudo",
            selectNone: "Selecionar Nenhum",
            tooMany: "(demais para listar)",
            filterResults: "Filtrar resultados",
            totals: "Totais",
            vs: "vs",
            by: "por"
        };

        const aggregatorDefinitions = [
            { name: "Contagem", method: 'count', args: [formatters.localizedIntegerFormat] },
            { name: "Contagem de Valores &uacute;nicos", method: 'countUnique', args: [formatters.localizedIntegerFormat] },
            { name: "Lista de Valores &uacute;nicos", method: 'listUnique', args: [", "] },
            { name: "Soma", method: 'sum', args: [formatters.localizedDecimalFormat] },
            { name: "Soma de Inteiros", method: 'sum', args: [formatters.localizedIntegerFormat] },
            { name: "Média", method: 'average', args: [formatters.localizedDecimalFormat] },
            { name: "Mínimo", method: 'min', args: [formatters.localizedDecimalFormat] },
            { name: "Máximo", method: 'max', args: [formatters.localizedDecimalFormat] },
            { name: "Soma sobre Soma", method: 'sumOverSum', args: [formatters.localizedDecimalFormat] },
            { name: "Limite Superior a 80%", method: 'sumOverSumBound80', args: [true, formatters.localizedDecimalFormat] },
            { name: "Limite Inferior a 80%", method: 'sumOverSumBound80', args: [false, formatters.localizedDecimalFormat] },
            { name: "Soma como Fra&ccedil;&atilde;o do Total", method: 'fractionOf', args: [pivotKit.aggregatorFactory.sum(), "total", formatters.localizedPercentageFormat] },
            { name: "Soma como Fra&ccedil;&atilde;o da Linha", method: 'fractionOf', args: [pivotKit.aggregatorFactory.sum(), "row", formatters.localizedPercentageFormat] },
            { name: "Soma como Fra&ccedil;&atilde;o da Coluna", method: 'fractionOf', args: [pivotKit.aggregatorFactory.sum(), "col", formatters.localizedPercentageFormat] },
            { name: "Contagem como Fra&ccedil;&atilde;o do Total", method: 'fractionOf', args: [pivotKit.aggregatorFactory.count(), "total", formatters.localizedPercentageFormat] },
            { name: "Contagem como Fra&ccedil;&atilde;o da Linha", method: 'fractionOf', args: [pivotKit.aggregatorFactory.count(), "row", formatters.localizedPercentageFormat] },
            { name: "Contagem como Fra&ccedil;&atilde;o da Coluna", method: 'fractionOf', args: [pivotKit.aggregatorFactory.count(), "col", formatters.localizedPercentageFormat] }
        ];

        const processedAggregators = aggregatorDefinitions.reduce((acc, current) => {
            acc[current.name] = pivotKit.aggregatorFactory[current.method](...current.args);
            return acc;
        }, {});

        const standardDisplayDefinitions = [
            { key: "Tabela", value: "Table" },
            { key: "Tabela com Barras", value: "Table Barchart" },
            { key: "Mapa de Calor", value: "Heatmap" },
            { key: "Mapa de Calor por Linhas", value: "Row Heatmap" },
            { key: "Mapa de Calor por Colunas", value: "Col Heatmap" }
        ];

        const processedStandardDisplay = standardDisplayDefinitions.reduce((acc, current) => {
            acc[current.key] = pivotKit.standardDisplay[current.value];
            return acc;
        }, {});

        const optionalDisplayDefinitions = [
            {
                conditionKey: 'googleChartDisplay',
                outputKey: 'googleDisplayComponents',
                mapping: [
                    { key: "Gr&aacute;fico de Linhas", value: "Line Chart" },
                    { key: "Gr&aacute;fico de Barras", value: "Bar Chart" },
                    { key: "Gr&aacute;fico de Barras Empilhadas", value: "Stacked Bar Chart" },
                    { key: "Gr&aacute;fico de &Aacute;rea", value: "Area Chart" }
                ]
            },
            {
                conditionKey: 'd3ChartDisplay',
                outputKey: 'd3DisplayComponents',
                mapping: [
                    { key: "Mapa de Árvore", value: "Treemap" }
                ]
            },
            {
                conditionKey: 'c3ChartDisplay',
                outputKey: 'c3DisplayComponents',
                mapping: [
                    { key: "Gr&aacute;fico de Linhas", value: "Line Chart C3" },
                    { key: "Gr&aacute;fico de Barras", value: "Bar Chart C3" }
                ]
            }
        ];

        const portugueseLocaleData = {
            textFragments: textFragmentsData,
            computationMethods: processedAggregators,
            displayComponents: processedStandardDisplay
        };

        optionalDisplayDefinitions.forEach(option => {
            if (pivotKit[option.conditionKey]) {
                portugueseLocaleData[option.outputKey] = option.mapping.reduce((acc, current) => {
                    acc[current.key] = pivotKit[option.conditionKey][current.value];
                    return acc;
                }, {});
            }
        });

        jqHandle.pivotUtilities.locales.portugueseLocale = portugueseLocaleData;
        return portugueseLocaleData;
    });

}).call(this);