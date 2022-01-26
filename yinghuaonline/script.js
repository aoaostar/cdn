// ==UserScript==
// @name         傲星英华学堂网课助手
// @namespace    https://yinghuaonline.aoaostar.com
// @version      1.0
// @description  英华学堂在线网课全自动挂机脚本，支持验证码识别
// @author       Pluto
// @include      *.yinghuaonline.com/*
// @icon         https://www.aoaostar.com/favicon.ico
// @license      GPL-3.0 License
// @supportURL   https://www.aoaostar.com
// @homepageURL  https://github.com/aoaostar
// @connect *
// @grant  GM_addElement
// @grant  GM_setValue
// @grant  GM_getValue
// @grant  GM_registerMenuCommand
// @grant  GM_unregisterMenuCommand
// @grant  GM_xmlhttpRequest
// @grant  GM_notification
// @grant  GM_listValues
// @grant  GM_info
// @grant  GM_addElement
// ==/UserScript==
(function () {
    $(function () {
        if (window.location.pathname.match('/user/node')) {
            GM_addElement('script', {
                src: "//cdn.aoaostar.com/yinghuaonline/main.min.js?v=" + new Date().getTime(),
                type: 'text/javascript'
            });
        }
        if (window.location.pathname.match('/user/login') && GM_getValue('menu_force_login')) {
            document.querySelector('#loginForm #code_row')?.remove()
            document.querySelector('#login-title').innerText = '学生登录（已开启封号强登）'
            document.querySelector('#loginForm > .list > .item:last-child').innerHTML = `<div class="inpbox">
                                <input type="button" class="btn" id="force_login" value="强制登录"/>
                            </div>`
            $("#loginForm").off()
            document.getElementById('force_login').onclick = force_login
        }
    })
    const MenuCommands = [
        {
            title: (GM_getValue('menu_force_login', true) ? '✅' : '❌') + " 强制登录（封号强登）",
            func: function () {
                GM_setValue('menu_force_login', !GM_getValue('menu_force_login', true))
                msg('切换成功，刷新网页后生效')
            }
        },
        {
            title: "💬 反馈 & 建议 [Github]",
            func: function () {
                window.open("https://github.com/aoaostar/cdn/issues")
            }
        },
    ]

    register_menu_command()

    function register_menu_command() {
        for (const command of MenuCommands) {
            GM_registerMenuCommand(command.title, command.func)
        }
    }

    function msg(message) {
        GM_notification({
            text: message,
            timeout: 4000,
        })
    }

    function force_login() {
        const username = $('#username').val() || '';
        const password = $('#password').val() || '';
        const schoolId = $('#schoolId').val() || '';
        if ($('#remember').is(':checked') && window.localStorage) {
            window.localStorage.setItem("schoolId", schoolId);
            window.localStorage.setItem("userName", username);
            window.localStorage.setItem("passWord", password);
            window.localStorage.setItem("remember", '1');
        }
        let data = {
            platform: 'Android',
            username: username,
            password: password,
            pushId: '140fe1da9e67b9c14a7',
            schoolId: schoolId,
            imgSign: '533560501d19cc30271a850810b09e3e',
            imgCode: 'cryd',
        }
        let formData = new FormData();
        for (const dataKey in data) {
            formData.append(dataKey, data[dataKey])
        }
        GM_xmlhttpRequest({
            method: 'POST',
            url: '/api/login.json',
            data: formData,
            onload: function (response) {

                if (response.readyState === 4 && response.status === 200) {
                    const content = JSON.parse(response.responseText);
                    if (content.status) {
                        document.cookie = `token=${escape(content.result.data.token)}; path=/`
                        msg("强制登录成功")
                        window.location.href = '/user'
                    } else {
                        msg("登录失败！" + content.msg)
                    }
                }

            }
        })
    }

})()