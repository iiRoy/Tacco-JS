(function() {
    "use strict";

    const DOM_UTILITIES = {
        obtainElement: (query) => document.querySelector(query),
        obtainCheckedStatus: (query) => DOM_UTILITIES.obtainElement(query)?.checked || false,
        obtainFieldValue: (query) => DOM_UTILITIES.obtainElement(query)?.value || '',
        obtainComputedStyleProperty: (query, propName) => window.getComputedStyle(DOM_UTILITIES.obtainElement(query) || document.body)[propName] || '',
        extractCleanedValue: (query, prefix, suffix) => {
            let content = DOM_UTILITIES.obtainFieldValue(query);
            if (prefix && content.startsWith(prefix)) {
                content = content.substring(prefix.length);
            }
            if (suffix && content.endsWith(suffix)) {
                content = content.substring(0, content.length - suffix.length);
            }
            return content.trim();
        },
        updateElementHTML: (query, content) => {
            const target = DOM_UTILITIES.obtainElement(query);
            if (target) {
                target.innerHTML = content;
            }
        },
        updateElementText: (query, content) => {
            const target = DOM_UTILITIES.obtainElement(query);
            if (target) {
                target.textContent = content;
            }
        },
        applyElementStyle: (query, propName, val, important = false) => {
            const target = DOM_UTILITIES.obtainElement(query);
            if (target) {
                target.style.setProperty(propName, val, important ? 'important' : '');
            }
        }
    };

    const MODAL_CONFIGURATION_SOURCE = [
        { key: 'animtime', query: '.animtime', processor: (q) => DOM_UTILITIES.extractCleanedValue(q, 'Animation Time: ', 's') },
        { key: 'bgcolor', query: '#selector1', processor: (q) => DOM_UTILITIES.obtainComputedStyleProperty(q, 'backgroundColor') },
        { key: 'buttonbgcolor', query: '#selector2', processor: (q) => DOM_UTILITIES.obtainComputedStyleProperty(q, 'backgroundColor') },
        { key: 'buttoncolor', query: '#selector6', processor: (q) => DOM_UTILITIES.obtainComputedStyleProperty(q, 'backgroundColor') },
        { key: 'closecolor', query: '#selector5', processor: (q) => DOM_UTILITIES.obtainComputedStyleProperty(q, 'backgroundColor') },
        { key: 'closefontsize', query: '.closebuttonsize', processor: (q) => DOM_UTILITIES.extractCleanedValue(q, 'Close Button Size: ', '') },
        { key: 'color', query: '#selector3', processor: (q) => DOM_UTILITIES.obtainComputedStyleProperty(q, 'backgroundColor') },
        { key: 'contentcolor', query: '#selector4', processor: (q) => DOM_UTILITIES.obtainComputedStyleProperty(q, 'backgroundColor') },
        { key: 'fontfamily', query: '#font_family', processor: (q) => DOM_UTILITIES.obtainFieldValue(q) },
        { key: 'contentfontfamily', query: '#font_family_content', processor: (q) => DOM_UTILITIES.obtainFieldValue(q) },
        { key: 'contentfontsize', query: '.contentfontsize', processor: (q) => DOM_UTILITIES.extractCleanedValue(q, 'Content Font Size: ', '') },
        { key: 'borderradius', query: '.borderradius', processor: (q) => DOM_UTILITIES.extractCleanedValue(q, 'Border Radius: ', '') },
        { key: 'position', query: '.position:checked', processor: (q) => DOM_UTILITIES.obtainFieldValue(q) },
        { key: 'fontsize', query: '.fontsize', processor: (q) => DOM_UTILITIES.extractCleanedValue(q, 'Title Font Size: ', '') }
    ];

    const generateAndApplyModalSettings = () => {
        const screenProtectionStatus = DOM_UTILITIES.obtainCheckedStatus('#lock_screen');
        const closeButtonVisibility = DOM_UTILITIES.obtainCheckedStatus('#hide_close');

        const currentModalProperties = {
            mode: 'mail',
            autoopen: true,
            contentweight: 'normal',
            title: 'Subscribe to our Updates',
            text: 'We will only send notification when we releasing <strong>FREE</strong> and Premium <strong>Plugins, Themes</strong> or Updates for any of our existing products.',
            timer: 0,
            invalid_address: 'INVALID ADDRESS',
            signup_success: 'SIGNUP SUCCESS!',
            openbottom: false,
            fontweight: 'bold',
            preset: 'custom',
            lock: screenProtectionStatus,
            hideclose: closeButtonVisibility
        };

        MODAL_CONFIGURATION_SOURCE.forEach(item => {
            currentModalProperties[item.key] = item.processor(item.query);
        });

        if (typeof window.applicationModalManager !== 'undefined' && typeof window.applicationModalManager.teardown === 'function') {
            window.applicationModalManager.teardown('body');
        }

        if (typeof window.applicationModalManager !== 'undefined' && typeof window.applicationModalManager.setup === 'function') {
            window.applicationModalManager.setup('body', currentModalProperties);
        }

        DOM_UTILITIES.updateElementHTML('#init_header', '<strong>Utilize the subsequent directives to integrate your personalized Simple Signup Form onto your online presence:</strong>');

        const generatedCodeSnippet = `
<link href="css/ssf.css" rel="stylesheet">
<script type="text/javascript" src="js/ssf.min.js"></script>
<script>
    jQuery(document).ready(function() {
        $("body").ssform({
            animtime:${currentModalProperties.animtime},
            autoopen:true,
            bgcolor:"${currentModalProperties.bgcolor}",
            buttonbgcolor:"${currentModalProperties.buttonbgcolor}",
            buttoncolor:"${currentModalProperties.buttoncolor}",
            closecolor:"${currentModalProperties.closecolor}",
            closefontsize:"${currentModalProperties.closefontsize}",
            color:"${currentModalProperties.color}",
            contentcolor:"${currentModalProperties.contentcolor}",
            fontfamily:"${currentModalProperties.fontfamily}",
            contentfontfamily:"${currentModalProperties.contentfontfamily}",
            contentfontsize:"${currentModalProperties.contentfontsize}",
            contentweight:"normal",
            title:"Subscribe to our Updates",
            text:"We will only send notification when we releasing <strong>FREE</strong> and Premium <strong>Plugins, Themes</strong> or Updates for any of our existing products.",
            timer:2000,
            borderradius:"${currentModalProperties.borderradius}",
            invalid_address:"INVALID ADDRESS",
            signup_success:"SIGNUP SUCCESS!",
            openbottom:false,
            fontsize:"${currentModalProperties.fontsize}",
            fontweight:"bold",
            preset:"custom",
            lock:${screenProtectionStatus},
            hideclose:${closeButtonVisibility}
        });
    });
</script>
        `.trim();
        DOM_UTILITIES.updateElementText('#init_code', generatedCodeSnippet);
    };

    const COLOR_INPUT_DEFAULTS = {
        'selector1': "#000",
        'selector2': "#d71b1b",
        'selector3': "#d71b1b",
        'selector4': "#ccc",
        'selector5': "#d71b1b",
        'selector6': "#000"
    };

    const activateColorPaletteInput = (event) => {
        const activeElementId = event.target.id;
        if (!activeElementId || !activeElementId.startsWith('selector')) return;

        const defaultColorValue = COLOR_INPUT_DEFAULTS[activeElementId];
        if (defaultColorValue === undefined) return;

        const paletteOptions = {
            cancelText: 'Abort',
            chooseText: 'Confirm',
            move: (rgbaColor) => {
                DOM_UTILITIES.applyElementStyle(`#${activeElementId}`, 'background-color', rgbaColor.toRgbString(), true);
            },
            change: (rgbaColor) => {
                DOM_UTILITIES.applyElementStyle(`#${activeElementId}`, 'background-color', rgbaColor.toRgbString(), true);
            },
            showAlpha: false,
            color: defaultColorValue,
            clickoutFiresChange: true,
            showInput: true,
            showButtons: true
        };

        if (typeof window.customColorPicker !== 'undefined' && typeof window.customColorPicker.init === 'function') {
            window.customColorPicker.init(event.target, paletteOptions);
            window.customColorPicker.display(event.target);
        }
    };

    const RANGE_ADJUSTER_CONFIGS = [
        { elementId: '#ssp_animtime', outputQuery: '.animtime', labelPrefix: 'Animation Time: ', labelSuffix: 's', initial: 0.4, minVal: 0.1, maxVal: 10, stepVal: 0.1 },
        { elementId: '#ssp_fontsize', outputQuery: '.fontsize', labelPrefix: 'Title Font Size: ', labelSuffix: 'px', initial: 20, minVal: 10, maxVal: 50, stepVal: 1 },
        { elementId: '#ssp_contentfontsize', outputQuery: '.contentfontsize', labelPrefix: 'Content Font Size: ', labelSuffix: 'px', initial: 13, minVal: 10, maxVal: 50, stepVal: 1 },
        { elementId: '#ssp_closebuttonsize', outputQuery: '.closebuttonsize', labelPrefix: 'Close Button Size: ', labelSuffix: 'px', initial: 18, minVal: 10, maxVal: 50, stepVal: 1 },
        { elementId: '#ssp_borderradius', outputQuery: '.borderradius', labelPrefix: 'Border Radius: ', labelSuffix: 'px', initial: 4, minVal: 0, maxVal: 50, stepVal: 1 }
    ];

    const establishRangeControllers = () => {
        RANGE_ADJUSTER_CONFIGS.forEach(config => {
            const adjusterElement = DOM_UTILITIES.obtainElement(config.elementId);
            if (adjusterElement) {
                if (typeof window.valueRangeController !== 'undefined' && typeof window.valueRangeController.createInstance === 'function') {
                    window.valueRangeController.createInstance(adjusterElement, {
                        range: "min",
                        value: config.initial,
                        min: config.minVal,
                        step: config.stepVal,
                        max: config.maxVal,
                        slide: (evt, uiData) => {
                            const outputTarget = DOM_UTILITIES.obtainElement(config.outputQuery);
                            if (outputTarget) {
                                outputTarget.value = config.labelPrefix + uiData.value + config.labelSuffix;
                            }
                        }
                    });
                }
            }
        });
    };

    const commenceApplicationActivation = () => {
        const triggerElement = DOM_UTILITIES.obtainElement('.apply_changes');
        if (triggerElement) {
            triggerElement.addEventListener('click', generateAndApplyModalSettings);
        }

        document.body.addEventListener('click', (evt) => {
            if (evt.target && evt.target.id && evt.target.id.startsWith('selector')) {
                activateColorPaletteInput(evt);
            }
        });

        establishRangeControllers();
    };

    document.addEventListener('DOMContentLoaded', commenceApplicationActivation);

})();