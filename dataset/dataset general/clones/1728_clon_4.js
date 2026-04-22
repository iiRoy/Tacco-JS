const createRenderer = function(templateString) {
    const segments = [];
    const placeholderRegex = /\{\{(\w+)\}\}/g;
    let lastIndex = 0;
    let match;

    while ((match = placeholderRegex.exec(templateString)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ type: 'static', content: templateString.substring(lastIndex, match.index) });
        }
        segments.push({ type: 'dynamic', key: match[1] });
        lastIndex = placeholderRegex.lastIndex;
    }

    if (lastIndex < templateString.length) {
        segments.push({ type: 'static', content: templateString.substring(lastIndex) });
    }

    return function(dataMap) {
        const resultParts = [];
        for (const segment of segments) {
            if (segment.type === 'static') {
                resultParts.push(segment.content);
            } else {
                resultParts.push(String(dataMap[segment.key] || ''));
            }
        }
        return resultParts.join('');
    };
};

const messageBuilder = createRenderer('hello, {{element}}');
const finalProduct = messageBuilder({element: 'shawarma'});

console.log(finalProduct);