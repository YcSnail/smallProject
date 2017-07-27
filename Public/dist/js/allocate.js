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
	
	$('#scanTransfer').on('click', function() {
		dd.biz.util.scan({
			type: 'barCode',//type为qrCode或者barCode
			onSuccess: function(data) {
				addLoading();
				data.text = getGuid(data.text);
				if (data.text) {
					var url = '/jinco/index.php/ajax/getpalletinfo';
					$('#code').val(data.text);
					json('get', url, {code: data.text}, function(data) {
						removeLoading();
						if (data.code != 0) {
							alert(data.message);
							return;
						}
						
						$('#number').text(data.data[0]['Packages']);
						$('#numberRange').text(data.data[0]['PackagesRange']);
						$('#tons').text(data.data[0]['Tons']);
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
	
	$('#btnSubmit').on('click', function() {
		var code = $('#code').val();
		var warehouse = $('#warehouse').val();
		var loc = $('#location').val();
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
		
		addLoading();
		
		var url = '/jinco/index.php/ajax/receive';
		json('get', url, {code: code, warehouse: warehouse, loc: loc, startpkg: packageFrom, endpkg: packageTo}, function(data) {
			removeLoading();
			if (data.code == 0) {
				mui.toast('入库成功！',{ duration:'long', type:'div' });
				$('#lastReceive').html('上次提交：<br />' + $('#receiveInfo').html());
				$('#lastReceive #packageInfo').html($('#packageFrom').val() + '-' + $('#packageTo').val());
				$('#code').val('');
				$('#warehouse').val('');
				$('#location').val('');
				$('#packageFrom').val('');
				$('#packageTo').val('');
				$('#weight').text('');
				$('#lot').text('');
				$('#pallet').text('');
				$('#itemname').text('');
				$('#itemnumber').text('');
			} else {
				alert('入库失败！' + "\n\n" + data.message);
			}
		});
	});
	
	$('#btnTransfer').on('click', function() {
		var code = $('#code').val();
		var warehouse1 = $('#warehouse1').val();
		var warehouse2 = $('#warehouse2').val();
		if (code == '') {
			mui.toast('请扫描托盘号！',{ duration:'long', type:'div' });
			return;
		}
		if (warehouse1 == '') {
			mui.toast('请输入移出库位！',{ duration:'long', type:'div' });
			return;
		}
		if (warehouse2 == '') {
			mui.toast('请输入移入库位！',{ duration:'long', type:'div' });
			return;
		}
		
		var url = '/jinco/index.php/ajax/transfer';
		addLoading();
		json('get', url, {code: code, warehouse1: warehouse1, warehouse2: warehouse2}, function(data) {
			removeLoading();
			if (data.code == 0) {
				mui.toast('移库成功！',{ duration:'long', type:'div' });
				$('#code').val('');
				$('#warehouse1').val('');
				$('#warehouse2').val('');
			} else {
				alert('移库失败！' + "\n\n" + data.message);
			}
		});
	});
	
	// 入库js事件
	var lastorderid = Common.getCookie('orderid');
	if (lastorderid != null && lastorderid != '') {
		$('#lastorderid').html('上次分配单号：' + lastorderid);
	}
	
	$('.btnDel').each(function() {
		dd.barcodes[$(this).attr('data-barcode')] = 1;
	});
	$('.btnDel').on('click', function() {
		dd.barcodes[$(this).attr('data-barcode')] = 0;
		$(this).parent().remove();
		calcDetail();
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
					var barcode = data.text;
					
					if (dd.barcodes[barcode] == 1) { // if already scaned, no need to scan
						removeLoading();
						mui.toast('该托盘号已扫描过！',{ duration:'long', type:'div' });
						return;
					}
					
					json('get', url, {code: barcode, orderid: $('#orderid').val()}, function(data) {
						removeLoading();
						if (data.code != 0) {
							alert(data.message);
							return;
						}
						
						if (dd.barcodes[data['Pallet']] == 1) {
							removeLoading();
							mui.toast('该托盘号已扫描过！',{ duration:'long', type:'div' });
							return;
						}
						
						dd.barcodes[barcode] = 1;
						
						var len = $('.packageDv').length;
						var html = $('.packageDv').eq(0).html();
						html = html.replace('{0}', data['Pallet']);
						html = html.replace('{1}', data['Tons'] * 1000);
						$('.packageDv').eq(len-1).after('<div class="mui-input-row packageDv">' + html + '</div>');
						
						$('.packageFrom').eq(len).on('keyup', function() {
							calcPackageInfo(len);
						});
						$('.packageTo').eq(len).on('keyup', function() {
							calcPackageInfo(len);
						});
						
						$('.packageFrom').eq(len-1).attr('disabled', 'disabled');
						$('.packageTo').eq(len-1).attr('disabled', 'disabled');
						
						$('.packageFrom').eq(len).val(data['StartPkg']);
						$('.packageTo').eq(len).val(data['EndPkg']);
						calcDetail();
						
						$('.btnDel').eq(len).attr('data-barcode', barcode);
						$('.btnDel').eq(len).on('click', function() {
							dd.barcodes[$(this).attr('data-barcode')] = 0;
							$(this).parent().remove();
							calcDetail();
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
		var orderid = $('#orderid').val();
		var allocno = $('#allocno').val();
		var params = {};
		params.orderid = orderid;
		params.allocno = allocno;
		
		var n = 0;
		params['pallet'] = [];
		$('.package').each(function(index) {
			var pallet = $('.pallet').eq(index).text();
			if (pallet != '' && pallet != '{0}' && pallet != null) {
				var from = $(this).find('.packageFrom').val();
				var to = $(this).find('.packageTo').val();
				var allocno = $(this).find('.packageFrom').attr('data-allocno');
				var tons = $(this).find('.total').text();
				params['pallet'][n] = allocno + '|' + pallet + '|' + from + '|' + to + '|' + tons;
				n++;
			}
		});
		
		if (n == 0) {
			alert('请扫描托盘号！');
			return;
		}
		
		var url = '/jinco/index.php/ajax/allocate';
		addLoading();
		json('get', url, params, function(data) {
			removeLoading();
			if (data.code != 0) {
				alert(data.message);
				return;
			}
			
			alert('分配成功！');
			Common.setCookie('orderid', orderid, {expires: 30, path: '/'});
			location.href = '/jinco/index.php/welcome/allocate';
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