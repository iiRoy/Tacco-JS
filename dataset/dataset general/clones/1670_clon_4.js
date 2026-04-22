document.addEventListener('DOMContentLoaded', function() {
  const mainDocumentText = `
- What is this?
  * An **Embedable** Markdown List Editor
- What about features?
  * Button and Key Controls (also [VIM-Esque](http://github.com/mil/mil-edit))
  * **Bold**, _Italics_, and Links
  * Exports to **Markdown**
- Hacker?
  * Source on [Github](http://github.com/mil/mil-edit)
  * Licensed [CC0](http://creativecommons.org/publicdomain/zero/1.0) - Public Domain`.trim();

  systemCore.setupModule();
  systemCore.processData(mainDocumentText);
});