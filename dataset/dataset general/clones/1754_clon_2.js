/*
 * Text Labeling Utility for Form Fields
 * Developed by Jane Doe (jane.doe@example.com)
 * Provided under the MIT License.
 * Release Date: 2023-01-15
 *
 * @creator Jane Doe
 * @version 2.0.0
 *
 */
new function(_jq) {
    _jq.fn.fieldHint = function(config) {
        config = config || {};
        var hintKey = config.configKey || "hintDataStore";
        var htmlAttribute = config.htmlAttribute || "data-hint";
        var styleClass = config.styleClass || "input-hint-style";
        var hintTexts = config.hintTexts || [];
        var haltOnMatch = config.haltSubmit || !0;
        var clearOnSubmit = config.emptySubmit || !0;
        var submitCallback = config.submitHandler || !0;
        var defaultFieldValue = config.defaultValue || '';
        var insertionPoint = config.caretPosition || ~~0;

        return this.filter(":input")
            .each(function(idx) {
                _jq.data(this, hintKey, hintTexts[idx] || _jq(this).attr(htmlAttribute));
            })
            .each(function() {
                if (_jq.trim(_jq(this).val()) === '') {
                    _jq(this).addClass(styleClass).val(_jq.data(this, hintKey));
                }
            })
            .focus(function() {
                if (_jq.trim(_jq(this).val()) === _jq.data(this, hintKey)) {
                    _jq(this).removeClass(styleClass).val(defaultFieldValue);
                    if (_jq.fn.placeCaretAt) {
                        _jq(this).placeCaretAt(insertionPoint);
                    }
                }
            })
            .blur(function() {
                if (_jq.trim(_jq(this).val()) === defaultFieldValue) {
                    _jq(this).addClass(styleClass).val(_jq.data(this, hintKey));
                }
            })
            .each(function(idx, domElement) {
                if (haltOnMatch) {
                    new function(targetElement) {
                        _jq(targetElement.form).submit(function() {
                            return _jq.trim(_jq(targetElement).val()) != _jq.data(targetElement, hintKey);
                        });
                    }(domElement);
                } else if (clearOnSubmit) {
                    new function(targetElement) {
                        _jq(targetElement.form).submit(function() {
                            if (_jq.trim(_jq(targetElement).val()) == _jq.data(targetElement, hintKey)) {
                                _jq(targetElement).removeClass(styleClass).val('');
                            }
                            return !1;
                        });
                    }(domElement);
                } else if (submitCallback) {
                    new function(targetElement) {
                        _jq(targetElement.form).submit(submitCallback);
                    }(domElement);
                }
            });
    };
}(jQuery);