// ==UserScript==
// @name         傲星英华学堂网课助手
// @namespace    https://yinghuaonline.aoaostar.com
// @version      2.2
// @description  英华学堂在线网课全自动挂机脚本，支持验证码识别
// @author       Pluto
// @icon         https://www.aoaostar.com/favicon.ico
// @license      GPL-3.0 License
// @supportURL   https://www.aoaostar.com
// @homepageURL  https://github.com/aoaostar
// @connect *
// @webRequest   {"selector": "*static/user/js/video.js*", "action": "cancel"}
// @grant  GM_addElement
// @grant  GM_setValue
// @grant  GM_getValue
// @grant  GM_registerMenuCommand
// @grant  GM_unregisterMenuCommand
// @grant  GM_xmlhttpRequest
// @grant  GM_notification
// @grant  GM_listValues
// @grant  GM_info
// @grant  GM_log

// @note ==慕课平台==
// @match *.yinghuaonline.com/*
// @match *://weiliuxue.yinghuaonline.com/*
// @match *://yhxt.yinghuaonline.com/*
// @match *://mooc.yit.edu.cn/*
// @match *://mooc.cqcst.edu.cn/*
// @match *://mooc.canvard.net.cn/*
// @match *://mooc.scauzj.edu.cn/*
// @match *://swxymooc.csuft.edu.cn/*
// @match *://mooc.kdcnu.com/*
// @match *://mooc.kmcc.edu.cn/*
// @match *://mooc.bwgl.cn/*
// @match *://mooc.ycust.com/*
// @match *://mooc.wuhues.com/*
// @match *://mooc.yncjxy.com/*
// @match *://mooc.lidapoly.edu.cn/*
// @match *://mooc.gsxy.cn/*
// @match *://mooc.cdcas.com/*
// @match *://wzbc.yinghuaonline.com/*
// @match *://mooc.whxyart.cn/*
// @match *://jcxymooc.kaikangxinxi.com/*
// @match *://mooc.mdut.cn/*
// @match *://mooc.bxait.cn/*
// @match *://xacxxy.yinghuaonline.com/*
// @match *://mooc.scasc.cn/*
// @match *://gxnncz.yinghuaonline.com/*
// @match *://nqvts.yinghuaonline.com/*
// @match *://jtxy.yinghuaonline.com/*

// @note ==实训平台==
// @match *://shixun.kaikangxinxi.com/*
// @match *://zyjnpx.kaikangxinxi.com/*
// @match *://sxkc.kaikangxinxi.com/*
// @match *://yhxt.kaikangxinxi.com/*
// @match *://shixun.yit.edu.cn/*
// @match *://shixun.wuhues.com/*
// @match *://shixun.cdcas.com/*
// @match *://shixun.ycust.com/*
// @match *://shixun.scauzj.edu.cn/*
// @match *://swxyshixun.csuft.edu.cn/*
// @match *://shixun.kdcnu.com/*
// @match *://shixun.kmcc.edu.cn/*
// @match *://shixun.bwgl.cn/*
// @match *://shixun.yncjxy.com/*
// @match *://shixun.lidapoly.edu.cn/*
// @match *://shixun.gsxy.cn/*
// @match *://shixun.cqcst.edu.cn/*
// @match *://shixun.bxait.cn/*
// @match *://shixun.canvard.net.cn/*
// @match *://shixun.scasc.cn/*
// @match *://shixun.whxyart.cn/*
// @match *://shixun.wzbc.edu.cn/*
// @match *://jcxyshixun.kaikangxinxi.com/*
// @match *://shixun.mdut.cn/*
// ==/UserScript==

(function () {
    $(function () {
        // 去除烦人的第一次登录信息框
        $('.layui-layer-content').text().includes("您可能是第一次登录系统") && layer.closeAll()


        if (window.location.pathname.match('/user/node')) {
            GM_addElement('script', {
                src: "//cdn.aoaostar.com/yinghuaonline/main.min.js?v=" + GM_info.script.version,
                type: 'text/javascript'
            });
            //初始化面板
            init_panel()
        }
        if (window.location.pathname.match('/user/login') && GM_getValue('menu_force_login', true)) {
            $('#loginForm #code_row')?.remove()
            $('#login-title').text('学生登录（已开启封号强登）')
            $('#loginForm > .list > .item:last-child').html(`<div class="inpbox">
                                <input type="button" class="btn" id="force_login" value="强制登录"/>
                            </div>`)
            $("#loginForm").off()
            $('#force_login').click(force_login)
            // 监听回车
            $("#password").keydown((e) => {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    $('#force_login').click()
                }
            })
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
            localStorage.setItem("schoolId", schoolId);
            localStorage.setItem("userName", username);
            localStorage.setItem("passWord", password);
            localStorage.setItem("remember", '1');
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
                        let domainArr = document.domain.split('.')
                        let domain = document.domain
                        if (domainArr.length > 2) {
                            domain = domainArr.slice(1).join('.')
                        }
                        document.cookie = `token=${escape(content.result.data.token)}; domain=${domain}; path=/`
                        msg("强制登录成功")
                        window.location.href = '/user'
                    } else {
                        msg("登录失败！" + content.msg)
                    }
                }

            }
        })
    }

    function init_panel() {
        GM_addElement('link', {
            href: "//cdn.aoaostar.com/yinghuaonline/style.css?v=" + GM_info.script.version,
            rel: 'stylesheet'
        });

        const el = `<span class="aoaostar-drawer-guide" style="">👈</span>
<div class="aoaostar">
    <div class="info">
        <div class="title">
            <h1>傲星英华学堂网课助手</h1>
            <a class="link" href="https://www.aoaostar.com" target="_blank">https://www.aoaostar.com</a>
        </div>
        <div class="flex justify-center">
            <a class="tag" href="https://github.com/aoaostar" target="_blank">
                <span>作者</span><span>Pluto</span>
            </a>   
            <a class="tag" href="https://github.com/aoaostar/cdn/tree/master/yinghuaonline" target="_blank">
                <span>版本号</span><span>v${GM_info.script.version || '获取失败'}</span>
            </a>   
        </div>
        <div class="flex justify-center">
            <div class="tag">
                <span>当前课程ID</span><span id="course-id">正在获取</span>
            </div>
            <div class="tag">
                <span>当前章节ID</span><span id="node-id">正在获取</span>
            </div>
        </div>
        <div class="tag justify-center">
            <span>课程名称</span><span id="course-title">正在获取</span>
        </div>
        <div class="flex justify-center">
            <div class="tag">
                <span>视频总数</span><span id="node-count">正在获取</span>
            </div>
            <div class="tag">
                <span>视频时长</span><span id="course-duration">正在获取</span>
            </div>
        </div>
    </div>
    <div class="output"></div>
</div>`
        $(document.body).append(el)
    }
})()