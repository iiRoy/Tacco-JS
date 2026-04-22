function dissectWebLocation(locationString) {
    const componentData = {
        source: locationString,
        protocol: "",
        authority: "",
        userInfo: "",
        user: "",
        password: "",
        host: "",
        port: "",
        relative: "",
        path: "",
        directory: "",
        file: "",
        query: "",
        anchor: ""
    };

    let remainingString = locationString;

    const fragmentPattern = /#(.+)$/;
    const queryPattern = /\?(.+)$/;
    const schemePattern = /^([^:\/?#.]+):/;
    const authorityPattern = /^((?:([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?(.*)$/;

    // 1. Extract anchor (fragment)
    const fragmentMatch = remainingString.match(fragmentPattern);
    if (fragmentMatch) {
        componentData.anchor = fragmentMatch[1];
        remainingString = remainingString.substring(0, fragmentMatch.index);
    }

    // 2. Extract query
    const queryMatch = remainingString.match(queryPattern);
    if (queryMatch) {
        componentData.query = queryMatch[1];
        remainingString = remainingString.substring(0, queryMatch.index);
    }

    // 3. Extract protocol (scheme)
    const schemeMatch = remainingString.match(schemePattern);
    if (schemeMatch) {
        componentData.protocol = schemeMatch[1];
        remainingString = remainingString.substring(schemeMatch[0].length);
    }

    // 4. Handle leading "//" for authority
    let hasAuthorityDelimiter = false;
    if (remainingString.startsWith('//')) {
        hasAuthorityDelimiter = true;
        remainingString = remainingString.substring(2);
    }

    // 5. Extract authority components if delimiter was present
    if (hasAuthorityDelimiter) {
        const authMatch = remainingString.match(authorityPattern);
        if (authMatch) {
            componentData.userInfo = authMatch[1] ? (authMatch[2] || '') + (authMatch[3] ? ':' + authMatch[3] : '') : '';
            componentData.user = authMatch[2] || '';
            componentData.password = authMatch[3] || '';
            componentData.host = authMatch[4] || '';
            componentData.port = authMatch[5] || '';
            
            componentData.authority = componentData.userInfo ? `${componentData.userInfo}@${componentData.host}` : componentData.host;
            if (componentData.port) {
                componentData.authority += `:${componentData.port}`;
            }

            remainingString = authMatch[6] || ''; // The rest is path
        }
    }

    // 6. Path (what's left after protocol/authority/query/anchor)
    componentData.path = remainingString;

    const lastSlashPos = componentData.path.lastIndexOf('/');
    if (lastSlashPos !== -1) {
        componentData.directory = componentData.path.substring(0, lastSlashPos + 1);
        componentData.file = componentData.path.substring(lastSlashPos + 1);
    } else {
        componentData.directory = '';
        componentData.file = componentData.path;
    }
    
    // 7. Construct relative path
    componentData.relative = componentData.path +
                             (componentData.query ? `?${componentData.query}` : '') +
                             (componentData.anchor ? `#${componentData.anchor}` : '');

    // 8. Calculate extension
    componentData.extension = componentData.file.includes('.') ? componentData.file.split('.').pop() : '';

    // 9. Parse query string into an object (queryKey)
    componentData.queryKey = {};
    if (componentData.query) {
        componentData.query.split('&').forEach(pair => {
            if (pair) {
                const parts = pair.split('=');
                const key = decodeURIComponent(parts[0]);
                const value = parts[1] ? decodeURIComponent(parts[1]) : '';
                componentData.queryKey[key] = value;
            }
        });
    }

    return componentData;
}

const suffixMappings = new Map([
    ['c', 'c_lang'], ['h', 'c_lang'], ['m', 'c_lang'],
    ['css', 'style_sheet'],
    ['cpp', 'cplusplus'], ['c++', 'cplusplus'], ['cc', 'cplusplus'], ['h', 'cplusplus'],
    ['c#', 'csharp_lang'], ['cs', 'csharp_lang'],
    ['diff', 'diff_file'], ['patch', 'diff_file'],
    ['as', 'actionscript'],
    ['html', 'web_html'], ['htm', 'web_html'],
    ['java', 'java_lang'],
    ['js', 'js_script'],
    ['tex', 'latex_doc'],
    ['log', 'log_file'],
    ['m4', 'macro_m4'],
    ['pas', 'pascal_lang'], ['~pa', 'pascal_lang'],
    ['pl', 'perl_script'],
    ['php', 'php_script'], ['php3', 'php_script'], ['php4', 'php_script'], ['php5', 'php_script'],
    ['py', 'python_script'],
    ['rb', 'ruby_script'],
    ['scl', 'scala_lang'],
    ['sh', 'shell_script'], ['bash', 'bash_script'],
    ['sql', 'sql_query'],
    ['tcl', 'tcl_script'],
    ['xml', 'xml_doc'], ['xhtml', 'xml_doc'], ['xslt', 'xml_doc'], ['xdl', 'xml_doc'],
    ['xlnk', 'xml_doc'], ['xsd', 'xml_doc'], ['xsl', 'xml_doc'], ['xspf', 'xml_doc'], ['xul', 'xml_doc']
]);

const exactNameMappings = new Map([
    ['Makefile', 'makefile_type']
]);

function processFetchedContent(resourcePath, contentString) {
    const addressDetails = dissectWebLocation(resourcePath);
    const fileExtension = addressDetails.extension;
    const fileName = addressDetails.file;

    let renderingStyle = exactNameMappings.get(fileName);

    if (renderingStyle === undefined) {
        renderingStyle = suffixMappings.get(fileExtension);
    }
    
    if (renderingStyle === undefined) {
        if (contentString.trim().startsWith('<')) {
            renderingStyle = 'web_html';
        } else {
            renderingStyle = '';
        }
    }

    const pageTitleElement = document.head.querySelector('title') || document.createElement('title');
    if (!pageTitleElement.parentNode) {
        document.head.appendChild(pageTitleElement);
    }
    pageTitleElement.textContent = fileName ? fileName : resourcePath;

    document.body.innerHTML = '';
    const codeDisplayElement = document.createElement('pre');
    codeDisplayElement.textContent = contentString;
    if (renderingStyle !== '') {
        codeDisplayElement.classList.add('sh_' + renderingStyle);
    }
    document.body.appendChild(codeDisplayElement);

    if (renderingStyle !== '') {
        sh_highlightDocument('js/lang/', '.min.js');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let targetResourcePath = 'samples/jquery.timeago.js';
    
    if (window.location.search) {
        targetResourcePath = decodeURIComponent(window.location.search.substring(1));
    }

    fetch(targetResourcePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            processFetchedContent(targetResourcePath, data);
        })
        .catch(error => {
            console.error('Failed to load resource:', error);
            document.body.innerHTML = '';
            const errorDiv = document.createElement('div');
            errorDiv.textContent = `Error loading content: ${error.message}`;
            errorDiv.style.color = 'red';
            document.body.appendChild(errorDiv);
        });
});

document.body.addEventListener('click', (event) => {
    let clickedElement = event.target;
    while (clickedElement && clickedElement.tagName !== 'A' && clickedElement !== document.body) {
        clickedElement = clickedElement.parentNode;
    }

    if (clickedElement && clickedElement.tagName === 'A') {
        event.preventDefault();

        const linkReference = clickedElement.getAttribute('href');
        if (linkReference) {
            const currentUrl = new URL(window.location.href);
            currentUrl.search = `?${encodeURIComponent(linkReference)}`;
            currentUrl.hash = '';

            window.location.href = currentUrl.toString();
        }
    }
});