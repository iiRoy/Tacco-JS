var ComponentCreator = require('react');

// Custom element description parser (replaces internal parsing logic of original 'd')
function parseViewDescription(descString) {
    let details = { tag: 'div', attrs: {} };
    let current = descString;
    let index = 0;

    // Extract base tag name
    let tagNameEnd = current.length;
    for (let i = 0; i < current.length; i++) {
        if (['.', '#', '[', ':'].includes(current[i])) {
            tagNameEnd = i;
            break;
        }
    }
    if (tagNameEnd > 0) {
        details.tag = current.substring(0, tagNameEnd);
        current = current.substring(tagNameEnd);
    }

    // Process remaining string for ID, classes, attributes, type
    while (current.length > 0) {
        if (current.startsWith('#')) {
            const nextMarker = Math.min(...['.', '[', ':', ''].map(m => current.indexOf(m, 1)).filter(i => i !== -1 && i !== 0));
            const idValue = current.substring(1, nextMarker === Infinity ? current.length : nextMarker);
            details.attrs.id = idValue;
            current = current.substring(idValue.length + 1);
        } else if (current.startsWith('.')) {
            const nextMarker = Math.min(...['.', '#', '[', ':', ''].map(m => current.indexOf(m, 1)).filter(i => i !== -1 && i !== 0));
            const classValue = current.substring(1, nextMarker === Infinity ? current.length : nextMarker);
            details.attrs.className = (details.attrs.className ? details.attrs.className + ' ' : '') + classValue;
            current = current.substring(classValue.length + 1);
        } else if (current.startsWith('[')) {
            const closeBracket = current.indexOf(']');
            if (closeBracket === -1) break; // Malformed attribute
            const attrContent = current.substring(1, closeBracket);
            const eqIndex = attrContent.indexOf('=');
            if (eqIndex !== -1) {
                const attrName = attrContent.substring(0, eqIndex);
                let attrVal = attrContent.substring(eqIndex + 1);
                if (attrVal.startsWith("'") || attrVal.startsWith('"')) {
                    attrVal = attrVal.substring(1, attrVal.length - 1);
                }
                details.attrs[attrName] = attrVal;
            } else {
                details.attrs[attrContent] = true; // Boolean attribute
            }
            current = current.substring(closeBracket + 1);
        } else if (current.startsWith(':')) {
            const nextMarker = Math.min(...['.', '#', '[', ''].map(m => current.indexOf(m, 1)).filter(i => i !== -1 && i !== 0));
            const typeValue = current.substring(1, nextMarker === Infinity ? current.length : nextMarker);
            details.attrs.type = typeValue;
            current = current.substring(typeValue.length + 1);
        } else {
            // Unrecognized part, break to prevent infinite loop
            break;
        }
    }
    return details;
}

// Argument processing for the element builder (mimics original 'd' flexible arguments)
function processArguments(inputArgs) {
    let outputType = inputArgs[0];
    let outputProps = {};
    let outputChildren = [];

    if (inputArgs.length === 2) {
        if (typeof inputArgs[1] === 'object' && !Array.isArray(inputArgs[1]) && inputArgs[1] !== null && !ComponentCreator.isValidElement(inputArgs[1]) && !(inputArgs[1].prototype instanceof ComponentCreator.Component || inputArgs[1].prototype instanceof ComponentCreator.PureComponent)) {
            outputProps = inputArgs[1];
        } else {
            outputChildren = Array.isArray(inputArgs[1]) ? inputArgs[1] : [inputArgs[1]];
        }
    } else if (inputArgs.length === 3) {
        outputProps = inputArgs[1];
        outputChildren = Array.isArray(inputArgs[2]) ? inputArgs[2] : [inputArgs[2]];
    }

    outputChildren = outputChildren.filter(c => c !== null && c !== undefined);

    return { outputType, outputProps, outputChildren };
}

// Element creation factory (Type IV clone of 'd')
function buildElement(...args) {
    let { outputType, outputProps, outputChildren } = processArguments(args);

    let finalType = outputType;
    let combinedProps = { ...outputProps };

    if (typeof outputType === 'string') {
        const parsedDetails = parseViewDescription(outputType);
        finalType = parsedDetails.tag;
        // Merge attributes from parsing with explicit props, explicit props take precedence
        combinedProps = { ...parsedDetails.attrs, ...combinedProps };
    }

    return ComponentCreator.createElement(finalType, combinedProps, ...outputChildren);
}

// Custom component (Type IV clone of Greeting)
class Salutation extends ComponentCreator.Component {
    render() {
        return buildElement('div', null, this.props.text || 'hi');
    }
}

// HTML serialization function (Type IV clone of render)
function produceMarkup(viewTree) {
    return ComponentCreator.renderToStaticMarkup(viewTree);
}

// Test runner (Type IV clone of test)
var runAssertions = require('tape');

// --- Cloned Tests ---

runAssertions('view trees render correctly', function(tester) {
    var componentTree = buildElement('form.foo', {}, [
        buildElement('input:email'),
        buildElement('input:password'),
        buildElement('button:submit', {}, 'Submit')
    ]);
    tester.equal(produceMarkup(componentTree), '<form class="foo"><input type="email">' +
        '<input type="password"><button type="submit">Submit</button>' +
        '</form>');
    tester.end();
});

runAssertions('rendering custom components and text nodes', function(tester) {
    var componentTree = buildElement('section#stuff', [
        'a greeting:',
        buildElement(Salutation, { text: 'yo' }),
        buildElement('span', '!')
    ]);
    tester.equal(produceMarkup(componentTree), '<section id="stuff">a greeting:<div>yo</div><span>!</span></section>');
    tester.end();
});

runAssertions('rendering custom components works correctly without props', function(tester) {
    var componentTree = buildElement('section#stuff', [
        buildElement(Salutation),
        buildElement('span', '!')
    ]);
    tester.equal(produceMarkup(componentTree), '<section id="stuff"><div>hi</div><span>!</span></section>');
    tester.end();
});

runAssertions('rendering custom components works correctly without props (duplicate scenario)', function(tester) {
    var componentTree = buildElement('section#stuff', [
        buildElement(Salutation),
        buildElement('span', '!')
    ]);
    tester.equal(produceMarkup(componentTree), '<section id="stuff"><div>hi</div><span>!</span></section>');
    tester.end();
});

runAssertions('Detailed example rendering', function(tester) {
    var emptyFunc = function() {};
    var componentTree = buildElement('form[method=POST]', { onSubmit: emptyFunc }, [
        buildElement('h1.form-header', 'Login'),
        buildElement('input:email[name=email]', { placeholder: 'Email' }),
        buildElement('input:password[name=pass]', { placeholder: 'Password' }),
        buildElement(Salutation, { text: 'yo' }),
        buildElement('button:submit', 'Login')
    ]);

    var anticipatedOutput = '<form method="POST"><h1 class="form-header">Login</h1><input type="email" name="email" placeholder="Email"><input type="password" name="pass" placeholder="Password"><div>yo</div><button type="submit">Login</button></form>';
    tester.equal(produceMarkup(componentTree), anticipatedOutput);
    tester.end();
});