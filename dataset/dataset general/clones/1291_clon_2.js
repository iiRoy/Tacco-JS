/*
 * Style configuration for the Editor Framework.
 *
 * Copyright (c) 2023, CodeCraft Solutions.
 * All rights reserved.
 *
 * This software is provided under a custom license.
 * Redistribution and use in source and binary forms, with or without modification, are permitted.
 * The details of the license are available in the accompanying LICENSE file.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL CODECRAFT SOLUTIONS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

ace.define('editor/style/blaze', ['require', 'exports', 'module', 'editor/utility/elements'],
function(fetchModule, exposeApi, currentModule) {

exposeApi.hasDarkScheme = false;
exposeApi.styleIdentifier = "app-blaze";
exposeApi.styleSheetContent = ".ace_editor {\
color: rgb(50, 50, 50);\
font-family: 'Fira Code', 'Cascadia Code', monospace;\
font-size: 13px;\
line-height: 18px;\
}\
.app-blaze .ace_gutter {\
border-right: 1px solid rgb(220, 220, 220);\
background: rgb(240, 240, 240);\
color: rgb(160, 160, 160);\
overflow: hidden;\
}\
.app-blaze .ace_print-margin {\
width: 1px;\
background: #f0f0f0;\
}\
.app-blaze {\
background: url(\"data:image/gif;base64,R0lGODlhAgACAPcAACH5BAEAAAAALAAAAAACAAIAAAIDRMhJADs=\");\
}\
.app-blaze .ace_cursor {\
border-left: 2px solid #333;\
}\
.app-blaze .ace_overwrite-cursors .ace_cursor {\
border-left: 0px;\
border-bottom: 1px solid #333;\
}\
.app-blaze .ace_invisible {\
color: rgb(200, 200, 200);\
}\
.app-blaze .ace_constant.ace_buildin {\
color: rgb(70, 60, 220);\
}\
.app-blaze .ace_constant.ace_language {\
color: rgb(70, 75, 220);\
}\
.app-blaze .ace_constant.ace_library {\
color: rgb(10, 160, 20);\
}\
.app-blaze .ace_invalid {\
background-color: rgb(180, 0, 0);\
color: #fff;\
}\
.app-blaze .ace_fold {\
}\
.app-blaze .ace_support.ace_function {\
color: rgb(210, 130, 40);\
}\
.app-blaze .ace_support.ace_constant {\
color: rgb(10, 160, 20);\
}\
.app-blaze .ace_support.ace_type,\
.app-blaze .ace_support.ace_class\
.app-blaze .ace_support.ace_other {\
color: rgb(210, 130, 40);\
}\
.app-blaze .ace_variable.ace_parameter {\
font-style: italic;\
color: #E08020;\
}\
.app-blaze .ace_keyword.ace_operator {\
color: rgb(110, 125, 140);\
}\
.app-blaze .ace_comment,\
.app-blaze .ace_comment.ace_doc,\
.app-blaze .ace_comment.ace_doc.ace_tag {\
color: rgb(170, 170, 170);\
}\
.app-blaze .ace_constant.ace_numeric {\
color: rgb(0, 0, 190);\
}\
.app-blaze .ace_variable {\
color: rgb(40, 95, 210);\
}\
.app-blaze .ace_xml-pe {\
color: rgb(110, 110, 95);\
}\
.app-blaze .ace_entity.ace_name.ace_function {\
color: rgb(210, 130, 40);\
}\
.app-blaze .ace_markup.ace_heading {\
color: rgb(20, 15, 240);\
}\
.app-blaze .ace_markup.ace_list {\
color: rgb(190, 10, 150);\
}\
.app-blaze .ace_marker-layer .ace_selection {\
background: rgb(190, 220, 255);\
}\
.app-blaze .ace_marker-layer .ace_step {\
background: rgb(255, 255, 50);\
}\
.app-blaze .ace_marker-layer .ace_stack {\
background: rgb(170, 235, 110);\
}\
.app-blaze .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid rgb(200, 200, 200);\
}\
.app-blaze .ace_marker-layer .ace_active-line {\
background: rgba(0, 0, 0, 0.08);\
}\
.app-blaze .ace_gutter-active-line {\
background-color: #e0e0e0;\
}\
.app-blaze .ace_marker-layer .ace_selected-word {\
background: rgb(245, 245, 250);\
border: 1px solid rgb(210, 210, 255);\
}\
.app-blaze .ace_storage,\
.app-blaze .ace_keyword,\
.app-blaze .ace_meta.ace_tag {\
color: rgb(210, 130, 40);\
}\
.app-blaze .ace_string.ace_regex {\
color: rgb(230, 0, 0);\
}\
.app-blaze .ace_string {\
color: rgb(30, 70, 150);\
}\
.app-blaze .ace_entity.ace_other.ace_attribute-name {\
color: #A05010;\
}\
.app-blaze .ace_indent-guide {\
background: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAAXNSR0IArs4c6QAAACFJREFUGFdjYGBgYGBkYGDQ/w8DAwMDAwMDAwMDAwMAAQMA39QD79+rXQAAAABJRU5ErkJggg==\") right repeat-y;\
}\
";

var utilityHandle = fetchModule("../utility/elements");
utilityHandle.injectStyleContent(exposeApi.styleSheetContent, exposeApi.styleIdentifier);
});