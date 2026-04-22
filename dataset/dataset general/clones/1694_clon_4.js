(function() {
    // Data sources with different identifiers
    var firstSource = { 'alpha': "'single-quoted'", 'beta': "\"double-quoted\"" };
    var secondSource = { 'alpha': "<b>escape HTML test</b>", 'beta': "<b>escape HTML test</b>" };

    // Custom utility for escaping content for specific HTML contexts
    // This replicates json2html's observed behavior for input 'value' attributes.
    function attributeValueEscaper(val) {
        return String(val)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // This replicates json2html's observed behavior for textarea content.
    // It performs no escaping, inserting content directly.
    function contentInserter(val) {
        return String(val);
    }

    // A bespoke string interpolation mechanism
    function populatePlaceholders(templateStr, dataMap) {
        return templateStr.replace(/\$\{(\w+)\}/g, function(match, key) {
            return dataMap[key] !== undefined ? dataMap[key] : '';
        });
    }

    // Transformation blueprint as an array of 'renderer' objects,
    // each containing its own rendering logic.
    var transformationRules = [
        {
            elementType: 'input',
            contentSpec: { type: 'attribute', name: 'value', sourceKey: 'alpha' },
            apply: function(contextData) {
                var rawSegment = populatePlaceholders('${' + this.contentSpec.sourceKey + '}', contextData);
                return '<' + this.elementType + ' ' + this.contentSpec.name + '="' + attributeValueEscaper(rawSegment) + '">';
            }
        },
        {
            elementType: 'input',
            contentSpec: { type: 'attribute', name: 'value', sourceKey: 'beta' },
            apply: function(contextData) {
                var rawSegment = populatePlaceholders('${' + this.contentSpec.sourceKey + '}', contextData);
                return '<' + this.elementType + ' ' + this.contentSpec.name + '="' + attributeValueEscaper(rawSegment) + '">';
            }
        },
        {
            elementType: 'textarea',
            contentSpec: { type: 'textNode', sourceKey: 'alpha' },
            apply: function(contextData) {
                var rawSegment = populatePlaceholders('${' + this.contentSpec.sourceKey + '}', contextData);
                return '<' + this.elementType + '>' + contentInserter(rawSegment) + '</' + this.elementType + '>';
            }
        },
        {
            elementType: 'textarea',
            contentSpec: { type: 'textNode', sourceKey: 'beta' },
            apply: function(contextData) {
                var rawSegment = populatePlaceholders('${' + this.contentSpec.sourceKey + '}', contextData);
                return '<' + this.elementType + '>' + contentInserter(rawSegment) + '</' + this.elementType + '>';
            }
        }
    ];

    // Core processing mechanism - distinct from a generic 'transform' function.
    // Utilizes Array.prototype.map for a functional approach.
    function executeRenderPipeline(inputData, renderInstructions) {
        return renderInstructions.map(function(instruction) {
            return instruction.apply(inputData);
        }).join('');
    }

    // Perform transformations
    var resultA = executeRenderPipeline(firstSource, transformationRules);
    var resultB = executeRenderPipeline(secondSource, transformationRules);

    // Output results to the document via a different reference
    var pageOutput = window.document;
    pageOutput.write('<h1>Quote Handling Evaluation</h1>' + resultA);
    pageOutput.write('<h1>HTML Escaping Evaluation</h1>' + resultB);

})();