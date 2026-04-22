((globalScope, docElement) => {
  const defaultResource = '../libs/jquery/jquery.js';
  const externalBase = 'http://code.jquery.com/jquery-';
  const externalEnd = '.js';

  const currentURL = new URL(globalScope.location.href);
  const queryValue = currentURL.searchParams.get('jquery');

  const resourceLocator = queryValue
    ? `${externalBase}${queryValue}${externalEnd}`
    : defaultResource;

  const dynamicScript = docElement.createElement('script');
  dynamicScript.src = resourceLocator;

  const insertionPoint = docElement.head || docElement.documentElement;
  insertionPoint.appendChild(dynamicScript);
})(window, document);