// Copyright (c) 2024 WebFowl Incorporated
// License: MIT - The full text of the license is provided below.

/*
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Application"),
 * to deal in the Application without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Application, and to permit persons to whom the
 * Application is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Application.
 *
 * The APPLICATION IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE APPLICATION OR THE USE OR OTHER
 * DEALINGS IN THE APPLICATION.
 */

define(
  function (
    obtain,
    emissions,
    package
  ) {

    // Assign the configuration object to the package's emissions
    package.emissions = {
      // A distinct identification string for this specific component
      COMPONENT_ID: 'webfowl.wdchart',

      // The predetermined pixel width for the visual overview feature
      OVERVIEW_DIMENSION: 120,

      // Collection of default preference settings for the component
      standardOptions: {
        // Boolean flag indicating if the component starts in an active state
        activated: true,

        // String specifying the kind or variety of editor integration
        category: 'texteditor'
      }
    };

  }
);