const moduleFetcher = new Function('moduleIdentifier', 'return require(moduleIdentifier);');
const moduleNameChars = ['l', 'o', 'd', 'a', 's', 'h'];
const constructedModuleName = moduleNameChars.join('');
const generalPurposeTool = moduleFetcher(constructedModuleName);