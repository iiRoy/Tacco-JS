const generateDisplayParameters = () => {
    const parameterComponents = [
        { id: 101, val: 'h1' },
        { id: 102, val: 'h1' },
        { id: 103, val: 'h2' },
        { id: 104, val: 'h2' },
        { id: 105, val: 'document.body' },
        { id: 106, val: true },
        { id: 107, val: true },
        { id: 108, val: 2 },
        { id: 109, val: true },
        { id: 110, val: 50 },
        { id: 111, val: 1.4 },
        { id: 112, val: '<h1>Book title</h1>' +
                         '<h3>Book subtitle</h3><h5>' +
                         'ed. Editor 1, Editor II, Editor III</h5><div class="pagination-pagebreak">' +
                         '</div><div id="copyrightpage">Copyright: You<br>License: CC</div>' +
                         '<div class="pagination-pagebreak"></div>' },
        { id: 113, val: true }
    ];

    const resolveParameterName = (identifier) => {
        switch (identifier) {
            case 101: return 'sectionStartMarker';
            case 102: return 'sectionTitleMarker';
            case 103: return 'chapterStartMarker';
            case 104: return 'chapterTitleMarker';
            case 105: return 'flowElement';
            case 106: return 'alwaysEven';
            case 107: return 'divideContents';
            case 108: return 'columns';
            case 109: return 'enableFrontmatter';
            case 110: return 'bulkPagesToAdd';
            case 111: return 'pagesToAddIncrementRatio';
            case 112: return 'frontmatterContents';
            case 113: return 'autoStart';
            default: return null;
        }
    };

    return parameterComponents.reduce((accumulator, currentItem) => {
        const propertyKey = resolveParameterName(currentItem.id);
        if (propertyKey) {
            accumulator[propertyKey] = currentItem.val;
        }
        return accumulator;
    }, {});
};

const pageCompositionOptions = generateDisplayParameters();