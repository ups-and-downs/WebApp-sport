//string原型扩展方法
~ function (pro) {
    //myTrim:Remove the string and space
    pro.myTrim = function myTrim() {
        return this.replace(/(^ +| +$)/g, "");
    };

    //mySub:Intercept string, this method is distinguished in English
    pro.mySub = function mySub() {
        var len = arguments[0] || 10,
            isD = arguments[1] || false,
            str = "",
            n = 0;
        for (var i = 0; i < this.length; i++) {
            var s = this.charAt(i);
            /[\u4e00-\u9fa5]/.test(s) ? n += 2 : n++;
            if (n > len) {
                isD ? str += "..." : void 0;
                break;
            }
            str += s;
        }
        return str;
    };

    //myFormatTime:Format time
    pro.myFormatTime = function myFormatTime() {
        var reg = /^(\d{4})(?:-|\/|\.|:)(\d{1,2})(?:-|\/|\.|:)(\d{1,2})(?: +)?(\d{1,2})?(?:-|\/|\.|:)?(\d{1,2})?(?:-|\/|\.|:)?(\d{1,2})?$/g,
            ary = [];
        this.replace(reg, function () {
            ary = ([].slice.call(arguments)).slice(1, 7);
        });
        var format = arguments[0] || "{0}年{1}月{2}日{3}:{4}:{5}";
        return format.replace(/{(\d+)}/g, function () {
            var val = ary[arguments[1]];
            return val.length === 1 ? "0" + val : val;
        });
    };

    //queryURLParameter:Gets the parameters in the URL address bar
    pro.queryURLParameter = function queryURLParameter() {
        var reg = /([^?&=]+)=([^?&=]+)/g,
            obj = {};
        this.replace(reg, function () {
            obj[arguments[1]] = arguments[2];
        });
        return obj;
    };
}(String.prototype);

//rem
~ function () {
    let desW = 640,
        winW = document.documentElement.clientWidth || document.body.clientWidth;

    if (winW > desW) {
        $('.main').css('width', desW);
        return;
    }
    document.documentElement.style.fontSize = winW / desW * 100 + 'px';
}();

//header 点击导航显示nav

~ function () {
    let $header = $('.header'),
        $menu = $header.find('.menu'),
        $nav = $header.children('.nav');


    $menu.on('click', function () {

        //     //判断为什么要写字符串true？===不是直接类型转换了吗,因为通过attr获取的值都是字符串类型，而if直接判断是需要//数据类型转换，字符串转换成布尔是将字符串转换成数字，1是true，0是false。而字符串中出了数字和空字符串（转换//成0），其他字符都转成NaN，所以要加字符串进行比较

        if ($(this).attr('isBlock') === 'true') {
            $nav.css({
                height: '0',
                padding: '0'
            });
            $(this).attr('isBlock', false);
            return;
        }
        $nav.css({
            height: '2.22rem',
            padding: '.1rem 0'
        });
        $(this).attr('isBlock', true);
    });
}();

