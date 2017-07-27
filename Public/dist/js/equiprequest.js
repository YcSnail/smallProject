
    $('#scanUpload').on('click', function() {
		dd.biz.util.uploadImageFromCamera({
		    compression:true,//(是否压缩，默认为true)
		    onSuccess : function(result) {
				$('#photo').val(result[0]);
				$('#picture').attr('src', result[0]);
				var url = '/jinco/index.php/ajax/uploadImg';
				json('get', url, {img: result}, function(data) {
					if (data.url != '') {
						//$('#photo').val(data.url);
					}
				});
		    },
		    onFail : function(err) {}
		});
	});

	$('#uploadRecording').on('click', function() {
				$('#stopRecording').show();
				$('#uploadRecording').hide();
                setCountDown();
	});

	$('#stopRecording').on('click', function() {
                // 停止计时器
                clearCountDown();

				$('#mediaId').val(res.mediaId);
				$('#uploadRecording').show();
				$('#stopRecording').hide();
				$('#recordingValue').text(res.duration + 's');

				
				var url = '/jinco/index.php/ajax/uploadAudio';
				json('get', url, {mediaId: res.mediaId}, function(data) {
					if (data.url != '') {
						$('#mediaId').val(data.url);
					}
				});
				
	});


    //设置定时器
    function setCountDown() {
        var timeDown = window.setTimeout("setTime()",1000);
    }

    //定时器 异步运行
    function setTime(){
        i += 1;
        $('#recordingValue > span').empty();
        $('#recordingValue > span').text(i);
    }

    //去掉定时器
    function clearCountDown() {
        window.clearTimeout(timeDown);
    }



	$('#btnRequest').on('click', function() {
		var url = '/jinco/index.php/ajax/equipRequest';
		var worklicense = '';
		$('.worklicense').each(function() {
			if ($(this).is(':checked')) {
				worklicense += 'y';
			} else {
				worklicense += 'n';
			}
		});
		var spare = '';
		$('.spare').each(function() {
			if ($(this).is(':checked')) {
				spare += 'y';
			} else {
				spare += 'n';
			}
		});
		
		var params = {
			requestno: $('#requestno').val(),
			requestdate: $('#requestdate').val(),
			requestby: $('#requestby').val(),
			equipmentzone: $('#equipmentzone').val(),
			worktype: $('#worktype').val(),
			priority: $('#priority').val(),
			phone: $('#phone').val(),
			equipcode: $('#equipcode').val(),
			equipname: $('#equipname').val(),
			equipid: $('#equipid').val(),
			finishtime: $('#finishtime').text(),
			stoptime: $('#stoptime').text(),
			requestdept: $('#requestdept').val(),
			photo: $('#photo').val(),
			mediaid: $('#mediaId').val(),
			location: $('#location').val(),
			description: $('#description').val(),
			otherspare: $('#otherspare').val(),
			attention: $('#attention').val(),
			comments: $('#comments').val(),
			worklicense: worklicense,
			spare: spare
		};
		
		addLoading();
		json('get', url, params, function(data) {
			removeLoading();
			if (data.code != 0) {
				alert(data.message);
				return;
			}
			
			alert('申请成功');
			location.href = '/jinco/index.php/welcome/equipSearch';
		});
	});
	
	$('#btnSearch').on('click', function() {
		var url = '/jinco/index.php/ajax/equipSearch';
		var params = {filter: $('#equipidTxt').val()};
		
		addLoading($('.mui-table-view'));
		$('.equipment').hide();
		json('get', url, params, function(data) {
			removeLoading();
			$('.equipment').show();
			if (data.code != 0) {
				return;
			}
			
			var html = '';
			var template = '<li class="mui-table-view-cell equipment">' + 
					'<a class="mui-navigate-right" href="/jinco/index.php/welcome/equipRequest?id={equipid}">' +
					'	<span class="mui-badge">{equipid}</span>' +
					'	{equipcode} <br /> {equipname}' +
					'</a>' +
					'</li>';
			for (var key in data.Equipment) {
				var item = data.Equipment[key];
				var li = template;
				li = li.replace(/{equipid}/g, item['id']);
				li = li.replace(/{equipcode}/g, item['no']);
				li = li.replace('{equipname}', item['name']);
				li = li.replace('{equipname_encode}', encodeURIComponent(item['name']));
				html += li + "\n";
			}
			
			$('.equipment').remove();
			$('.mui-table-view').append(html);
			$('.mui-table-view').height(1400);
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
		$('.loading').remove();
	}
	
	function addLoading(obj) {
		var div = document.createElement('div');
			div.innerHTML = '<div class="loading"><div class="spinner">' + 
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
		'</div></div>';
		
		if (obj == null || obj == '' || obj == undefined) {
			document.body.appendChild(div);
		} else {
			obj.append(div);
		}
	}
