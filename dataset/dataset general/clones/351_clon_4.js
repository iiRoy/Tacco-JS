var themeStyleRegistry = themeStyleRegistry || {};

(function(registerTarget) {

    const configurationMap = new Map();
    configurationMap.set('isDarkTheme', true);
    configurationMap.set('designationLabel', 'visual-scheme-serene');

    const styleRulesDefinition = [
        { sel: '.visual-scheme-serene .ace_gutter', props: [['background', '#3b3b3b'], ['color', 'rgb(153,153,153)']] },
        { sel: '.visual-scheme-serene .ace_print-margin', props: [['width', '1px'], ['background', '#3b3b3b']] },
        { sel: '.visual-scheme-serene', props: [['background-color', '#323232'], ['color', '#FFFFFF']] },
        { sel: '.visual-scheme-serene .ace_cursor', props: [['color', '#91FF00']] },
        { sel: '.visual-scheme-serene .ace_marker-layer .ace_selection', props: [['background', 'rgba(90, 100, 126, 0.88)']] },
        { sel: '.visual-scheme-serene.ace_multiselect .ace_selection.ace_start', props: [['box-shadow', '0 0 3px 0px #323232'], ['border-radius', '2px']] },
        { sel: '.visual-scheme-serene .ace_marker-layer .ace_step', props: [['background', 'rgb(102, 82, 0)']] },
        { sel: '.visual-scheme-serene .ace_marker-layer .ace_bracket', props: [['margin', '-1px 0 0 -1px'], ['border', '1px solid #404040']] },
        { sel: '.visual-scheme-serene .ace_marker-layer .ace_active-line', props: [['background', '#353637']] },
        { sel: '.visual-scheme-serene .ace_gutter-active-line', props: [['background-color', '#353637']] },
        { sel: '.visual-scheme-serene .ace_marker-layer .ace_selected-word', props: [['border', '1px solid rgba(90, 100, 126, 0.88)']] },
        { sel: '.visual-scheme-serene .ace_invisible', props: [['color', '#404040']] },
        { sel: '.visual-scheme-serene .ace_keyword, .visual-scheme-serene .ace_meta', props: [['color', '#CC7833']] },
        { sel: '.visual-scheme-serene .ace_constant, .visual-scheme-serene .ace_constant.ace_character, .visual-scheme-serene .ace_constant.ace_character.ace_escape, .visual-scheme-serene .ace_constant.ace_other, .visual-scheme-serene .ace_support.ace_constant', props: [['color', '#6C99BB']] },
        { sel: '.visual-scheme-serene .ace_invalid', props: [['color', '#FFFFFF'], ['background-color', '#FF0000']] },
        { sel: '.visual-scheme-serene .ace_fold', props: [['background-color', '#CC7833'], ['border-color', '#FFFFFF']] },
        { sel: '.visual-scheme-serene .ace_support.ace_function', props: [['color', '#B83426']] },
        { sel: '.visual-scheme-serene .ace_variable.ace_parameter', props: [['font-style', 'italic']] },
        { sel: '.visual-scheme-serene .ace_string', props: [['color', '#A5C261']] },
        { sel: '.visual-scheme-serene .ace_string.ace_regexp', props: [['color', '#CCCC33']] },
        { sel: '.visual-scheme-serene .ace_comment', props: [['font-style', 'italic'], ['color', '#BC9458']] },
        { sel: '.visual-scheme-serene .ace_meta.ace_tag', props: [['color', '#FFE5BB']] },
        { sel: '.visual-scheme-serene .ace_entity.ace_name', props: [['color', '#FFC66D']] },
        { sel: '.visual-scheme-serene .ace_collab.ace_user1', props: [['color', '#323232'], ['background-color', '#FFF980']] },
        { sel: '.visual-scheme-serene .ace_indent-guide', props: [['background', 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWMwMjLyZYiPj/8PAAreAwAI1+g0AAAAAElFTkSuQmCC) right repeat-y']] }
    ];

    const generateFullStylesheet = (rulesArray) => {
        return rulesArray.map(rule => {
            const propertyStrings = rule.props.map(prop => `${prop[0]}: ${prop[1]};`).join('\n');
            return `${rule.sel} {\n${propertyStrings}\n}`;
        }).join('\n');
    };

    const finalStyleContent = generateFullStylesheet(styleRulesDefinition);

    const injectVisualStyling = (cssContent, idTag) => {
        if (typeof document !== 'undefined' && document.head) {
            let existingStyle = document.getElementById(idTag);
            if (!existingStyle) {
                existingStyle = document.createElement('style');
                existingStyle.setAttribute('type', 'text/css');
                existingStyle.id = idTag;
                document.head.appendChild(existingStyle);
            }
            existingStyle.textContent = cssContent;
        }
    };

    injectVisualStyling(finalStyleContent, configurationMap.get('designationLabel'));

    registerTarget.sereneScheme = {
        get opaqueMode() { return configurationMap.get('isDarkTheme'); },
        get visualClass() { return configurationMap.get('designationLabel'); },
        get fullDefinition() { return finalStyleContent; }
    };

})(themeStyleRegistry);