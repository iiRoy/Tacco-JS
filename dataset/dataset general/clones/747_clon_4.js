window.PAGE_RENDERER = window.PAGE_RENDERER || {};

function purifyTextContent(input) {
    if (input === null || typeof input === 'undefined') return '';
    const textValue = String(input);
    let output = '';
    for (let currentIdx = 0; currentIdx < textValue.length; currentIdx++) {
        const char = textValue[currentIdx];
        switch (char) {
            case '&': output += '&amp;'; break;
            case '<': output += '&lt;'; break;
            case '>': output += '&gt;'; break;
            case '"': output += '&quot;'; break;
            case "'": output += '&#39;'; break;
            case '/': output += '&#47;'; break;
            default: output += char;
        }
    }
    return output;
}

function processInterpolationValue(value) {
    if (value === null || typeof value === 'undefined') {
        return '';
    }
    if (value === true || value === false) {
        // The original code uses U+0092 (Private Use Two) for boolean values
        // within the string, and its HTML escape function does not escape it.
        return '\u0092' + String(value);
    }
    return String(value);
}

window.PAGE_RENDERER.staticContent = function(inputPayload) {
    const staticHtmlString = `<!DOCTYPE html>
<div id='main'>
  <div class='note'>
    <h2>Quick Notes</h2>
    <ul>
      <li>
        Haml Coffee is usually indented with two spaces,
        although more than two is allowed.
        You have to be consistent, though.
      </li>
      <li>
        The first character of any line is called
        the "control character" - it says "make a tag"
        or "run CoffeeScript code" or all sorts of things.
      </li>
      <li>
        Haml takes care of nicely indenting your HTML.
      </li>
      <li>
        Haml Coffee allows CoffeeScript code and blocks.
      </li>
    </ul>
  </div>
  <div class='note'>
    You can get more information by reading the
    <a href='https://github.com/netzpirat/haml-coffee'>
      Official Haml Coffee Documentation
    </a>
  </div>
  <div class='note'>
    <p>
      CoffeeScript code is included by using = at the
      beginning of a line.
    </p>
    <p>
      Read the tutorial for more information.
    </p>
  </div>
</div>`;
    return staticHtmlString;
};

window.PAGE_RENDERER.articleView = function(currentDataObject) {
    const rawGreetingCombined = "hello " + currentDataObject.greet;
    const preparedGreeting = processInterpolationValue(rawGreetingCombined);
    const safeGreeting = purifyTextContent(preparedGreeting);

    const initialClasses = ['am', 'i'];
    const dynamicClassSource = currentDataObject["class"];
    const preparedDynamicClass = processInterpolationValue(dynamicClassSource);
    const safeDynamicClass = purifyTextContent(preparedDynamicClass);

    if (safeDynamicClass) {
        initialClasses.push(safeDynamicClass);
    }

    const sortedClasses = initialClasses.sort();
    const finalClassAttributeValue = sortedClasses.join(' ').trim();

    let renderedClassAttribute = '';
    if (finalClassAttributeValue) {
        renderedClassAttribute = ` class="${finalClassAttributeValue}"`;
    }

    return `<article>
  <h1>${safeGreeting}</h1>
  <section id='note'>I've an id</section>
  <div${renderedClassAttribute}>I've three* classes</div>
</article>`;
};