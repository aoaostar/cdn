/*
* You may think you know what the following code does.
* But you dont. Trust me.
* Fiddle with it, and youll spend many a sleepless
* night cursing the moment you thought youd be clever
* enough to "optimize" the code below.
* Now close this file and go play with something else.
*
*                                            By:Pluto
*/

function aoaostar_dump() {
    if (window.console && window.console.log) {
        console.log(...arguments);
    }
}

function notification(message) {
    GM_notification({
        text: message,
        timeout: 4000,
    })
}

function aoaostar_log() {
    for (const argument of arguments) {
        if ($('.output :last-child .inline-block').text() === argument.toString()) {
            let count = parseInt($('.output :last-child .count').text()) || 0
            $('.output :last-child .count').text(count + 1)
            $('.output :last-child .count').removeClass('hidden')
        } else {
            $('.output').append(`<li><div class="inline-block">${argument}</div><span class="count hidden"></span></li>`)
        }
    }
    $('.output').scrollTop($('.output')[0]?.scrollHeight);
}

//获取get参数
function get_query_variable(variable, url = null) {
    let query = window.location.search.substring(1);

    if (url != null) {
        url.substr(url.indexOf("?") + 1);
        query = url.substr(url.indexOf("?") + 1);
    }
    const vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        if (pair[0] === variable) {
            return pair[1];
        }
    }
    return false;
}

//获取cookie值
function get_cookie(name) {
    let arr = document.cookie.split("; ");
    for (let i = 0; i < arr.length; i++) {
        let arr2 = arr[i].split("=");
        if (arr2[0] === name) {
            return arr2[1];
        }
    }
    return "";
}

let aoaostar_player = null;
let videoIsOver = false;

