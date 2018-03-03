# WebApp-sport
## 目录
1. 通过less构建响应式布局;
2. 使用CSS3动画过渡导航栏；
3. 通过zepto.js框架中ajax方法向腾讯体育服务器发送跨域请求;
4. 通过模板引擎ejs绑定数据;
5. 通过IScroll实现视频栏的局部横向滚动;
6. 使用localStorage存储用户是否点击支持的数据;

## 通过less构建响应式布局
  把常用样式写在public里，再使用import引用（reference: 使用该less文件但是不输出它）。
  ```javascript
  @import (reference) "public";
html {
    font-size: 100px;
}

html,
body {
    width: 100%;
    overflow-x: hidden;
    color: extract(@cL, 1);
    background: extract(@cL, 3);
    font-family: 'Times New Roman', Times, serif;
}

  ```

## 使用CSS3动画过渡导航栏
  transition方法已在public定义。点击导航栏按钮展开全部导航，动画过渡时间0.3秒。
  ```javascript
 .nav {
        height: 0; // 2.22rem
        padding: 0; // .1rem 0
        font-size: .32rem;
        overflow: hidden;
        background: #fff;
        
        .transition (@duration: .3s);
        
        a {
            float: left;
            height: .74rem;
            width: 16%;
            line-height: .74rem;
            text-align: center;
            &:nth-child(6n+1) {
                margin-left: 2%;
            }
        }
    }
  ```
 
## 通过zepto.js框架中ajax方法向腾讯体育服务器发送跨域请求
  跨域使用jsonp。
  ```javascript
$.ajax({
                url: 'http://matchweb.sports.qq.com/html/matchStatV37?mid=100000%3A1471179&_=1520073236425&callback=matchStatsCallback',
                dataType: 'jsonp',
                success: function (result) {
                    if (result && result[0] == 0) {
                    //重置数据  
                        result = result[1]['stats'];
                        var matchPlayback = null;
                        $.each(result, function (index, item) {
                            if (item['type'] == 9) {
                                matchPlayback = item['list'];
                                matchPlayback=matchPlayback.reverse();
                                return false;
                            }
                        });
                        //绑定数据
                        bindHTML(matchPlayback);

                    }
                }
  ```
  给ejs模板绑定数据
  ```javascript
  function bindHTML(matchPlayback) {
        $matchPlaybackUL.html(ejs.render($matchPlaybackTemplate.html(), {
            matchPlayback: matchPlayback
        }));
        }
  ```
 
## 通过模板引擎ejs绑定数据

将从服务器获取的视频列表通过ejs绑定到页面上
  ```javascript
  <script charset="utf-8" type="text/template" id="matchPlaybackTemplate">
        <% $.each(matchPlayback,function(index,item){ %>
            <li>
                <div>
                    <img src="<%= item.pic %>">
                    <span>
                        <%= item.duration.slice(item.duration.indexOf(':')+1) %>
                    </span>
                </div>
                <p>
                    <%= item.title %>
                </p>
            </li>
            <%});%>
    </script>
  ```
  [EJS入门](https://www.jianshu.com/p/81ea81d291fd)

## 通过IScroll实现视频栏的局部横向滚动
  通过IScroll插件将绑定好的数据实现局部横向滚动。
  
  ```javascript
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
  ```
  通过IScroll插件实现滚动相当简单，scrollX和scrollY是设置滚动方向，click表示滚动区域可点击（为了防止在滑动过程中出现误操作，click属性默认是false）
## 使用localStorage存储用户是否点击支持的数据
当用户点击过支持后，不能再次点击。而且刷新页面时应该展示点击过后的效果，也不能再次点击支持，并且还需要向服务器发送信息。使用localStorage将用户的操作信息保存起来，当刷新页面时先读取localStorage里的数据，判断用户有没有相关操作，如果没有再向服务器请求数据。
  ```javascript
let support = localStorage.getItem('support');
        if (support) {
            support = JSON.parse(support);
            if (support.isSelect) {
                $bottom.attr('isSelect', true);
                support.type === 1 ? $bottomA.addClass('bg') : $bottomH.addClass('bg');
            }
        }


        $matchInfo.on('tap',  (ev) => {
            let tar = ev.target,
                tarTag = tar.tagName, 
                tarP = tar.parentNode, 
                $tar = $(tar),
                $tarP = $tar.parent(), 
                tarInn = $tar.children('span').html(),
                $tarPP = $tarP.parent('.bottom');

            if (tarTag === 'A' && $tarPP) {
                //判断如果已经选择了就不能再选了，而且只能选择一个
                if ($tarPP.attr('isSelect') === 'true') return;

                $tar.addClass('bg').children('span').html(parseFloat(tarInn) + 1);
                $tarPP.attr('isSelect', true);

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

```
localStorage存储的值为字符串，如果不是字符串会进行默认转换，存储对象应该这样写： 
  ```javascript
  localStorage.setItem("key",JSON.stringify({obj}));
```

#### 设计模式
本项目使用单例模式构建代码模块， 使得各模块之间不受影响，并且提高了代码的可读性和可维护性。
  ```javascript
  //string原型扩展方法
~ function (pro) {...
}(String.prototype);

//rem
~ function () {...
}();

//header 
~ function () { ...
})();

// match info
let matchRender = (function () {...
})();
matchRender.init();

// match list
let matchListRender = (function () {...
})();
matchListRender.init();

// match playback
let matchPlaybackRender = (function () {...
 })();
matchPlaybackRender.init();
```

```