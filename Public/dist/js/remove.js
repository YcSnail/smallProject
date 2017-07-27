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
dd.ajaxLock = false;
dd.unlocated = {};
dd.located = {};
dd.items = {};
dd.barcodes = {
};

dd.ready(function() {
    dd.runtime.info({
        onSuccess: function(info) {
        },
        onFail: function(err) {
        }
    });
	
	if (_config.userid == 0) {
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
	
	$('#btnScan').on('click', function() {
		dd.biz.util.scan({
			type: 'barCode',//type为qrCode或者barCode
			onSuccess: function(data) {
				addLoading();
				data.text = getGuid(data.text);
				var barcode = data.text;
				if (data.text) {
					var url = '/jinco/index.php/ajax/getrmpackageinfo';
					var barcode = data.text;
					
					if (dd.barcodes[barcode] == 1) { // if already scaned, no need to scan
						removeLoading();
						mui.toast('该袋号已扫描过！',{ duration:'long', type:'div' });
						return;
					}
					
					json('get', url, {code: barcode}, function(data) {
						removeLoading();
						if (data.code != 0) {
							alert(data.message);
							return;
						}
						dd.barcodes[barcode] = 1;
						
						var len = $('.packageDv').length;
						var html = $('.packageDv').eq(0).html();
						html = html.replace('{0}', data['Pallet']);
						html = html.replace('{1}', data['Tons'] * 1000);
						$('.packageDv').eq(len-1).after('<div class="mui-input-row packageDv" style="height: 41px;">' + html + '</div>');
						
						$('.pkgNo').eq(len).html(data.packageno);
						
						$('.btnDel').eq(len).attr('data-barcode', barcode);
						$('.btnDel').eq(len).on('click', function() {
							dd.barcodes[$(this).attr('data-barcode')] = 0;
							$(this).parent().remove();
						});
					});
					
				} else {
					mui.toast('未识别，请重新扫描！',{ duration:'long', type:'div' });
				}
			},
		    onFail : function(err) {
				logger.e('biz.scancode.call: error' + JSON.stringify(err));
		    }
		});
	});
	
	$('#btnAllocate').on('click', function() {
		var params = {};
		
		var n = 0;
		params['packages'] = [];
		$('.pkgNo').each(function(index) {
			var pallet = $('.pkgNo').eq(index).text();
			if (pallet != '' && pallet != '{0}' && pallet != null) {
				params['packages'][n] = {code: pallet};
				n++;
			}
		});
		
		if (n == 0) {
			alert('请扫描袋号！');
			return;
		}
		
		var url = '/jinco/index.php/ajax/removepackage';
		addLoading();
		json('get', url, params, function(data) {
			removeLoading();
			if (data.code != 0) {
				alert(data.message);
				return;
			}
			
			alert('作废成功！');
			var html = '已经删除袋号：<br />';
			$('.pkgNo').each(function(index) {
				var pallet = $('.pkgNo').eq(index).text();
				if (pallet != '' && pallet != '{0}' && pallet != null) {
					html += pallet + '袋号已经删除<br />';
				}
			});
			for (var n = 1; n < $('.pkgNo').length; n++) {
				$('.pkgNo').eq(n).parent().remove();
			}
			
			$('#detail').html(html);
			dd.barcodes = {};
		});
	});
	
	function getGuid(code) {
		if (code.indexOf('guid=') > -1) {
			code = code.substr(code.indexOf('guid=') + 5);
			if (code.indexOf('&') > -1) {
				code = code.substr(0, code.indexOf('&'));
			}
		}
		
		return code;
	}
	
	function calcDetail() {
		var total = 0;
		$('.total').each(function() {
			var value = $(this).text();
			value = parseFloat(value);
			if (!isNaN(value)) {
				total += value;
			}
		});
		
		var allocate = parseFloat(dd.orderinfo.allocate);
		var unallocate = parseFloat(dd.orderinfo.unallocate);
		if (isNaN(allocate)) allocate = 0;
		if (isNaN(unallocate)) unallocate = 0;
		
		$('#allocate').text(allocate + total);
		$('#unallocate').text(unallocate - total);
	}
	
	function calcPackageInfo(index) {
		var value = $('.packageFrom').eq(index).val();
		value = value.replace(/[^\d]/g, '');
		$('.packageFrom').eq(index).val(value);
		
		var toValue = $('.packageTo').eq(index).val();
		toValue = toValue.replace(/[^\d]/g, '');
		$('.packageTo').eq(index).val(toValue);
		
		value = parseInt(value);
		toValue = parseInt(toValue);
		
		if (isNaN(value)) {
			value = 0;
		}
		if (isNaN(toValue)) {
			toValue = 0;
		}
		
		if (value > toValue || toValue == 0) {
			$('.total').eq(index).text('0袋 / 0公斤');
			return;
		}
		
		if (value == 0) {
			value = toValue;
		} else {
			value = toValue - value;
			value += 1;
		}
		
		$('.total').eq(index).text((value * 2 * 100));
		calcDetail();
	}
	
	function json(method, url, data, callback) {
		if (dd.ajaxLock) {
			removeLoading();
			return false;
		}
		dd.ajaxLock = true;
		
		$.ajax({
		  type: method || 'get',
		  url: url,
		  // data to be added to query string:
		  data: data,
		  // type of data we are expecting in return:
		  dataType: 'json',
		  timeout: 10000,
		  context: $('body'),
		  success: function(data){
			dd.ajaxLock = false;
			  if (typeof callback == 'function') {
				  callback(data);
			  }
		  },
		  error: function(xhr, type){
			removeLoading();
			dd.ajaxLock = false;
			if (type == 'timeout') {
				alert('网络超时，请重试。');
				return;
			}
			alert(type);
		  }
		});
	}
	
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