const aoaostar = {
    player: null,
    node_list: [],
    current_node_id: 0,
    course_id: 0,
    main_interval: null,
    remind_sound: 'https://downsc.chinaz.net/Files/DownLoad/sound1/201411/5140.mp3',
    initialize() {
        this.player = aoaostar_player
        this.current_node_id = parseInt(get_query_variable('nodeId'))
        this.course_id = this.get_course_id()
        this.get_node_list().then(res => {
            this.node_list = res
            //视频总数显示
            $('#node-count').text(this.node_list.length)
            //当前第n个视频
            let indexOf = this.node_list.indexOf(this.get_list_node(this.current_node_id));
            $('#node-index').text(indexOf + 1)
            //剩余视频
            $('#node-surplus').text(this.node_list.length - indexOf - 1)
        })
        this.get_node(this.current_node_id).then(current_node => {
            $('#course-duration').text(current_node.videoDuration + "秒")
            // 播放超时五分钟刷新页面，防止卡住
            setTimeout(() => {
                location.reload()
            }, (current_node.videoDuration + 5 * 60) * 1000)
            const interval = setInterval(() => {
                if (this.player.time >= parseInt(current_node.study_total.duration)) {
                    clearInterval(interval)
                }
                this.player.videoSeek(current_node.study_total.duration);
            }, 1500)
        })
        // 更新播放进度
        setInterval(() => {
            this.get_node(this.current_node_id).then(current_node => {
                let status = ''
                switch (current_node.study_total?.state) {
                    case '1':
                        status = '未学完';
                        break;
                    case '2':
                        status = '已学完';
                        videoIsOver = true
                        break;
                    default:
                        status = '未学';
                }
                $('#node-status').text(status)
                $('#node-progress').text(((current_node.study_total.progress || 0) * 100).toFixed(2) + '%')
            })
        }, 3000)
        $('#course-id').text(this.course_id)
        $('#node-id').text(this.current_node_id)
        $('#course-title').text($('.detmain-navlist .group .list .item a.on').text())

        if (window.console && window.console.log) {
            console.clear();
        }
        aoaostar_dump("%c 傲星英华学堂网课助手 %c https://www.aoaostar.com ",
            "color: #fadfa3; background: #030307; padding:5px 0;",
            "background: #fadfa3; padding:5px 0;");

        aoaostar_dump(`%c 当前课程ID：${this.course_id} %c 章节ID：${this.current_node_id}`,
            'background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff',
            'background: #41b883; padding: 4px; border-radius: 0 3px 3px 0; color: #fff',
        );
        aoaostar_dump("%c 脚本加载完成 当前时间：" + new Date().toLocaleString(),
            "color: #fff; margin: 1em 0; padding: 5px 0; background: #636e72;"
        );
        aoaostar_log("脚本加载完成 当前时间：" + new Date().toLocaleString());
    },
    main() {
        if (this.node_list[this.node_list.length - 1] === this.current_node_id) {
            aoaostar_log("恭喜你，当前为最后一课");
        }
        this.main_interval = setInterval(() => {
            aoaostar_log("播放状态检查，是否播放完成：" + videoIsOver);
            if (videoIsOver === true) {
                this.over();
            }
        }, 3000);

    },
    get_course_id() {

        let courseUrl = document.querySelector(".wrapper .curPlace .center");
        if (courseUrl == null) {
            courseUrl = window.location.href;
            this.course_id = get_query_variable("courseId", courseUrl);
        } else {
            this.course_id = get_query_variable("courseId", courseUrl.lastChild.href);
        }

        if (get_query_variable("courseId") === false) {
            window.location.href = this.get_full_url({
                id: this.current_node_id
            });
        }
        return this.course_id
    },
    over() {
        aoaostar_log("播放完成");
        if (this.is_over()) {
            aoaostar_log("恭喜你，已全部刷完");
            notification("恭喜你，已全部刷完");
            clearInterval(this.main_interval);
            try {
                let reminder = document.createElement('audio');
                reminder.src = this.remind_sound
                reminder.volume = 1
                reminder.play()
            } catch (e) {
            }
        } else {
            aoaostar_log("2秒后跳转下一部");
            setTimeout(() => {
                window.location.href = this.get_full_url(this.get_new_node());
            }, 2000);
        }
    },

    //获取当前课程所有id数组
    get_node_list() {
        return $.post('/api/course/chapter.json', {
            courseId: this.course_id,
            token: get_cookie('token'),
        }).then(res => {
            let arr = []
            for (const chapter of res.result.list) {
                for (const node of chapter.nodeList) {
                    node.tabVideo && arr.push(node)
                }
            }
            return arr
        })
    },
    //获取最新未学、未学完的node
    get_new_node() {
        for (const node of this.node_list) {
            if (node.videoState !== 2) {
                return node
            }
        }
        aoaostar_log("获取最新未学视频失败，跳转第一课");
        return this.node_list[0];
    },
    //获取node list中指定node信息
    get_list_node(node_id) {
        for (const node of this.node_list) {
            if (node.id === node_id) {
                return node
            }
        }
        aoaostar_log("获取最新未学视频失败，跳转最新课");
        return this.get_new_node();
    },
    //获取指定node信息
    get_node(node_id) {
        return $.post('/api/node/video.json', {
            nodeId: node_id,
            token: get_cookie('token'),
        }).then(res => {
            return res.result.data
        })
    },
    //判断是否学完
    is_over() {
        return this.node_list[this.node_list.length - 1].id === this.current_node_id;
    },
    //拼接完整课程Url
    get_full_url(node) {
        return `${window.location.origin}/user/node?courseId=${this.course_id}&nodeId=${node.id}&t=${new Date().getTime()}`
    }
}

