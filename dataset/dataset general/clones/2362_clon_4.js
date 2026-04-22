"use strict";
var ContentUtility;

if (typeof exports === "object" && typeof require === "function")
    ContentUtility = exports;
else
    ContentUtility = {};

(function () {

    const passThrough = (val) => val;
    const alwaysFalse = () => false;

    function createPlugInManager() {
        const activePlugIns = new Map();

        return {
            appendPlugin: function (pluginName, newFunc) {
                if (!activePlugIns.has(pluginName))
                    throw new Error("unknown plugin " + pluginName);

                const originalFunc = activePlugIns.get(pluginName);
                if (originalFunc === passThrough) {
                    activePlugIns.set(pluginName, newFunc);
                } else {
                    activePlugIns.set(pluginName, function () {
                        const args = Array.prototype.slice.call(arguments, 0);
                        args[0] = originalFunc.apply(null, args);
                        return newFunc.apply(null, args);
                    });
                }
            },
            assignPlugin: function (pluginName, newFunc) {
                if (!activePlugIns.has(pluginName))
                    throw new Error("unknown plugin " + pluginName);
                activePlugIns.set(pluginName, newFunc);
            },
            addNullOp: function (pluginName) {
                activePlugIns.set(pluginName, passThrough);
            },
            addFalseOp: function (pluginName) {
                activePlugIns.set(pluginName, alwaysFalse);
            },
            getPlugin: function(pluginName) {
                return activePlugIns.get(pluginName);
            }
        };
    }

    ContentUtility.PlugInManager = createPlugInManager;

    function createDataStore() {
        const internalStorage = new Map();

        return {
            storeValue: function (keyAlias, dataValue) {
                internalStorage.set(keyAlias, dataValue);
            },
            retrieveValue: function (keyAlias) {
                return internalStorage.get(keyAlias);
            },
            clearAll: function() {
                internalStorage.clear();
            }
        };
    }

    ContentUtility.TextFormatter = function (configuration) {
        const plugInControl = this.plugIns = createPlugInManager();
        
        plugInControl.addNullOp("linkTextGenerator");
        plugInControl.addNullOp("beforeParsing");
        plugInControl.addNullOp("afterStandardization");
        plugInControl.addNullOp("beforeBlockProcessing");
        plugInControl.addNullOp("afterBlockProcessing");
        plugInControl.addNullOp("beforeInlineProcessing");
        plugInControl.addNullOp("afterInlineProcessing");
        plugInControl.addNullOp("afterFinalization");

        let referenceLinks;
        let referenceTitles;
        let isolatedSections;
        let currentListDepth;
        
        configuration = configuration || {};
        let encodeNonStandard = passThrough;
        let decodeNonStandard = passThrough;
        if (configuration.nonAsciiLetters) {
            (function () {
                const specialCharRegex = /[Q\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376-\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0523\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0621-\u064a\u0660-\u0669\u066e-\u066f\u0671-\u06d3\u06d5\u06e5-\u06e6\u06ee-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07c0-\u07ea\u07f4-\u07f5\u07fa\u0904-\u0939\u093d\u0950\u0958-\u0961\u0966-\u096f\u0971-\u0972\u097b-\u097f\u0985-\u098c\u098f-\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc-\u09dd\u09df-\u09e1\u09e6-\u09f1\u0a05-\u0a0a\u0a0f-\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32-\u0a33\u0a35-\u0a36\u0a38-\u0a39\u0a59-\u0a5c\u0a5e\u0a66-\u0a6f\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2-\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0-\u0ae1\u0ae6-\u0aef\u0b05-\u0b0c\u0b0f-\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32-\u0b33\u0b35-\u0b39\u0b3d\u0b5c-\u0b5d\u0b5f-\u0b61\u0b66-\u0b6f\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99-\u0b9a\u0b9c\u0b9e-\u0b9f\u0ba3-\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0be6-\u0bef\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58-\u0c59\u0c60-\u0c61\u0c66-\u0c6f\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0-\u0ce1\u0ce6-\u0cef\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d28\u0d2a-\u0d39\u0d3d\u0d60-\u0d61\u0d66-\u0d6f\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32-\u0e33\u0e40-\u0e46\u0e50-\u0e59\u0e81-\u0e82\u0e84\u0e87-\u0e88\u0e8a-\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa-\u0eab\u0ead-\u0eb0\u0eb2-\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0ed0-\u0ed9\u0edc-\u0edd\u0f00\u0f20-\u0f29\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8b\u1000-\u102a\u103f-\u1049\u1050-\u1055\u105a-\u105d\u1061\u1065-\u1066\u106e-\u1070\u1075-\u1081\u108e\u1090-\u1099\u10a0-\u10c5\u10d0-\u10fa\u10fc\u1100-\u1159\u115f-\u11a2\u11a8-\u11f9\u1200-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u1676\u1681-\u169a\u16a0-\u16ea\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u17e0-\u17e9\u1810-\u1819\u1820-\u1877\u1880-\u18a8\u18aa\u1900-\u191c\u1946-\u196d\u1970-\u1974\u1980-\u19a9\u19c1-\u19c7\u19d0-\u19d9\u1a00-\u1a16\u1b05-\u1b33\u1b45-\u1b4b\u1b50-\u1b59\u1b83-\u1ba0\u1bae-\u1bb9\u1c00-\u1c23\u1c40-\u1c49\u1c4d-\u1c7d\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u203f-\u2040\u2054\u2071\u207f\u2090-\u2094\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2183-\u2184\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2c6f\u2c71-\u2c7d\u2c80-\u2ce4\u2d00-\u2d25\u2d30-\u2d65\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3006\u3031-\u3035\u303b-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31b7\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fc3\ua000-\ua48c\ua500-\ua60c\ua610-\ua62b\ua640-\ua65f\ua662-\ua66e\ua67f-\ua697\ua717-\ua71f\ua722-\ua788\ua78b-\ua78c\ua7fb-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8d0-\ua8d9\ua900-\ua925\ua930-\ua946\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa50-\uaa59\uac00-\ud7a3\uf900-\ufa2d\ufa30-\ufa6a\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe33-\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]/g;
                const char_Q = "Q".charCodeAt(0);
                const char_A = "A".charCodeAt(0);
                const char_Z = "Z".charCodeAt(0);
                const alpha_diff = "a".charCodeAt(0) - char_Z - 1;
                
                encodeNonStandard = function(content) {
                    return content.replace(specialCharRegex, function (matchChar) {
                        let charCode = matchChar.charCodeAt(0);
                        let encodedString = "";
                        let remainder;
                        while (charCode > 0) {
                            remainder = (charCode % 51) + char_A;
                            if (remainder >= char_Q)
                                remainder++;
                            if (remainder > char_Z)
                                remainder += alpha_diff;
                            encodedString = String.fromCharCode(remainder) + encodedString;
                            charCode = charCode / 51 | 0;
                        }
                        return "Q" + encodedString + "Q";
                    })
                };
                
                decodeNonStandard = function(content) {
                    return content.replace(/Q([A-PR-Za-z]{1,3})Q/g, function (fullMatch, encodedSegment) {
                        let charCode = 0;
                        let segmentCharValue;
                        for (let idx = 0; idx < encodedSegment.length; idx++) {
                            segmentCharValue = encodedSegment.charCodeAt(idx);
                            if (segmentCharValue > char_Z)
                                segmentCharValue -= alpha_diff;
                            if (segmentCharValue > char_Q)
                                segmentCharValue--;
                            segmentCharValue -= char_A;
                            charCode = (charCode * 51) + segmentCharValue;
                        }
                        return String.fromCharCode(charCode);
                    })
                }                
            })();
        }

        this.processContent = function (sourceText) {

            if (referenceLinks)
                throw new Error("Recursive processing detected");
        
            referenceLinks = createDataStore();
            referenceTitles = createDataStore();
            isolatedSections = [];
            currentListDepth = 0;

            let processedOutput = plugInControl.getPlugin("beforeParsing")(sourceText);

            processedOutput = processedOutput.replace(/~/g, "~T");
            processedOutput = processedOutput.replace(/\$/g, "~D");

            processedOutput = processedOutput.replace(/\r\n/g, "\n");
            processedOutput = processedOutput.replace(/\r/g, "\n");

            processedOutput = "\n\n" + processedOutput + "\n\n";

            processedOutput = convertTabsToSpaces(processedOutput);

            processedOutput = processedOutput.replace(/^[ \t]+$/mg, "");
            
            processedOutput = plugInControl.getPlugin("afterStandardization")(processedOutput);

            processedOutput = isolateHtmlSections(processedOutput);

            processedOutput = extractLinkReferences(processedOutput);

            processedOutput = executeBlockTransformations(processedOutput);

            processedOutput = restoreSpecialChars(processedOutput);

            processedOutput = processedOutput.replace(/~D/g, "$$");

            processedOutput = processedOutput.replace(/~T/g, "~");

            processedOutput = plugInControl.getPlugin("afterFinalization")(processedOutput);

            referenceLinks.clearAll();
            referenceTitles.clearAll();
            referenceLinks = null;
            referenceTitles = null;
            isolatedSections = null;
            currentListDepth = 0;

            return processedOutput;
        };

        function extractLinkReferences(inputContent) {
            inputContent = inputContent.replace(/^[ ]{0,3}\[([^\[\]]+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?(?=\s|$)[ \t]*\n?[ \t]*((\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm,
                function (fullMatch, idPart, urlPart, titleWrapper, blankLines, titleContent) {
                    idPart = idPart.toLowerCase();
                    referenceLinks.storeValue(idPart, escapeAmpsAndAngles(urlPart));
                    if (blankLines) {
                        return titleWrapper;
                    } else if (titleContent) {
                        referenceTitles.storeValue(idPart, titleContent.replace(/"/g, "&quot;"));
                    }
                    return "";
                }
            );
            return inputContent;
        }

        function isolateHtmlSections(inputContent) {
            const blockTagsPrimary = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del";
            const blockTagsSecondary = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math";

            inputContent = inputContent.replace(new RegExp("^(<(" + blockTagsPrimary + ")\\b[^\\r]*?\\n<\\/\\2>[ \\t]*(?=\\n+))", "gm"), sectionMatcher);
            inputContent = inputContent.replace(new RegExp("^(<(" + blockTagsSecondary + ")\\b[^\\r]*?.*<\\/\\2>[ \\t]*(?=\\n+)\\n)", "gm"), sectionMatcher);
            inputContent = inputContent.replace(/\n[ ]{0,3}((<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, sectionMatcher);
            inputContent = inputContent.replace(/\n\n[ ]{0,3}(<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>[ \t]*(?=\n{2,}))/g, sectionMatcher);
            inputContent = inputContent.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, sectionMatcher);

            return inputContent;
        }

        function cacheSection(sectionContent) {
            sectionContent = sectionContent.replace(/(^\n+|\n+$)/g, "");
            isolatedSections.push(sectionContent);
            return "\n\n~K" + (isolatedSections.length - 1) + "K\n\n";
        }

        function sectionMatcher(fullMatch, matchedGroup) {
            return cacheSection(matchedGroup);
        }
        
        const blockProcessCallback = (content) => executeBlockTransformations(content);

        function executeBlockTransformations(inputContent) {
            
            inputContent = plugInControl.getPlugin("beforeBlockProcessing")(inputContent, blockProcessCallback);
            
            inputContent = convertHeadings(inputContent);

            // Remaining block-level transformations would be implemented here,
            // following the order of the original _RunBlockGamut.
            // (e.g., horizontal rules, lists, code blocks, blockquotes)

            return inputContent;
        }

        function convertHeadings(inputContent) {
            inputContent = inputContent.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,
                function (fullMatch, headingText) {
                    return "<h1>" + processSpansAndEntities(headingText) + "</h1>\n\n";
                }
            );

            inputContent = inputContent.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,
                function (fullMatch, headingText) {
                    return "<h2>" + processSpansAndEntities(headingText) + "</h2>\n\n";
                }
            );

            inputContent = inputContent.replace(/^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm,
                function (fullMatch, hashMarks, headingText) {
                    const headingLevel = hashMarks.length;
                    return "<h" + headingLevel + ">" + processSpansAndEntities(headingText) + "</h" + headingLevel + ">\n\n";
                }
            );

            return inputContent;
        }

        function convertTabsToSpaces(inputContent) {
            let outputAccumulator = [];
            let lines = inputContent.split("\n");
            for (let i = 0; i < lines.length; i++) {
                let currentLine = lines[i];
                let positionInLine = 0;
                let lineBuffer = "";
                for (let j = 0; j < currentLine.length; j++) {
                    let char = currentLine.charAt(j);
                    if (char === "\t") {
                        let spacesNeeded = 4 - (positionInLine % 4);
                        lineBuffer += " ".repeat(spacesNeeded);
                        positionInLine += spacesNeeded;
                    } else {
                        lineBuffer += char;
                        positionInLine++;
                    }
                }
                outputAccumulator.push(lineBuffer);
            }
            return outputAccumulator.join("\n");
        }

        function escapeAmpsAndAngles(inputString) {
            inputString = inputString.replace(/&/g, "&amp;");
            inputString = inputString.replace(/</g, "&lt;");
            inputString = inputString.replace(/>/g, "&gt;");
            return inputString;
        }

        function restoreSpecialChars(inputContent) {
            inputContent = inputContent.replace(/&gt;/g, ">");
            inputContent = inputContent.replace(/&lt;/g, "<");
            inputContent = inputContent.replace(/&amp;/g, "&");

            inputContent = inputContent.replace(/~K(\d+)K/g, function (fullMatch, sectionIndex) {
                return isolatedSections[sectionIndex];
            });

            return inputContent;
        }

        function processSpansAndEntities(contentChunk) {
            contentChunk = plugInControl.getPlugin("beforeInlineProcessing")(contentChunk);

            // This function (original _ProcessSpanGamut) would handle all inline markdown.
            // As its full implementation is not provided, we include the essential
            // character encoding and entity escaping steps that are implied by the overall flow.
            contentChunk = encodeNonStandard(contentChunk);
            contentChunk = escapeAmpsAndAngles(contentChunk);

            contentChunk = plugInControl.getPlugin("afterInlineProcessing")(contentChunk);
            return contentChunk;
        }
    };
})();