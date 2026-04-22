(function() {
    if (window.editorInitializationFlag) {
        return;
    }

    window.editorInitializationFlag = true;

    class TextEditorManagementSystem {
        constructor(guiContextArgument) {
            this.guiEnvironment = guiContextArgument;
            this.appConfigurationData = require("./package.json");

            this.codeEditingCore = window.ace;
            this.currentModeIdentifier = null;
            this.selectionBoundaryHandler = this.codeEditingCore.require("ace/range").Range;
            this.codeFormattingUtility = require("./jsbeautify/jsbeautify.js");

            this.mainApplicationWindow = this.guiEnvironment.Window.get();
            this.mainApplicationWindow.show();

            this.fileSystemOperations = require("fs");
            this.pathManipulationTools = require("path");

            if (!window.global.globalFileOpenerRegistered) {
                window.global.globalFileOpenerRegistered = true;
                this.guiEnvironment.App.on("open", (filePathString) => {
                    this.spawnNewEditorInstance(filePathString, this.appConfigurationData);
                });
            }

            this.activeEditorInstance = this.codeEditingCore.edit("editor");

            this.currentVisualTheme = window.localStorage.aceTheme || "twilight";
            this.activeEditorInstance.setTheme(`ace/theme/${this.currentVisualTheme}`);

            this.activeEditorSession = this.activeEditorInstance.getSession();

            this.languageDefinitions = {
                abap: ["ABAP", "abap", "text/x-abap", "other"], asciidoc: ["AsciiDoc", "asciidoc", "text/x-asciidoc", "other"],
                c9search: ["C9Search", "c9search", "text/x-c9search", "hidden"], c_cpp: ["C, C++", "c|cc|cpp|cxx|h|hh|hpp", "text/x-c"],
                clojure: ["Clojure", "clj", "text/x-script.clojure"], coffee: ["CoffeeScript", "*Cakefile|coffee|cf", "text/x-script.coffeescript"],
                coldfusion: ["ColdFusion", "cfm", "text/x-coldfusion", "other"], csharp: ["C#", "cs", "text/x-csharp"],
                css: ["CSS", "css", "text/css"], dart: ["Dart", "dart", "text/x-dart"],
                diff: ["Diff", "diff|patch", "text/x-diff", "other"], glsl: ["Glsl", "glsl|frag|vert", "text/x-glsl", "other"],
                golang: ["Go", "go", "text/x-go"], groovy: ["Groovy", "groovy", "text/x-groovy", "other"],
                haml: ["Haml", "haml", "text/haml", "other"], haxe: ["haXe", "hx", "text/haxe", "other"],
                html: ["HTML", "htm|html|xhtml", "text/html"], jade: ["Jade", "jade", "text/x-jade"],
                java: ["Java", "java", "text/x-java-source"], jsp: ["JSP", "jsp", "text/x-jsp", "other"],
                javascript: ["JavaScript", "js", "application/javascript"], json: ["JSON", "json", "application/json"],
                jsx: ["JSX", "jsx", "text/x-jsx", "other"], latex: ["LaTeX", "latex|tex|ltx|bib", "application/x-latex", "other"],
                less: ["LESS", "less", "text/x-less"], lisp: ["Lisp", "lisp|scm|rkt", "text/x-lisp", "other"],
                liquid: ["Liquid", "liquid", "text/x-liquid", "other"], lua: ["Lua", "lua", "text/x-lua"],
                luapage: ["LuaPage", "lp", "text/x-luapage", "other"], makefile: ["Makefile", "*GNUmakefile|*makefile|*Makefile|*OCamlMakefile|make", "text/x-makefile", "other"],
                markdown: ["Markdown", "md|markdown", "text/x-markdown", "other"], objectivec: ["Objective-C", "m", "text/objective-c", "other"],
                ocaml: ["OCaml", "ml|mli", "text/x-script.ocaml", "other"], perl: ["Perl", "pl|pm", "text/x-script.perl"],
                pgsql: ["pgSQL", "pgsql", "text/x-pgsql", "other"], php: ["PHP", "php|phtml", "application/x-httpd-php"],
                powershell: ["Powershell", "ps1", "text/x-script.powershell", "other"], python: ["Python", "py", "text/x-script.python"],
                r: ["R", "r", "text/x-r", "other"], rdoc: ["RDoc", "Rd", "text/x-rdoc", "other"],
                rhtml: ["RHTML", "Rhtml", "text/x-rhtml", "other"], ruby: ["Ruby", "ru|gemspec|rake|rb", "text/x-script.ruby"],
                scad: ["OpenSCAD", "scad", "text/x-scad", "other"], scala: ["Scala", "scala", "text/x-scala"],
                scss: ["SCSS", "scss|sass", "text/x-scss"], sh: ["SH", "sh|bash|bat", "application/x-sh"],
                stylus: ["Stylus", "styl|stylus", "text/x-stylus"], sql: ["SQL", "sql", "text/x-sql"],
                svg: ["SVG", "svg", "image/svg+xml", "other"], tcl: ["Tcl", "tcl", "text/x-tcl", "other"],
                text: ["Text", "txt", "text/plain", "hidden"], textile: ["Textile", "textile", "text/x-web-textile", "other"],
                typescript: ["Typescript", "ts|str", "text/x-typescript"], xml: ["XML", "xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl", "application/xml"],
                xquery: ["XQuery", "xq", "text/x-xquery"], yaml: ["YAML", "yaml", "text/x-yaml"]
            };

            this.extensionToModeMapping = new Map();
            this.captionToModeMapping = new Map();
            this.mimeTypeToModeMapping = new Map();
            this.hiddenModeFlags = new Map();
            this.otherModeFlags = new Map();
            this.modeMenuHtmlFragments = [];

            this.processLanguageDefinitions();

            this.documentHasUnsavedChanges = false;
            this.activeDocumentPath = null;

            this.darkThemeIdentifiers = new Set([
                'ambiance', 'chaos', 'clouds_midnight', 'cobalt', 'idle_fingers', 'kr_theme',
                'merbivore', 'merbivore_soft', 'mono_industrial', 'monokai', 'pastel_on_dark',
                'solarized_dark', 'tomorrow_night', 'tomorrow_night_blue', 'tomorrow_night_bright',
                'tomorrow_night_eighties', 'twilight', 'vibrant_ink'
            ]);

            this.initializeSessionState();
            this.registerEditorActions();
            this.attachUserInteractionHandlers();
            this.applyInitialInterfaceSettings();
        }

        spawnNewEditorInstance(targetFilePath, appSettings) {
            const newWindowInstance = this.guiEnvironment.Window.open('index.html', appSettings.window);
            newWindowInstance.currentFile = targetFilePath;
        }

        processLanguageDefinitions() {
            Object.entries(this.languageDefinitions).forEach(([modeKey, modeAttributes]) => {
                const [modeCaption, extensionsString, mimeType, categoryType] = modeAttributes;
                const modeConfiguration = {
                    caption: modeCaption,
                    mime: mimeType,
                    hidden: categoryType === "hidden",
                    other: categoryType === "other",
                    extensions: extensionsString
                };

                extensionsString.split("|").forEach(ext => {
                    this.extensionToModeMapping.set(ext, modeKey);
                });
                this.captionToModeMapping.set(modeCaption, modeKey);
                this.hiddenModeFlags.set(modeCaption, modeConfiguration.hidden);
                this.otherModeFlags.set(modeCaption, modeConfiguration.other);
                this.mimeTypeToModeMapping.set(mimeType, modeKey);

                this.modeMenuHtmlFragments.push(`<li><a href="#" data-mode="${modeKey}">${modeCaption}</a></li>`);
            });
            $("#syntaxMenu").html(this.modeMenuHtmlFragments.join(""));
        }

        initializeSessionState() {
            const initialPath = this.mainApplicationWindow.currentFile ||
                (typeof process !== 'undefined' && process._nw_app && this.fileSystemOperations.existsSync(process._nw_app.argv[0]) ?
                    process._nw_app.argv[0] :
                    null);

            if (this.mainApplicationWindow.currentFile) {
                this.loadContentIntoEditor(initialPath);
            } else if (typeof process !== 'undefined' && process._nw_app && this.fileSystemOperations.existsSync(process._nw_app.argv[0])) {
                try {
                    this.loadContentIntoEditor(process._nw_app.argv[0]);
                } catch (errorDetails) {
                    console.error("Error loading initial file:", errorDetails);
                }
            } else {
                this.loadContentIntoEditor();
            }
        }

        registerEditorActions() {
            this.activeEditorInstance.commands.addCommand({
                name: 'reformatCode',
                bindKey: { mac: "Command-Shift-B", win: "Shift-Ctrl-B" },
                exec: (currentEditorInstance) => {
                    const currentActiveSelection = currentEditorInstance.selection;
                    const editorContentSession = currentEditorInstance.session;
                    const selectedContentRange = currentActiveSelection.getRange();
                    const formattingConfiguration = {};

                    Object.assign(formattingConfiguration, {
                        space_before_conditional: true,
                        keep_array_indentation: false,
                        preserve_newlines: true,
                        unescape_strings: true,
                        jslint_happy: false,
                        brace_style: "end-expand"
                    });

                    if (editorContentSession.getUseSoftTabs()) {
                        formattingConfiguration.indent_char = " ";
                        formattingConfiguration.indent_size = editorContentSession.getTabSize();
                    } else {
                        formattingConfiguration.indent_char = "\t";
                        formattingConfiguration.indent_size = 1;
                    }

                    const startLineContent = editorContentSession.getLine(selectedContentRange.start.row);
                    const leadingSpace = startLineContent.match(/^\s*/)[0];
                    let needsOutputTrimming = false;

                    if (selectedContentRange.start.column < leadingSpace.length) {
                        selectedContentRange.start.column = 0;
                    } else {
                        needsOutputTrimming = true;
                    }

                    let contentForProcessing = editorContentSession.getTextRange(selectedContentRange);
                    $("[data-mode]").parent().removeClass("active");

                    let targetBeautifierType = null;
                    const activeEditorMode = this.currentModeIdentifier;

                    const typeDetectionRules = [
                        { check: () => /^\s*<!?\w/.test(contentForProcessing), type: "html" },
                        { check: () => activeEditorMode === "javascript", type: "js" },
                        { check: () => activeEditorMode === "css", type: "css" },
                        { check: () => activeEditorMode === "xml", type: "html" },
                        {
                            check: () => activeEditorMode === "html",
                            type: () => {
                                if (/[^<]+?\{[\s\-\w]+:[^}]+;/.test(contentForProcessing)) return "css";
                                else if (/<\w+[ \/>]/.test(contentForProcessing)) return "html";
                                else return "js";
                            }
                        }
                    ];

                    for (const rule of typeDetectionRules) {
                        if (rule.check()) {
                            targetBeautifierType = typeof rule.type === 'function' ? rule.type() : rule.type;
                            break;
                        }
                    }

                    try {
                        contentForProcessing = this.codeFormattingUtility[`${targetBeautifierType}_beautify`](contentForProcessing, formattingConfiguration);
                        if (needsOutputTrimming) {
                            contentForProcessing = contentForProcessing.replace(/^/gm, leadingSpace).trim();
                        }
                        if (selectedContentRange.end.column === 0) {
                            contentForProcessing += "\n" + leadingSpace;
                        }
                    } catch (errorObject) {
                        window.alert(`Formatting Issue: Code could not be beautified. Mode '${this.currentModeIdentifier}' might not be fully supported. Error: ${errorObject.message}`);
                        return;
                    }

                    const finalReplacementPosition = editorContentSession.replace(selectedContentRange, contentForProcessing);
                    currentActiveSelection.setSelectionRange(this.selectionBoundaryHandler.fromPoints(selectedContentRange.start, finalReplacementPosition));
                },
                readOnly: false
            });
        }

        attachUserInteractionHandlers() {
            this.activeEditorSession.on("change", () => {
                if (this.activeDocumentPath) {
                    this.documentHasUnsavedChanges = true;
                    $("title").text(`*${this.activeDocumentPath}`);
                }
            });

            $(window).on("keypress", (keyboardEvent) => {
                if (!((keyboardEvent.which === 115 && keyboardEvent.ctrlKey) || keyboardEvent.which === 19)) {
                    return true;
                }
                keyboardEvent.preventDefault();
                if (!this.activeDocumentPath) {
                    return false;
                }
                this.saveCurrentDocumentContent();
                return false;
            });

            $("#newFile").on("click", () => {
                if (window.confirm("All unsaved modifications will be discarded. Continue?")) {
                    this.loadContentIntoEditor();
                }
            });

            $("#openFile").on("click", () => {
                this.initiateFileSelectionDialog('#openfileDialog', (selectedFilePath) => {
                    this.spawnNewEditorInstance(selectedFilePath, this.appConfigurationData);
                });
            });

            $("#saveFile").on("click", () => {
                this.saveCurrentDocumentContent();
            });

            $("#saveasFile").on("click", () => {
                this.promptForNewSaveLocation('#saveasDialog');
            });

            $("[data-theme]").on("click", (mouseEvent) => {
                const chosenThemeName = mouseEvent.currentTarget.attributes["data-theme"].value;
                this.currentVisualTheme = chosenThemeName;
                window.localStorage.aceTheme = this.currentVisualTheme;
                this.activeEditorInstance.setTheme(`ace/theme/${this.currentVisualTheme}`);

                $("[data-theme]").parent().removeClass("active");
                $(mouseEvent.currentTarget).parent().addClass("active");
                this.updateNavbarAppearance(this.currentVisualTheme);
            });

            $("[data-theme]").hover(
                (mouseEvent) => {
                    const previewThemeName = mouseEvent.currentTarget.attributes["data-theme"].value;
                    this.activeEditorInstance.setTheme(`ace/theme/${previewThemeName}`);
                    this.updateNavbarAppearance(previewThemeName);
                },
                () => {
                    this.activeEditorInstance.setTheme(`ace/theme/${this.currentVisualTheme}`);
                    this.updateNavbarAppearance(this.currentVisualTheme);
                }
            );

            $("[data-mode]").on("click", (mouseEvent) => {
                const selectedModeName = mouseEvent.currentTarget.attributes["data-mode"].value;
                this.activeEditorSession.setMode(`ace/mode/${selectedModeName}`);
                this.currentModeIdentifier = selectedModeName;
                $("[data-mode]").parent().removeClass("active");
                $(mouseEvent.currentTarget).parent().addClass("active");
            });

            $("[data-mode]").hover(
                (mouseEvent) => {
                    const temporaryModeName = mouseEvent.currentTarget.attributes["data-mode"].value;
                    this.activeEditorSession.setMode(`ace/mode/${temporaryModeName}`);
                },
                () => {
                    this.activeEditorSession.setMode(`ace/mode/${this.currentModeIdentifier}`);
                }
            );

            this.mainApplicationWindow.on('close', () => {
                const userConfirmation = window.confirm("Are you certain you wish to close the application?");
                if (userConfirmation === true) {
                    window.alert("Exiting application. Goodbye!");
                }
                this.mainApplicationWindow.close(true); // Always closes, replicating original behavior
            });

            $("#windowClose").on("click", () => {
                this.mainApplicationWindow.close();
            });
        }

        isThemeDark(themeId) {
            return this.darkThemeIdentifiers.has(themeId);
        }

        updateNavbarAppearance(themeId) {
            if (this.isThemeDark(themeId)) {
                $(".navbar-static-top").addClass("navbar-inverse");
            } else {
                $(".navbar-static-top").removeClass("navbar-inverse");
            }
        }

        applyInitialInterfaceSettings() {
            $("[data-theme]").parent().removeClass("active");
            $(`[data-theme='${this.currentVisualTheme}']`).parent().addClass("active");
            this.updateNavbarAppearance(this.currentVisualTheme);

            $("[data-mode]").parent().removeClass("active");
            if (this.currentModeIdentifier) {
                $(`[data-mode='${this.currentModeIdentifier}']`).parent().addClass("active");
            }
        }

        loadContentIntoEditor(specifiedPath) {
            if (this.documentHasUnsavedChanges && !this.saveCurrentDocumentContent(true)) {
                return false;
            }
            this.activeDocumentPath = null;
            if (specifiedPath) {
                const baseName = this.pathManipulationTools.basename(specifiedPath);
                const fileExtension = baseName.split(".").pop();
                const modeForFile = this.extensionToModeMapping.get(fileExtension);

                if (modeForFile) {
                    this.currentModeIdentifier = modeForFile;
                    this.activeEditorSession.setMode(`ace/mode/${modeForFile}`);
                }
                this.documentHasUnsavedChanges = false;
                this.activeEditorSession.setValue(this.fileSystemOperations.readFileSync(specifiedPath, "utf8"));
                this.documentHasUnsavedChanges = false;
            } else {
                specifiedPath = "New Untitled Document";
                this.activeEditorSession.setValue("");
            }

            this.activeDocumentPath = specifiedPath;
            $("title").text(this.activeDocumentPath);
        }

        promptForNewSaveLocation(dialogElementSelector) {
            const fileSelectionElement = $(dialogElementSelector);
            fileSelectionElement.trigger('click');
            fileSelectionElement.off('change').on('change', (changeEvent) => {
                const chosenSavePath = $(changeEvent.currentTarget).val();
                this.activeDocumentPath = chosenSavePath;
                this.documentHasUnsavedChanges = true;
                this.saveCurrentDocumentContent();
            });
        }

        saveCurrentDocumentContent(isPreSaveCheck = false) {
            if (!this.activeDocumentPath || this.activeDocumentPath === "New Untitled Document") {
                this.promptForNewSaveLocation('#saveasDialog');
                return false;
            }

            if (this.activeDocumentPath !== "New Untitled Document") {
                const editorTextContent = this.activeEditorSession.getValue();
                try {
                    this.fileSystemOperations.writeFileSync(this.activeDocumentPath, editorTextContent, "utf8");
                    $("title").text(this.activeDocumentPath);
                    this.documentHasUnsavedChanges = false;
                    return true;
                } catch (saveError) {
                    window.alert(`Failed to save file: ${saveError.message}`);
                    return false;
                }
            } else {
                this.promptForNewSaveLocation('#saveasDialog');
                return false;
            }
        }

        initiateFileSelectionDialog(dialogElementSelector, selectionCallback) {
            const fileInputControl = $(dialogElementSelector);
            fileInputControl.trigger('click');
            fileInputControl.off('change').on('change', (changeEvent) => {
                const chosenFilePath = $(changeEvent.currentTarget).val();
                if (chosenFilePath) {
                    selectionCallback(chosenFilePath);
                }
            });
        }
    }

    window.appLoad = function(nwGuiContext) {
        new TextEditorManagementSystem(nwGuiContext);
    };
})();