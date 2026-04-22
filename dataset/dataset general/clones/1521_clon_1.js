/*
 * MarmoUI: Marmoset Improved!
 *
 * Created by:
 *  - Shida Li
 *  - Erica Xu
 *
 * This userscript enhances the Marmoset UI and functionality.
 *
 * Installation Guide:
 *
 * For Chrome:
 *  1. Navigate to the Extensions page (chrome://extensions).
 *  2. Drag and drop the "marmo-ui.user.js" file directly into the Extensions page.
 *  3. Confirm the installation by clicking "Add".
 *
 * For Firefox:
 *  1. Ensure you have the GreaseMonkey add-on installed.
 *     (Download from: https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
 *  2. Drag and drop "marmo-ui.user.js" into your browser window.
 *  3. Alternatively, open the .js file from userscript.org.
 *  4. Follow the prompts to "Install" the script.
 *
 *
 * ==UserScript==
 * @name                MarmoUI
 * @description         Marmoset Improved! Better UI and functionality
 * @author              Erica Xu (www.ericaxu.com) and Shida Li (www.lishid.com)
 * @version             1.5
 * @include             https://marmoset.student.cs.uwaterloo.ca*
 * ==/UserScript==
 *
 * Note: Some features are inspired by "Marmoset Plus" from userscripts.org/scripts/show/134262.
 *
 */


