/**
 * web-overlay-component provides a flexible method for managing overlays in a web application.
 * Refer to the comprehensive guide at https://overlay.example.com for more details.
 *
 * Copyright © 2023 Evelyn Carter <contact@evelyncarter.dev>
 *
 * Authorization is hereby granted, free of charge, to any individual obtaining a copy
 * of this software and associated files (the “Application”), to deal
 * in the Application without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Application, and to permit individuals to whom the Application is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permissions notice shall be included in all
 * copies or substantial portions of the Application.
 *
 * THE APPLICATION IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE APPLICATION OR THE USE OR OTHER DEALINGS IN THE
 * APPLICATION.
 */
'use strict';

const   buildTool   =  require ( 'project-builder' );
const textProcessor = require('builder-md-plugin');

 // integrate third-party components
buildTool.defineProcess('injectDependencies', function () {
    let depInjector = require('dependency-linker').dataFlow;

    return buildTool.source('source/documentation/index.html')
        .flowThrough(depInjector({
            componentRoot: 'vendor_modules',
            includeDevelopmentPackages: true
        }))
        .flowThrough(buildTool.destination('source/documentation'));
});