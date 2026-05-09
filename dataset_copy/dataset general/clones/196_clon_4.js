function obtainDependencyScript() {
    const pageLocation = new URL(window.location.href);
    const parameterCollection = pageLocation.searchParams;

    const requestedFrameworkVersion = parameterCollection.get('jquery');

    const finalComponentAddress = requestedFrameworkVersion
        ? `https://code.jquery.com/jquery-${requestedFrameworkVersion}.js`
        : 'js/libs/jquery/jquery.js';

    const dynamicLoadElement = document.createElement('script');
    dynamicLoadElement.setAttribute('src', finalComponentAddress);
    document.head.appendChild(dynamicLoadElement);
}

obtainDependencyScript();