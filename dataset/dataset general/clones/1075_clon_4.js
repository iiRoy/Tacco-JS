define(function (getDependency, deliverOutput, currentModule) {
    'use strict';

    const elementData = [
        { id: 'itemt', val: 'itemtype="http://schema.org/*"' },
        { id: 'data', val: 'data-*=""' },
        { id: 'aria', val: 'aria-*=""' },
        { id: 'a', val: 'a(href="")' },
        { id: 'at', val: 'a(href="", target="_blank")' },
        { id: 'img', val: 'img(src="", width="", height="", alt="")' },
        { id: 'script', val: 'script(type="text/javascript", src="")' },
        { id: 'link', val: 'link(rel="stylesheet", type="text/css", href="")' },
        { id: 'form', val: 'form(id="", name="", action="", method="")' },
        { id: 'inp', val: 'input(type="text", placeholder="")' },
        { id: 'inpe', val: 'input(type="email", placeholder="")' },
        { id: 'inptel', val: 'input(type="tel", placeholder="")' },
        { id: 'inpd', val: 'input(type="date", placeholder="")' },
        { id: 'inpdt', val: 'input(type="datetime", placeholder="")' },
        { id: 'inpdtl', val: 'input(type="datetime-local", placeholder="")' },
        { id: 'inpti', val: 'input(type="time", placeholder="")' },
        { id: 'inpdm', val: 'input(type="month", placeholder="")' },
        { id: 'inpw', val: 'input(type="week", placeholder="")' },
        { id: 'inpc', val: 'input(type="color", value="")' },
        { id: 'inpn', val: 'input(type="number", value="", min="", max="", step="")' },
        { id: 'inpr', val: 'input(type="range", value="", min="", max="", step="")' },
        { id: 'inpurl', val: 'input(type="url", placeholder="")' },
        { id: 'inps', val: 'input(type="search", placeholder="")' },
        { id: 'textarea', val: 'textarea(placeholder="")' },
        { id: 'button', val: 'button(type="button") button' },
        { id: 'submit', val: 'input(type="submit", value="submit")' }
    ];

    const generatedCollection = elementData.reduce((accumulator, currentItem) => {
        accumulator[currentItem.id] = currentItem.val;
        return accumulator;
    }, {});

    const documentStructureLines = [
        'doctype html',
        'html',
        '  head(lang="en")',
        '    title Document',
        '    meta(http-equiv="content-type", content="text/html; charset=UTF-8")',
        '    meta(name="description", content="")',
        '    meta(name="keywords", content="")',
        '    link(rel="stylesheet", href="")',
        '  body',
        '    script(src="")'
    ];
    
    generatedCollection.temp = documentStructureLines.join('\n');

    currentModule.exports = generatedCollection;
});