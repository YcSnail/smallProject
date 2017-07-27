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
	
	$('#scan').on('click', function() {
		scanCode();
	});
	init(); // init event
	
	function scanCode() {
		dd.biz.util.scan({
			type: 'barCode',//type为qrCode或者barCode
			onSuccess: function(data) {
				addLoading();
				data.text = getGuid(data.text);
				if (data.text) {
					var url = '/jinco/index.php/ajax/getinfo';
					$('#code').val(data.text);
					
					json('get', url, {code: data.text, loc: $('#location').val()}, function(data) {
						removeLoading();
						if (data.code != 0) {
							alert(data.message);
							return;
						}
						
						$('#lot').text(data.lot);
						$('#pallet').text(data.pallet);
						$('#packageFrom').val(data.startpkg);
						$('#packageTo').val(data.endpkg);
						$('#weight').text(data.weight);
						$('#itemname').text(data.itemname);
						$('#itemnumber').text(data.itemnumber);
						$('#location2').val(data.loc2);
					});
				} else {
					mui.toast('未识别，请重新扫描！',{ duration:'long', type:'div' });
				}
			},
		    onFail : function(err) {
				logger.e('biz.scancode.call: error' + JSON.stringify(err));
		    }
		});
	}
	
	$('#location').change(function() {
		clearAll();
	});
	
	function clearAll() {
		$('#code').val('');
		$('#packageFrom').val('');
		$('#packageTo').val('');
		$('#weight').text('');
		$('#lot').text('');
		$('#pallet').text('');
		$('#itemname').text('');
		$('#itemnumber').text('');
		$('#location2').val('');
	}
	
	function init() {
		$('#warehouse').val(Common.getCookie('warehouse'));
		var loc = Common.getCookie('loc');
		if (loc != '' && loc != null) {
			$('#location').val(loc);
		}
	}
	
	$('#btnSubmit').on('click', function() {
		var code = $('#code').val();
		var warehouse = $('#warehouse').val();
		var loc = $('#location').val();
		var loc2 = $('#location2').val();
		var packageFrom = $('#packageFrom').val();
		var packageTo = $('#packageTo').val();
		if (code == '') {
			mui.toast('请扫描条码！',{ duration:'long', type:'div' });
			return;
		}
		if (warehouse == '') {
			mui.toast('请输入仓库位！',{ duration:'long', type:'div' });
			return;
		}
		if (loc == '') {
			mui.toast('请输入库位！',{ duration:'long', type:'div' });
			return;
		}
		if (loc2 == '') {
			mui.toast('请输入货位！',{ duration:'long', type:'div' });
			return;
		}
		packageFrom = parseInt(packageFrom);
		if (isNaN(packageFrom)) {
			packageFrom = 0;
		}
		packageTo = parseInt(packageTo);
		if (isNaN(packageTo)) {
			packageTo = 0;
		}
		if (packageFrom == 0) {
			mui.toast('开始袋号不能为0！',{ duration:'long', type:'div' });
			return;
		}
		if (packageFrom > packageTo) {
			mui.toast('结束袋号必须大于开始袋号！',{ duration:'long', type:'div' });
			return;
		}
		
		$('#lastReceive').hide();
		addLoading();
		
		var url = '/jinco/index.php/ajax/receive';
		json('get', url, {code: code, warehouse: warehouse, loc: loc, startpkg: packageFrom, endpkg: packageTo, loc2: loc2}, function(data) {
			removeLoading();
			if (data.code == 0) {
				mui.toast('入库成功！',{ duration:'long', type:'div' });
				$('#lastReceive').show();
				$('#lastReceive').html('上次提交：<br />' + $('#receiveInfo').html());
				$('#lastReceive #packageInfo').html($('#packageFrom').val() + '-' + $('#packageTo').val());
				clearAll();
				Common.setCookie('warehouse', warehouse, {expires: 30});
				Common.setCookie('loc', loc, {expires: 30});
			} else {
				alert('入库失败！' + "\n\n" + data.message);
			}
		});
	});
	
	// 入库js事件
	$('#packageFrom').on('keyup', function() {
		calcPackageInfo();
	});
	$('#packageTo').on('keyup', function() {
		calcPackageInfo();
	});
	
	$('#btnScan').on('click', function() {
		dd.biz.util.scan({
			type: 'barCode',//type为qrCode或者barCode
			onSuccess: function(data) {
				addLoading();
				data.text = getGuid(data.text);
				var barcode = data.text;
				if (data.text) {
					var url = '/jinco/index.php/ajax/getpackageinfo';
					$('#code').val(data.text);
					json('get', url, {code: data.text}, function(data) {
						removeLoading();
						if (data.code != 0) {
							alert(data.message);
							//return;
						}
						
						var len = $('.packageDv').length;
						var html = $('.packageDv').eq(0).html();
						html = html.replace('{0}', len);
						$('.packageDv').eq(len-1).after('<div class="mui-input-row packageDv">' + html + '</div>');
						$('.package').eq(len).attr('data-id', barcode);
						
						var html = '袋号从 ' + data.data[0]['Packages'] + '， 共 ' + data.data[0]['Tons'] + ' 吨 ';
						$('.package').eq(len).val(html);
						
						var total = '';
						for(var key in dd.unlocated) {
							dd.unlocated[key] = dd.unlocated[key] - data.data[0]['Tons'];
							dd.located[key] += data.data[0]['Tons'];
							total += dd.items[key] + '共计分配 ' + dd.located[key] + ' 吨，还可以分配 ' + dd.unlocated[key] + ' 吨<br />';
						}
						$('#total').html(total);
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
	
	$('#btnIssue').on('click', function() {
		var orderid = $('#orderid').val();
		var params = {};
		params.orderid = orderid;
		
		var n = 0;
		params['lot'] = [];
		params['lotinfo'] = [];
		$('.package').each(function() {
			if ($(this).val() != '') {
				params['lot'][n] = $(this).val();
				params['lotinfo'][n] = $(this).attr('data-id');
				n++;
			}
		});
		
		if (n == 0) {
			alert('请扫描袋号！');
			return;
		}
		
		var url = '/jinco/index.php/ajax/issue';
		addLoading();
		json('get', url, params, function(data) {
			removeLoading();
			if (data.code != 0) {
				alert(data.message);
				return;
			}
			
			alert('出库成功！');
			location.reload();
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
	
	function calcPackageInfo() {
		var value = $('#packageFrom').val();
		value = value.replace(/[^\d]/g, '');
		$('#packageFrom').val(value);
		
		var toValue = $('#packageTo').val();
		toValue = toValue.replace(/[^\d]/g, '');
		$('#packageTo').val(toValue);
		
		value = parseInt(value);
		toValue = parseInt(toValue);
		
		if (isNaN(value)) {
			value = 0;
		}
		if (isNaN(toValue)) {
			toValue = 0;
		}
		
		if (value > toValue || toValue == 0) {
			$('#weight').text('0袋 / 0吨');
			return;
		}
		
		if (value == 0) {
			value = toValue;
		} else {
			value = toValue - value;
			value += 1;
		}
		
		$('#weight').text(value + '袋 / ' + (value * 2 / 10) + '吨');
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

});

dd.error(function(err) {
    logger.e('dd error: ' + JSON.stringify(err));
});