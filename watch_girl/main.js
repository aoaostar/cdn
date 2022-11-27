// ==UserScript==
// @name         看板(片)娘
// @namespace    http://www.aoaostar.com/
// @version      0.1
// @description  看板(片)娘
// @author       Pluto
// @match        https://javdb.com/actors/*
// @match        https://javdb.com/v/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=javdb.com
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      *
// @require     https://cdn.staticfile.org/limonte-sweetalert2/11.6.13/sweetalert2.all.min.js

// ==/UserScript==

const API_URL = GM_getValue('API_URL', '')

const MenuCommands = [
    {
        title: `${API_URL ? '🍀 已' : '🍁 未'}设置API`,
        func: function () {

            let api_url = prompt("请输入API地址", API_URL).trim()
            try {
                new URL(api_url)

            } catch (e) {
                $message.error("请输入有效的API地址")
                return
            }
            GM_setValue('API_URL', api_url.replace(/\/+$/g, ''))

            location.reload()
        }
    },
    {
        title: "💬 反馈 & 建议 [Github]",
        func: function () {
            GM_openInTab("https://github.com/aoaostar/cdn/issues")
        }
    },
]

register_menu_command()

function register_menu_command() {
    for (const command of MenuCommands) {
        GM_registerMenuCommand(command.title, command.func)
    }
}


const $message = {
    success: (message) => {
        return Swal.fire({
            icon: 'success',
            title: message,
        })
    },
    error: (message) => {
        return Swal.fire({
            icon: 'error',
            title: message,
        })
    },
    loading: (message) => {
        let index = Swal.fire({
            title: message,
            allowOutsideClick: false,
        })
        Swal.showLoading()
        return index
    },
}

function push_to_watch_girl(data, task_type) {
    console.log({API_URL, data, task_type})
    const loading = $message.loading("玩命提交中");
    GM_xmlhttpRequest({
        url: API_URL + '/ajax/task',
        method: "post",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            "data": data,
            "task_type": task_type
        }),
        onload: resp => {
            console.log(resp)
            loading.close()
            try {
                if (resp.status !== 200) {
                    $message.error(resp.statusText)
                    return
                }
                resp = JSON.parse(resp.response)
                if (resp.status === "ok") {
                    $message.success("提交成功")
                    return
                }
                $message.error(resp.message)
            } catch (e) {
                $message.error(e.message)
            }
        },
        onerror: e => {
            console.log(e)
            loading.close()
            $message.error(e.message)
        }
    })

}

function add_list_task() {
    const title = $('.actor-section-name').text()
    let url = new URL(window.location.href);
    let t = url.searchParams.get("t");
    if (t && !t.split(',').includes('d')) {
        $message.warn("有且仅含磁力的页面方可提交")
        return
    }

    push_to_watch_girl({
        "url": url.toString(),
        "filepath": title,
        "filename": "",
    }, "list")
}

function add_detail_task() {
    let url = new URL(window.location.href);
    let t = url.searchParams.get("t");
    if (t && !t.split(',').includes('d')) {
        $message.warn("有且仅含磁力的页面方可提交")
        return
    }

    push_to_watch_girl({
        "url": url.toString(),
        "filepath": "",
        "filename": "",
    }, "detail")
}

function add_aria2_task(url, filepath, filename, src_url) {

    push_to_watch_girl({
        "url": url,
        "src_url": src_url,
        "filepath": filepath,
        "filename": filename,
    }, "aria2")
}

$('.section-addition > div').addClass('has-addons').append(`<p id="add_list_task" class="control">
          <button class="button is-link" title="提交到看板(片)娘">
            <span class="icon is-small">
              <i class="icon-heart-o"></i>
            </span>
            <span>提交到看板(片)娘</span>
</button>        </p>`)


$('.movie-panel-info > .review-buttons').append(`
<div class="panel-block">
<button class="button is-link add_detail_task" title="提交到看板(片)娘">
            <span class="icon is-small">
              <i class="icon-heart-o"></i>
            </span>
            <span>提交到看板(片)娘</span>
</button>
</div>`)
// tags
$('.movie-list .item').append(`
<button class="button is-link add_detail_task" style="width: 100%;" title="提交到看板(片)娘">
            <span class="icon is-small">
              <i class="icon-heart-o"></i>
            </span>
            <span>提交到看板(片)娘</span>
</button>`)

$('#magnets-content > .item >.buttons').append(`
<div class="panel-block">
<button class="button is-link add_aria2_task" title="提交到看板(片)娘">
            <span class="icon is-small">
              <i class="icon-heart-o"></i>
            </span>
            <span>看板(片)娘aria2下载</span>
</button>
</div>`)


$('#add_list_task').click(add_list_task)
$('.add_detail_task').click(add_detail_task)
$('.add_aria2_task').click(e => {
    const magnet = $(e.target).parents('#magnets-content > .item').children('.magnet-name').children('a')

    const url = magnet.attr('href')
    const mash = $('.video-meta-panel .panel-block.first-block > .value').text().trim()
    const title = $('.video-detail .title .current-title').text().trim()
    const magnet_name = magnet.children('.name').text()
    const filepath = `${mash}_${title}`

    add_aria2_task(url, filepath, magnet_name, window.location.href)
})