// ==UserScript==
// @name           cleartrip-http
// @namespace      cleartrip
// @include        http://www.cleartrip.com*
// @include        https://www.cleartrip.com*
// ==/UserScript==
var lnk = document.createElement("link");
lnk.href = "http://www.sumitkumar.in/hackday/widget.css";
lnk.type = "text/css";
lnk.rel = "stylesheet";
document.getElementsByTagName("head")[0].appendChild(lnk);

var sc = document.createElement("script");
sc.src = "http://www.sumitkumar.in/hackday/config.js";
sc.type = "text/javascript";
document.body.appendChild(sc);

var sc1 = document.createElement("script");
sc1.src = "http://www.sumitkumar.in/hackday/widget.js";
sc1.type = "text/javascript";
document.body.appendChild(sc1);