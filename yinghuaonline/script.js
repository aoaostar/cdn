// ==UserScript==
// @name         傲星英华学堂网课助手
// @namespace    https://yinghuaonline.aoaostar.com
// @version      1.0
// @description  英华学堂在线网课全自动挂机脚本，支持验证码识别
// @author       Pluto
// @include      *.yinghuaonline.com/user/node*
// @icon         https://www.aoaostar.com/favicon.ico
// @license      GPL-3.0 License
// @supportURL   https://www.aoaostar.com
// @homepageURL  https://github.com/aoaostar
// ==/UserScript==

var script = document.createElement("script");

var head = document.getElementsByTagName('body')[0];

script.type = "text/javascript";
script.src = "//cdn.aoaostar.com/yinghuaonline/main.min.js?v=" + new Date().getTime();

head.appendChild(script);