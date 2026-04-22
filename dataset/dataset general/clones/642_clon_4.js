(function() {
    const targetSelector = '#gist-202e4e0c04e587a26eb6';
    const sourceData = [
        '<span class=\"cm\">/*  This script demonstrates loading an asset from an &quot;untrusted&quot; 3rd party CDN.<\/span>',
        '<span class=\"cm\">    It checks the asset integrity and decrypts it before using. The key for the<\/span>',
        '<span class=\"cm\">    encryption is stored in the document fragment of the data-src attribute.<\/span>',
        '<span class=\"cm\">    User *must* handle the main page, sjcl, and this script in a secure manner. *\/<\/span>',
        '<span class=\"kd\">var<\/span> <span class=\"nx\">b64<\/span> <span class=\"o\">=<\/span> <span class=\"nx\">sjcl<\/span><span class=\"p\">.<\/span><span class=\"nx\">codec<\/span><span class=\"p\">.<\/span><span class=\"nx\">base64url<\/span><span class=\"p\">,<\/span>',
        '    <span class=\"nx\">sha2<\/span> <span class=\"o\">=<\/span> <span class=\"nx\">sjcl<\/span><span class=\"p\">.<\/span><span class=\"nx\">hash<\/span><span class=\"p\">.<\/span><span class=\"nx\">sha256<\/span><span class=\"p\">,<\/span> ',
        '    <span class=\"nx\">rxp<\/span> <span class=\"o\">=<\/span> <span class=\"k\">new<\/span> <span class=\"nb\">RegExp<\/span><span class=\"p\">(<\/span><span class=\"s1\">&#39;^data:image\\\\/jpeg;base64,[a-zA-Z0-9_\\\\-\\\\+\\\\/]+\\\\={0,2}$&#39;<\/span><span class=\"p\">),<\/span>',
        '    <span class=\"nx\">imgs<\/span> <span class=\"o\">=<\/span> <span class=\"p\">[].<\/span><span class=\"nx\">slice<\/span><span class=\"p\">.<\/span><span class=\"nx\">apply<\/span><span class=\"p\">(<\/span><span class=\"nb\">document<\/span><span class=\"p\">.<\/span><span class=\"nx\">querySelectorAll<\/span><span class=\"p\">(<\/span><span class=\"s1\">&#39;img.encrypted-image&#39;<\/span><span class=\"p\">));<\/span>',
        '<span class=\"nx\">imgs<\/span><span class=\"p\">.<\/span><span class=\"nx\">forEach<\/span><span class=\"p\">(<\/span><span class=\"nx\">decryptImage<\/span><span class=\"p\">);<\/span>',
        '&nbsp;',
        '<span class=\"kd\">function<\/span> <span class=\"nx\">decryptImage<\/span><span class=\"p\">(<\/span><span class=\"nx\">el<\/span><span class=\"p\">){<\/span>',
        '    <span class=\"kd\">var<\/span> <span class=\"nx\">url<\/span> <span class=\"o\">=<\/span> <span class=\"nx\">el<\/span><span class=\"p\">.<\/span><span class=\"nx\">dataset<\/span><span class=\"p\">.<\/span><span class=\"nx\">src<\/span><span class=\"p\">,<\/span>',
        '        <span class=\"nx\">expected<\/span> <span class=\"o\">=<\/span> <span class=\"nx\">el<\/span><span class=\"p\">.<\/span><span class=\"nx\">dataset<\/span><span class=\"p\">.<\/span><span class=\"nx\">shasum<\/span><span class=\"p\">,<\/span>',
        '        <span class=\"nx\">key<\/span> <span class=\"o\">=<\/span> <span class=\"nx\">el<\/span><span class=\"p\">.<\/span><span class=\"nx\">dataset<\/span><span class=\"p\">.<\/span><span class=\"nx\">key<\/span><span class=\"p\">,<\/span>',
        '        <span class=\"nx\">xhr<\/span> <span class=\"o\">=<\/span> <span class=\"k\">new<\/span> <span class=\"nx\">XMLHttpRequest<\/span><span class=\"p\">();<\/span>',
        '    <span class=\"kd\">function<\/span> <span class=\"nx\">abort<\/span><span class=\"p\">(<\/span><span class=\"nx\">msg<\/span><span class=\"p\">){<\/span>',
        '        <span class=\"nx\">el<\/span><span class=\"p\">.<\/span><span class=\"nx\">classList<\/span><span class=\"p\">.<\/span><span class=\"nx\">add<\/span><span class=\"p\">(<\/span><span class=\"s1\">&#39;error&#39;<\/span><span class=\"p\">);<\/span>',
        '        <span class=\"nx\">console<\/span><span class=\"p\">.<\/span><span class=\"nx\">log<\/span><span class=\"p\">(<\/span><span class=\"s2\">&quot;ERROR: &quot;<\/span><span class=\"p\">,<\/span><span class=\"nx\">msg<\/span><span class=\"p\">);<\/span>',
        '        <span class=\"k\">throw<\/span> <span class=\"k\">new<\/span> <span class=\"nb\">Error<\/span><span class=\"p\">(<\/span><span class=\"nx\">msg<\/span><span class=\"p\">);<\/span>',
        '    <span class=\"p\">}<\/span>',
        '    <span class=\"nx\">xhr<\/span><span class=\"p\">.<\/span><span class=\"nx\">open<\/span><span class=\"p\">(<\/span><span class=\"s1\">&#39;GET&#39;<\/span><span class=\"p\">,<\/span> <span class=\"nx\">url<\/span><span class=\"p\">,<\/span> <span class=\"kc\">true<\/span><span class=\"p\">);<\/span>',
        '    <span class=\"nx\">xhr<\/span><span class=\"p\">.<\/span><span class=\"nx\">onreadystatechange<\/span> <span class=\"o\">=<\/span> <span class=\"kd\">function<\/span> <span class=\"nx\">_handle_ready<\/span><span class=\"p\">(){<\/span>',
        '        <span class=\"kd\">var<\/span> <span class=\"nx\">dataURI<\/span><span class=\"p\">;<\/span>',
        '        <span class=\"k\">if<\/span><span class=\"p\">(<\/span><span class=\"nx\">xhr<\/span><span class=\"p\">.<\/span><span class=\"nx\">readyState<\/span> <span class=\"o\">==<\/span> <span class=\"mi\">4<\/span> <span class=\"o\">&amp;&amp;<\/span> <span class=\"nx\">xhr<\/span><span class=\"p\">.<\/span><span class=\"nx\">status<\/span><span class=\"o\">==<\/span><span class=\"mi\">200<\/mi><span class=\"p\">){<\/span>',
        '            <span class=\"k\">if<\/span><span class=\"p\">(<\/span><span class=\"nx\">b64<\/span><span class=\"p\">.<\/span><span class=\"nx\">fromBits<\/span><span class=\"p\">(<\/span><span class=\"nx\">sha2<\/span><span class=\"p\">.<\/span><span class=\"nx\">hash<\/span><span class=\"p\">(<\/span><span class=\"nx\">xhr<\/span><span class=\"p\">.<\/span><span class=\"nx\">responseText<\/span><span class=\"p\">))<\/span> <span class=\"o\">!=<\/span> <span class=\"nx\">expected<\/span><span class=\"p\">){<\/span>',
        '                <span class=\"nx\">abort<\/span><span class=\"p\">(<\/span><span class=\"s2\">&quot;Error with image checksum.&quot;<\/span><span class=\"p\">);<\/span>',
        '            <span class=\"p\">}<\/span>',
        '            <span class=\"k\">if<\/span><span class=\"p\">(<\/span><span class=\"nx\">key<\/span> <span class=\"o\">===<\/span> <span class=\"kc\">undefined<\/span><span class=\"p\">){<\/span>',
        '                <span class=\"c1\">// Unencrypted, but verified. Public/shared assets.<\/span>',
        '                <span class=\"nx\">dataURI<\/span> <span class=\"o\">=<\/span> <span class=\"nx\">xhr<\/span><span class=\"p\">.<\/span><span class=\"nx\">responseText<\/span><span class=\"p\">;<\/span>',
        '            <span class=\"p\">}<\/span><span class=\"k\">else<\/span><span class=\"p\">{<\/span>',
        '               <span class=\"nx\">dataURI<\/span> <span class=\"o\">=<\/span>  <span class=\"nx\">sjcl<\/span><span class=\"p\">.<\/span><span class=\"nx\">decrypt<\/span><span class=\"p\">(<\/span><span class=\"nx\">key<\/span><span class=\"p\">,<\/span> <span class=\"nx\">xhr<\/span><span class=\"p\">.<\/span><span class=\"nx\">responseText<\/span><span class=\"p\">);<\/span>',
        '            <span class=\"p\">}<\/span>',
        '            <span class=\"k\">if<\/span><span class=\"p\">(<\/span><span class=\"nx\">rxp<\/span><span class=\"p\">.<\/span><span class=\"nx\">exec<\/span><span class=\"p\">(<\/span><span class=\"nx\">dataURI<\/span><span class=\"p\">)){<\/span> <span class=\"c1\">// Looks like an image?<\/span>',
        '                <span class=\"nx\">el<\/span><span class=\"p\">.<\/span><span class=\"nx\">src<\/span> <span class=\"o\">=<\/span> <span class=\"nx\">dataURI<\/span><span class=\"p\">;<\/span>',
        '                <span class=\"nx\">el<\/span><span class=\"p\">.<\/span><span class=\"nx\">classList<\/span><span class=\"p\">.<\/span><span class=\"nx\">add<\/span><span class=\"p\">(<\/span><span class=\"s1\">&#39;good&#39;<\/span><span class=\"p\">);<\/span>',
        '            <span class=\"p\">}<\/span><span class=\"k\">else<\/span><span class=\"p\">{<\/span>',
        '                <span class=\"nx\">abort<\/span><span class=\"p\">(<\/span><span class=\"s2\">&quot;Error decoding image.&quot;<\/span><span class=\"p\">);<\/span>',
        '            <span class=\"p\">}<\/span>',
        '        <span class=\"p\">}<\/span><span class=\"k\">else<\/span> <span class=\"k\">if<\/span><span class=\"p\">(<\/span><span class=\"nx\">xhr<\/span><span class=\"p\">.<\/span><span class=\"nx\">state<\/span> <span class=\"o\">==<\/span> <span class=\"mi\">4<\/span><span class=\"p\">){<\/span>',
        '            <span class=\"nx\">abort<\/span><span class=\"p\">(<\/span><span class=\"s2\">&quot;Error downloading image.&quot;<\/span><span class=\"p\">);<\/span>',
        '        <span class=\"p\">}<\/span>',
        '    <span class=\"p\">}<\/span>',
        '    <span class=\"nx\">xhr<\/span><span class=\"p\">.<\/span><span class=\"nx\">send<\/span><span class=\"p\">();<\/span>',
        '<span class=\"p\">}<\/span>'
    ];

    const generateNumbersColumn = (entries) => {
        let numericalSpans = [];
        for (let idx = 0; idx < entries.length; idx++) {
            const lineNumber = idx + 1;
            numericalSpans.push(`<span class=\"line-number\" id=\"file-corscdn-js-L${lineNumber}\" rel=\"file-corscdn-js-L${lineNumber}\">${lineNumber}<\/span>`);
        }
        return numericalSpans.join('\n            ');
    };

    const generateContentColumn = (entries) => {
        let contentDivs = [];
        for (let idx = 0; idx < entries.length; idx++) {
            const lineNumber = idx + 1;
            contentDivs.push(`<div class=\"line\" id=\"file-corscdn-js-LC${lineNumber}\">${entries[idx]}<\/div>`);
        }
        return contentDivs.join('');
    };

    const totalLinesCount = sourceData.length;
    const numberLinesHtml = generateNumbersColumn(sourceData);
    const codeLinesHtml = generateContentColumn(sourceData);

    const finalHtmlContent = `\
<div id=\"gist7607886\" class=\"gist\">
        <div class=\"gist-file\">
          <div class=\"gist-data gist-syntax\">



    <div class=\"file-data\">
      <table cellpadding=\"0\" cellspacing=\"0\" class=\"lines highlight\">
        <tr>
          <td class=\"line-numbers\">
            ${numberLinesHtml}
          <\/td>
          <td class=\"line-data\">
            <pre class=\"line-pre\">${codeLinesHtml}<\/pre>
          <\/td>
        <\/tr>
      <\/table>
    <\/div>

          <\/div>
          <div class=\"gist-meta\">
            <a href=\"https://gist.github.com/cagerton/202e4e0c04e587a26eb6/raw/61fe1226ef5dcc2e83a6a15e8aae93afe6edda8e/corscdn.js\" style=\"float:right\">view raw<\/a>
            <a href=\"https://gist.com/cagerton/202e4e0c04e587a26eb6#file-corscdn-js\">corscdn.js<\/a>
            hosted with &#10084; by <a href=\"https://github.com\">GitHub<\/a>
          <\/div>
        <\/div>
<\/div>
`;

    const destinationElement = document.querySelector(targetSelector);
    if (destinationElement) {
        destinationElement.innerHTML = finalHtmlContent;
    }
})();