// --- Global Variables (script-scope, not accessible from page DOM) ---
var global_css = "body,h1,h2,h3{font-family:'Droid Sans',helvetica,arial,sans-serif}body{color:#eee;background:#022d49;margin:0}h1,h2,h3{margin:1em 0 .5em 0;font-weight:normal}h1{font-size:1.7em}h2{font-size:1.5em}h3{font-size:1.3em;color:#eee}.wrapper{margin:1em 7.5%}a:link{color:#fc3;-webkit-transition:all .3s ease-in-out;-moz-transition:all .3s ease-in-out;-o-transition:all .3s ease-in-out;transition:all .3s ease-in-out}a:visited{color:#3e90c6}a:hover{color:#ff8700}div.header{background:#022d49;padding:4em 0 3em 0;margin:0;color:white;border:0}div.header p{text-align:center;font:4em 'Lobster',helvetica,sans-serif;padding:.3em;margin:0}div.breadcrumb{background:inherit;margin:0;padding:0}div.breadcrumb p{background:inherit;font-family:'Droid Sans',helvetica,arial,sans-serif;font-variant:normal;width:80%;margin:0 6% 0 0;padding:.5em 0 0 0}div.logout,div.submit-button{background:#fc3;font-family:'Droid Sans',helvetica,arial,sans-serif;color:#03426a;width:7em;padding:.1em .5em;margin:0;text-align:center;font-weight:normal;-moz-border-radius:50px;-webkit-border-radius:50px;border-radius:50px;-ms-filter:progid:DXImageTransform.Microsoft.Alpha(Opacity = 91);filter:alpha(opacity = 91);-webkit-transition:all .3s ease-in-out;-moz-transition:all .3s ease-in-out;-o-transition:all .3s ease-in-out;transition:all .3s ease-in-out;cursor:pointer}div.logout p,div.submit-button p{font-size:1.5em;font-variant:normal;padding:0;margin:.1em auto}div.logout:hover,div.submit-button:hover{background:#eee;color:#03426a}div.logout a{font-family:inherit!important;text-decoration:none!important;color:#03426a!important}div.submit-button a,div.logout a{font-family:inherit;text-decoration:none;color:#111;font-weight:normal;text-align:center;display:block;padding:.2em .5em;margin:-.2em -.5em}div.breadcrumb p.nav{font-family:'Droid Sans',helvetica,arial,sans-serif;font-size:1.5em;font-variant:normal;font-weight:normal;display:inline-block;padding:0;margin:0}div.breadcrumb p a:link,div.breadcrumb p a:visited{color:#fc3;text-decoration:underline}div.breadcrumb p a:hover{color:#ff8700}div.footer{border-top:0;text-align:center;padding:.5em;margin:1em}div.footer a:visited{color:#fc3}div.footer a:hover{color:#ff8700}.notifier-update{background:#fc3;text-align:center}.notifier-text{line-height:3em;display:block}.notifier-update a,.notifier-update a:visited{color:#022d49;font-weight:bold}.notifier-close{position:absolute;top:0;right:.5em;font-size:2.0em;color:#000;text-decoration:none}ul.my-courses,ul.all-courses{list-style:none;font-size:1.1em}ul.my-courses li,ul.all-courses li{margin:.3em 0}ul.release-tokens{list-style:none}table{border-style:ridge;border:0;border-collapse:collapse;width:100%;margin:2em 0 0 0;font-size:1em}form[name='submitform']{background:#fc3;color:#111;width:45%;margin:2em auto 0 auto;padding:.5em;-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em;font-size:1.2em;text-align:center}form[name='submitform'] p{text-align:center;font-weight:bold}form[name='submitform'] input[type='submit']{color:#eee;background:#022d49;height:2em;width:6em;-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em;border:0;cursor:pointer;-webkit-transition:all .3s ease-in-out;-moz-transition:all .3s ease-in-out;-o-transition:all .3s ease-in-out;transition:all .3s ease-in-out}form[name='submitform'] input[type='submit']:hover{background:#25a0ca}div.submission-bg{background:#fff;opacity:.7;position:fixed;width:100%;height:100%;top:0;left:0}div.submission-wrapper{display:table;position:fixed;width:100%;height:100%;top:0;left:0}div.submission-cell{display:table-cell;vertical-align:middle}div.submission-popup{background-color:#fc3;color:#111;display:block;border:0;text-align:left;padding:1.5em;z-index:9999;width:50%;margin:0 25%}div.submission-popup a:link,div.submission-popup a:visited{color:#022d49}div.submission-popup h2{text-align:center}div.submission-popup h2,div.submission-popup p{color:#111;margin:.5em 0 1em 0}div.submission-popup form{margin:1em auto}a#submission-close{margin:0;right:24%;position:absolute;color:#111;text-decoration:underline}div.submission-popup div.submit-button{margin:.5em auto;background:#c1dbed}div.submission-popup div.submit-button a:link{color:#fc3;text-decoration:none}div.submission-popup div.submit-button p{margin:.1em auto}div.submission-popup div.submit-button:hover{background:#eee}table a:link{color:#03426a;font-weight:bold}table a:visited{color:#03426a}table a:hover{color:#ff8700}th{background:#2c6b94;color:#eee;font-size:1.1em;font-weight:normal;text-transform:capitalize!important;text-align:center;vertical-align:center;padding:1em .5em;border:0;margin:0}td{text-align:center;vertical-align:middle;padding:.5em;margin:0;border:0}td a{display:block}th.description,td.description{text-align:center}td.left{text-align:left}td.long-result{text-align:left}th.number,td.number{text-align:right}col.right{border-right:0 solid black}div.build-output{margin:1em 7.5%;width:85%;background:#ffe799;color:#111;overflow-x:scroll}div.build-output pre{padding:1em 2em;letter-spacing:1px;font-family:monospace;white-space:pre;letter-spacing:1px}form{padding:0;margin:0}table.stacktrace td{padding-left:3em}input[type='file'],input[type='submit'],input[type='hidden']{font-family:'Droid Sans',helvetica,arial,sans-serif!important;font-size:1em}table.form td{padding:.25em;text-align:left}table.form td.label{font-weight:bold;text-align:right;background:#fff9e5;padding-left:3em;padding-right:.5em}table.form tr.submit td{background:#fc3;text-align:center}tr{color:#111;-webkit-transition:all .3s ease-in-out;-moz-transition:all .3s ease-in-out;-o-transition:all .3s ease-in-out;transition:all .3s ease-in-out}table tr:hover{background:#9ac5e1}tr.r0{background:#f5fbff}tr.r1{background:#e4f4fe}tr.selected,tr.selected:hover{background:#fc3}tr.highlight{background:#00ffaf}td.passed{background:#5fbf5f}td.failed{background:#9f3f3f}