// match info
let matchRender = (function () {
    let $matchInfo = $('.matchInfo'),
        $matchInfoTemplate = $('#matchInfoTemplate');

    //绑定support 
    function bindEvent() {
        let $bottom = $matchInfo.children('.bottom'),
            $bottomH = $bottom.children('.home').children('a'),
            $bottomA = $bottom.children('.away').children('a'),
            $bottomLeft = $bottomH.children('span'),
            $bottomRight = $bottomA.children('span');

        //获取localStorage存储的信息，判断是否选了支持，并给选了的一方加bg
        let support = localStorage.getItem('support');
        if (support) {
            support = JSON.parse(support);
            if (support.isSelect) {
                $bottom.attr('isSelect', true);
                support.type === 1 ? $bottomA.addClass('bg') : $bottomH.addClass('bg');
            }
        }


        $matchInfo.on('click', function (ev) {
            let tar = ev.target,
                tarTag = tar.tagName, //一般来说移动端中，标签名都是大写，只有IE低版本中才是小写需要加toUpperCase
                tarP = tar.parentNode, //原生版 父级元素
                $tar = $(tar),
                $tarP = $tar.parent(), //jq版 父级元素
                tarInn = $tar.children('span').html(),
                $tarPP = $tarP.parent('.bottom');

            if (tarTag === 'A' && $tarPP) {
                //判断如果已经选择了就不能再选了，而且只能选择一个
                if ($tarPP.attr('isSelect') === 'true') return;

                $tar.addClass('bg').children('span').html(parseFloat(tarInn) + 1);
                $tarPP.attr('isSelect', true);

                //重新计算进度条
                $matchInfo.children('.middle').children('span').css('width', (parseFloat($bottomLeft.html()) / ((parseFloat($bottomLeft.html()) + parseFloat($bottomRight.html()))) * 100 + '%'));

                //给服务器发信息，告诉支持的谁
                $.ajax({
                    url: 'http://matchweb.sports.qq.com/kbs/teamSupport?mid=100000%3A1471179&_=1520068086201&callback=support&type=' + $tar.attr('type'),
                    dataType: 'jsonp'
                })

                //使用localStorage实现一台机器只能点一次
                localStorage.setItem('support', JSON.stringify({
                    "isSelect": true,
                    "type": $tar.attr('type')
                }));

            }


        });
    }

    function bindHTML(matchInfo) {
        //将模板绑定好数据后再放在matchInfo中
        $matchInfo.html(ejs.render($matchInfoTemplate.html(), {
            matchInfo: matchInfo
        }));

        //控制进度条
        //将进度条写在定时器里的原因是，如果不加就看不到动画效果，因为，当绑定数据的时候进度条的值就已经算出来了，同时动画也启动了，当数据绑定完成后，动画也完成了，所以看不到动画，加在定时器里就是为了等数据绑定完成后再计算进度条，再实现动画就能看到了
        window.setTimeout(function () {
            let leftNum = parseFloat(matchInfo.leftSupport),
                rightNum = parseFloat(matchInfo.rightSupport);
            $matchInfo.children('.middle').children('span').css('width', (leftNum / (leftNum + rightNum)) * 100 + '%');
        }, 500);

        bindEvent();
    }


    return {
        init: function () {
            //getdata 获取数据
            $.ajax({
                url: 'http://matchweb.sports.qq.com/html/matchDetail?mid=100000%3A1471179&_=1520068351734&callback=matchDetailCallback',
                dataType: 'jsonp',
                success: function (result) {
                    if (result && result[0] == 0) {
                        _result = result[1]; //因为我们要获取的主要是matchinfo，但是有两个信息在matchinfo外面，先把那两个放进matchinfo里，_result[1]表示主要数据
                        let matchInfo = _result['matchInfo'];
                        //把外面的leftSupport放到matchinfo里
                        matchInfo['rightSupport'] = _result['rightSupport'];
                        matchInfo['leftSupport'] = _result['leftSupport'];

                        //数据绑定
                        bindHTML(matchInfo);

                    }
                }
            })
        }
    }
})();
matchRender.init();

// match list
var matchListRender = (function () {
    var $matchList = $('.matchList'),
        $matchListUL = $matchList.children('ul'),
        $matchListTemplate = $('#matchListTemplate');

    function bindHTML(matchList) {
        //绑定数据，并计算ul的宽度
        $matchListUL.html(ejs.render($matchListTemplate.html(), {
            matchList: matchList
        })).css('width',parseFloat(document.documentElement.style.fontSize)*2.4*matchList.length + 20 + 'px');

        //->实现局部滚动
        new IScroll('.matchList',{
            scrollX:true,
            scrollY:false,
            click:true
        })


    }

    return {
        init: function () {
            $.ajax({
                url: 'http://matchweb.sports.qq.com/html/matchStatV37?mid=100000%3A1471179&_=1520073236425&callback=matchStatsCallback',
                dataType: 'jsonp',
                success: function (result) {
                    if (result && result[0] == 0) {
                        result = result[1]['stats'];
                        var matchList = null;
                        $.each(result, function (index, item) {
                            if (item['type'] == 9) {//此处尽量写== ，避免因为类型不一样而发生错误
                                matchList = item['list'];
                                return false;
                            }
                        });

                        //绑定数据
                        bindHTML(matchList);

                    }
                }
            });
        }
    }

})();
matchListRender.init();

// match playback
var matchPlaybackRender = (function () {
    var $matchPlayback = $('.matchPlayback'),
        $matchPlaybackUL = $matchPlayback.children('ul'),
        $matchPlaybackTemplate = $('#matchPlaybackTemplate');

    function bindHTML(matchPlayback) {
        //绑定数据，并计算ul的宽度
        $matchPlaybackUL.html(ejs.render($matchPlaybackTemplate.html(), {
            matchPlayback: matchPlayback
        })).css('width',parseFloat(document.documentElement.style.fontSize)*2.4*matchPlayback.length + 20 + 'px');

        //->实现局部滚动
        new IScroll('.matchPlayback',{
            scrollX:true,
            scrollY:false,
            click:true
        })


    }

    return {
        init: function () {
            $.ajax({
                url: 'http://matchweb.sports.qq.com/html/matchStatV37?mid=100000%3A1471179&_=1520073236425&callback=matchStatsCallback',
                dataType: 'jsonp',
                success: function (result) {
                    if (result && result[0] == 0) {
                        result = result[1]['stats'];
                        var matchPlayback = null;
                        $.each(result, function (index, item) {
                            if (item['type'] == 9) {//此处尽量写== ，避免因为类型不一样而发生错误
                                matchPlayback = item['list'];
                                matchPlayback=matchPlayback.reverse();
                                return false;
                            }
                        });

                        //绑定数据
                        bindHTML(matchPlayback);

                    }
                }
            });
        }
    }

})();
matchPlaybackRender.init();