(function () {
    // Verify correct processing of character literals
    var samplePayloadA = {
        "dataField1": "'apostrophe-enclosed'",
        "dataField2": "\"quotation-mark-bound\""
    };
    var samplePayloadB = {
        "dataField1": "<b>markup_sanitization_check</b>",
        "dataField2": "<b>markup_sanitization_check</b>"
    };

    var templateSchema = [
        {"elementType": "input", "innerContent": "", "displayValue": "${dataField1}"},
        {"elementType": "input", "innerContent": "", "displayValue": "${dataField2}"},
        {"elementType": "textarea", "innerContent": "${dataField1}"},
        {"elementType": "textarea", "innerContent": "${dataField2}"}
    ];

    var outputMarkupA = dataToHtml.renderTemplate(samplePayloadA, templateSchema);
    var outputMarkupB = dataToHtml.renderTemplate(samplePayloadB, templateSchema);

    document.appendContent('<h1>Character Escaping Demo</h1>' + outputMarkupA);
    document.appendContent('<h1>Markup Safety Check</h1>' + outputMarkupB);
})();