/**
 * Created by liqiao on 8/10/15.
 */

/**
 * _config comes from server-side template. see views/index.jade
 */
dd.config({
    agentId: _config.agentId,
    corpId: _config.corpId,
    timeStamp: _config.timeStamp,
    nonceStr: _config.nonceStr,
    signature: _config.signature,
    jsApiList: [
        'runtime.info',
        'device.notification.prompt',
        'biz.chat.pickConversation',
        'device.notification.confirm',
        'device.notification.alert',
        'device.notification.prompt',
        'biz.chat.open',
        'biz.util.open',
        'biz.user.get',
        'biz.contact.choose',
        'biz.telephone.call',
		'device.audio.startRecord',
		'device.audio.stopRecord',
		'biz.util.uploadImageFromCamera',
		'device.audio.play',
		'device.audio.download',
        'biz.ding.post']
});
dd.userid=0;
dd.ready(function() {
    dd.runtime.info({
        onSuccess: function(info) {
        },
        onFail: function(err) {
        }
    });
	var userid = Common.getCookie('userid');
	if (_config.userid == 0 || userid == null) {
		dd.biz.user.get({
			onSuccess: function (info) {
				Common.setCookie('userid', info.id);
				Common.setCookie('nickname', info.nickName);
				Common.setCookie('avatar', info.avatar);
			},
			onFail: function (err) {
				alert('userGet fail: ' + JSON.stringify(err));
			}
		});
		dd.runtime.permission.requestAuthCode({
			corpId: _config.corpId,
			onSuccess: function(result) {
				location.href = '/jinco/index.php/welcome/index?code=' + result.code;
			},
			onFail : function(err) {}
		 
		});
	}
	
	$('.my-item .ico').on('click', function() {
		addLoading();
		location.href = $(this).parent().find('a').attr('href');
	});
	
	function removeLoading() {
		$('.spinner').remove();
	}
	
	function addLoading() {
		var div = document.createElement('div');
			div.innerHTML = '<div class="spinner">' + 
		  '<div class="spinner-container container1">' + 
			'<div class="circle1"></div>' + 
			'<div class="circle2"></div>' + 
			'<div class="circle3"></div>' + 
			'<div class="circle4"></div>' + 
		  '</div>' + 
		  '<div class="spinner-container container2">' + 
			'<div class="circle1"></div>' + 
			'<div class="circle2"></div>' + 
			'<div class="circle3"></div>' + 
			'<div class="circle4"></div>' + 
		  '</div>' + 
		  '<div class="spinner-container container3">' + 
			'<div class="circle1"></div>' + 
			'<div class="circle2"></div>' + 
			'<div class="circle3"></div>' + 
			'<div class="circle4"></div>' + 
		  '</div>' + 
		'</div>';
		document.body.appendChild(div);
	}
	
	return;
	dd.biz.user.get({
        onSuccess: function (info) {
			if (Common.getCookie('userid') != info.id) {
				//alert(_config.url.indexOf('/welcome/index'));
				Common.setCookie('userid', info.id);
				Common.setCookie('nickname', info.nickName);
				Common.setCookie('avatar', info.avatar);
				location.reload();return;
			}
			return;
			
			if (info.id && _config.url.indexOf('/welcome/index') > -1) {
				Common.setCookie('userid', info.id);
				location.reload();return;
				// get user authority
				// 只有在首页需要获取用户权限
				$.ajax({
				  type: 'GET',
				  url: '/jinco/index.php/ajax/getauthority',
				  // data to be added to query string:
				  data: {userid: info.id},
				  // type of data we are expecting in return:
				  dataType: 'json',
				  timeout: 300,
				  context: $('body'),
				  success: function(data){
					  //$('.spinner').hide();
					  if (data.code == 0) {
						  if (data.userid != dd.userid) {
							  alert('非法');
							  return;
						  }
						  for(var key in data.authority) {
							  $('.my-item .' + data.authority[key]).show();
						  }
						  $('.my-item').show();
						  return;
					  }
					  
					  alert(data.msg);
				  },
				  error: function(xhr, type){
					  
				  }
				});
			}
			dd.userid = info.id;
			$('.my-top .name').text(info.nickName);
			if (info.avatar != '') {
				$('.my-top img').attr('src', info.avatar);
			}
			$('.my-top').show();
        },
        onFail: function (err) {
            alert('userGet fail: ' + JSON.stringify(err));
        }
    });

});

dd.error(function(err) {
    logger.e('dd error: ' + JSON.stringify(err));
});