function aoaostar_main() {

    //video.js 初始化
    const videoFile = $('#video-file').val() || '';
    const nodeId = $('#video-nodeId').val() || '';

    const studyUrl = '/user/node/study';
    let studyId = 0;
    let totalTime = 0;
    let studyTime = 0;
    let playState = 'playing';
    window.setInterval(function () {
        if (playState === 'playing') {
            totalTime++;
        }
    }, 1000);


    //记录鼠标行为轨迹,用于分析作弊,已完成的不在记录
    const sentLog = function () {
        $.post('/service/mouse_log', {
            g: "[7,209,10955,7,207,10963,7,206,10973,7,204,10979,7,203,10987,7,201,10995,7,200,11003,7,199,11011,9,200,11252,12,203,11260,16,208,11268,22,215,11275,30,223,11284,38,230,11291,48,238,11299,58,246,11307,69,252,11316,80,257,11324,90,260,11331,100,261,11339,106,261,11348,112,260,11355,116,258,11363,118,253,11371,119,248,11381,120,241,11387,120,234,11395,117,225,11403,113,218,11412,106,212,11419,94,205,11429,78,198,11435,56,190,11444,29,185,11452,2,184,11460,0,184,11467,0,189,11475,0,195,11483,0,203,11491,0,215,11499,0,228,11507,0,240,11516,0,254,11523,0,266,11533,0,278,11539,0,289,11547,0,300,11555,0,307,11564,1,316,11571,5,322,11579,12,327,11587,23,331,11595,36,332,11603,57,330,11611,90,320,11620,129,301,11627,172,278,11635,210,251,11643,241,224,11652,266,196,11660,283,169,11667,296,143,11675,301,123,11684,303,108,11692,305,95,11699,304,83,11708,302,73,11716,299,64,11724,295,55,11731,290,46,11740,283,38,11747,274,29,11755,264,20,11763,251,12,11772,238,3,11780,155,7,11932,155,7,11932,158,15,11940,164,26,11947,173,41,11957,185,58,11964,202,78,11972,220,94,11979,237,107,11988,250,116,11996,260,121,12004,267,123,12011,270,124,12019,272,124,12027,274,124,12036,275,123,12043,275,121,12051,275,118,12059,275,114,12068,275,109,12075,272,103,12083,267,97,12092,259,89,12100,246,81,12108,228,71,12116,205,62,12124,178,54,12132,151,46,12139,127,43,12148,110,42,12155,97,43,12164,87,47,12171,78,53,12179,73,63,12189,68,77,12196,63,96,12203,60,119,12212,58,149,12220,58,176,12228,61,213,12235,66,247,12245,75,282,12252,87,318,12260,99,348,12268,112,372,12276,124,386,12283,138,397,12292,150,402,12299,165,405,12307,180,405,12315,197,401,12324,217,392,12332,234,379,12339,250,364,12349,265,342,12356,279,313,12364,289,278,12371,295,244,12379,298,210,12388,300,180,12396,300,155,12404,299,133,12411,297,115,12419,293,101,12428,288,90,12436,279,80,12444,265,69,12452,241,56,12461,210,41,12468,169,28,12475,123,16,12484,78,9,12492,37,5,12502,4,5,12508,0,9,12515,0,17,12523,0,26,12532,0,39,12539,0,55,12547,0,73,12555,0,95,12564,0,121,12572,0,145,12580,2,179,12587,9,214,12597,21,249,12603,40,286,12612,64,322,12619,87,352,12628,111,378,12636,137,398,12644,161,412,12651,181,421,12659,200,427,12667,213,428,12677,228,428,12683,242,422,12692,261,412,12700,279,394,12710,297,369,12715,315,337,12724,329,301,12732,336,264,12740,339,233,12747,339,202,12756,332,175,12763,323,153,12772,312,134,12780,301,122,12787,288,111,12796,275,102,12804,262,95,12812,250,90,12819,237,87,12828,227,85,12835,219,85,12843,208,85,12851,199,88,12861,192,94,12867,185,106,12875,179,122,12883,175,148,12893,171,187,12900,169,231,12908,170,277,12916,176,324,12924,183,372,12932,197,421,12940,214,465,12948,237,502,12956,259,530,12964,285,550,12971,313,562,12980,344,565,12988,377,563,12996,415,554,13004,454,539,13012,486,518,13020,514,493,13028,536,463,13036,552,429,13047,562,396,13052,567,362,13060,569,331,13068,568,306,13077,566,286,13085,561,269,13091,551,253,13099,540,237,13108,528,224,13116,510,210,13124,489,197,13131,460,184,13140,427,170,13148,389,159,13158,346,150,13164,301,140,13171,259,137,13179,227,137,13189,190,139,13196,161,146,13204,140,156,13211,121,169,13220,106,185,13228,95,205,13238,87,230,13244,83,256,13252,80,285,13259,82,313,13269,88,340,13276,97,363,13285,109,381,13292,122,397,13300,142,410,13307,162,420,13316,188,430,13324,212,436,13332,232,438,13339,252,440,13347,269,440,13356,287,438,13365,301,434,13372,314,425,13380,327,412,13388,337,394,13397,346,374,13404,350,352,13412,353,332,13419,353,317,13429,352,301,13435,350,289,13444,347,278,13453,341,267,13460,334,257,13467,325,247,13476,313,235,13484,292,218,13493,267,195,13500,236,172,13508,204,148,13516,171,127,13525,139,107,13534,110,90,13540,86,77,13548,66,69,13556,52,64,13565,39,60,13571,30,59,13579,22,60,13587,14,64,13596,8,69,13604,4,77,13611,2,87,13619,2,99,13628,3,116,13636,8,139,13645,14,164,13652,23,186,13659,32,206,13668,43,223,13675,52,235,13684,61,242,13691,72,247,13699,84,248,13707,101,246,13715,125,240,13724,156,226,13732,191,206,13741,223,185,13748,252,160,13755,272,135,13764,286,113,13772,294,95,13779,297,82,13788,298,71,13796,298,64,13805,296,55,13812,291,49,13820,285,44,13827,276,39,13837,265,35,13846,250,30,13851,228,26,13859,203,24,13867,167,23,13877,131,25,13884,92,30,13893,51,41,13899,15,56,13910,0,73,13916,0,92,13923,0,116,13931,0,141,13940,0,170,13948,0,203,13956,3,237,13964,13,272,13973,30,306,13980,51,338,13988,80,365,13996,114,383,14004,155,394,14011,202,400,14020,256,399,14028,315,391,14036,374,377,14044,428,359,14052,475,341,14059,509,325,14068,535,312,14076,548,303,14083,557,297,14095,563,293,14100,566,291,14107,569,290,14115,572,289,14123,574,288,14131,576,288,14139,580,287,14147,583,287,14155,588,287,14164,593,286,14171,596,286,14181,599,286,14187,601,286,14195,605,286,14203,610,289,14211,615,295,14221,622,304,14228,633,316,14236,646,333,14244,658,350,14252,671,367,14260,681,381,14267,688,391,14275,692,398,14285,695,402,14292,696,405,14299,696,407,14315,696,411,14323,697,419,14334,700,431,14340,703,445,14349,709,463,14356,716,480,14364,723,497,14372,718,537,18244,713,546,18252,707,553,18260,701,561,18267,695,567,18276,690,572,18284,685,576,18291,682,581,18299,678,584,18307,675,589,18315,673,592,18323,671,596,18331,669,599,18339,668,602,18347,668,605,18355,666,608,18363,665,611,18372,665,613,18380,664,614,18388,662,616,18395,661,618,18403,658,620,18411,654,622,18419,663,613,19005,663,613,19005,678,599,19012,699,580,19019,722,561,19027,721,602,3715,717,604,3724,712,606,3732,709,609,3740,706,611,3747,705,613,3755,704,614,3763,704,615,3772,704,616,3779,704,617,3787,704,618,3795,704,619,3811,704,620,3867,703,621,3875,702,622,3884,701,622,3924,701,623,3931,699,624,3948,697,624,3955,439,618,8270,450,609,8277,465,597,8285,482,584,8293,497,570,8300,512,557,8308,529,542,8316,544,530,8324,558,518,8332,573,506,8340,585,495,8349,598,483,8356,610,471,8363,640,447,8388,651,439,8396,665,431,8404,722,292,13556,705,331,13565,688,373,13572,671,415,13580,654,456,13587,638,495,13597,625,528,13603,616,556,13611,610,575,13619,607,589,13627,604,600,13635,600,607,13643,599,613,13651,596,617,13659,593,622,13667,443,624,19981,451,620,19989,460,614,19996,470,609,6,478,603,11,487,598,21,495,594,27,503,589,38,510,583,43,516,578,52,522,572,59,528,566,68,533,561,75,539,556,83,546,551,91,552,546,100,558,540,107,565,535,115,572,531,123,578,528,132,582,526,139,585,524,147,588,522,155,591,521,163,592,521,171,593,520,179,594,520,188,595,519,195,596,519,203,599,519,211,602,519,220,606,519,227,611,519,235,619,518,243,627,517,251,635,515,259,645,514,268,654,512,275,666,510,285,679,507,291,692,503,299,708,497,307]",
            nodeId: nodeId
        });
    };
    //处理验证码,防止使用外挂
    let layIndex = null;
    let tw = '_';
    const sendTime = function (force, code) {
        studyTime = totalTime;
        let data = {nodeId: nodeId, studyId: studyId, studyTime: totalTime};
        if (code) {
            if (code.length > 4) {
                code = code.substr(0, 4);
            }
            data.code = code + tw;
        }
        if (force !== void 0 && force === 1 && totalTime < 1) {
            data.studyTime = 1;
        }
        $.ajax({
            method: 'post',
            url: studyUrl,
            data,
            dataType: 'json',
        }).then(ret => {
                code && (ret.status ? aoaostar_log('验证码正确') : aoaostar_log('验证码错误'));
                if (ret.status) {
                    studyId = ret.studyId;
                    if (code) {
                        playState = 'playing';
                        aoaostar_player.videoPlay();
                    } else if (ret.msg !== '提交学时成功!') {
                        aoaostar_log(`提交学时异常，${ret.msg}，2秒后刷新页面`)
                        setTimeout(() => {
                            window.location.reload()
                        }, 2000)
                    }
                }
                return ret
            }
        ).then(ret => {
            if (ret.need_code) {
                playState = 'pause';
                aoaostar_player.videoPause();
                if (layIndex === null) {
                    layIndex = 1;
                    //处理验证码
                    aoaostar_log(ret.msg);
                    aoaostar_log("识别验证码中，请稍后，可能需要多次请求才能成功，稍安勿躁");
                    fetch('/service/code/aa?r=' + Math.random())
                        .then(function (response) {
                            return response.blob()
                        }).then(blob => {
                        let formData = new FormData();
                        formData.append('file', blob)
                        fetch('https://api.opop.vip/captcha/recognize', {
                            method: 'post',
                            body: formData,
                            mode: 'cors',
                        }).then(response => response.json())
                            .then(res => {
                                let reader = new FileReader()
                                reader.onload = () => {
                                    console.log(`%c %c 识别结果 %c ${res.data} `,
                                        `padding: 40px 120px;background-image: url(${reader.result});background-size: contain;background-repeat: no-repeat;color: transparent;`,
                                        'background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff',
                                        'background: #41b883; padding: 4px; border-radius: 0 3px 3px 0; color: #fff',
                                    );
                                    aoaostar_log(`验证码&nbsp;&nbsp;&nbsp;&nbsp;<img class="captcha" src="${reader.result}"/>`)
                                    aoaostar_log(`识别结果：${res.data}`)
                                }
                                reader.readAsDataURL(blob)
                                sendTime(1, res.data);
                                layIndex = null;
                            }).catch(e => {
                            aoaostar_log(e)
                        })
                    })
                }
            }

        })
    };
    window.addEventListener('unload', function (ev) {
        const form = new FormData();
        const data = {nodeId: nodeId, studyId: studyId, studyTime: totalTime, close: 1};
        for (const k in data) {
            form.append(k, data[k]);
        }
        window.navigator.sendBeacon(studyUrl, form);
    });
    //提交学习时间
    window.setInterval(function () {
        if (aoaostar_player == null || totalTime <= studyTime) {
            return;
        }
        sendTime();
    }, typeof (window.navigator.sendBeacon) == 'function' ? 30000 : 10000);
    window.loadHandler = function () {
        if (studyId === 0) {
            sendTime(1);
        }
        sentLog();
    };
    const option = {
        container: '#videoContent', //容器的ID或className
        variable: 'player', //播放函数名称
        drag: 'start', //拖动的属性
        loaded: 'loadHandler',
        autoplay: true,//	是否自动播放
        flashplayer: false, //强制使用flashplayer
        volume: 0, //音量
        video: [
            [videoFile, 'video/mp4', '中文标清', 0]
        ]
    };
    aoaostar_player = new ckplayer(option);
    //实例化播放器
    try {
        aoaostar.initialize()
        aoaostar.main()
    } catch (e) {
        console.log(e)
        aoaostar_log(e)
        window.location.href = aoaostar.get_full_url(aoaostar.get_new_node());
    }
}
