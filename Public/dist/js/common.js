var Common = {
	getCookie: function(name) {
        var arg = name + '=';
        var alen = arg.length;
        var clen = document.cookie.length,
            i = 0;
        while (i < clen) {
            var j = i + alen;
            if (document.cookie.substring(i, j) == arg) {
                var _endstr = document.cookie.indexOf(';', j);
                if (_endstr == -1) _endstr = document.cookie.length;
                return unescape(document.cookie.substring(j, _endstr));
            }
            i = document.cookie.indexOf(' ', i) + 1;
            if (i == 0) break;
        };
        return null;
    },
    
    setCookie: function(name, value, options){
		if (typeof value != 'undefined') {
			options = options || {};
			if (value === null) {
				value = '';
				options.expires = -1;
			}
			var expires = '';
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() + (options.expires * 86400 * 1000));
				} else {
					date = options.expires;
				}
				expires = '; expires=' + date.toUTCString();
			}
			var path = options.path ? '; path=' + (options.path) : '';
			var domain = options.domain ? '; domain=' + (options.domain) : '';
			var secure = options.secure ? '; secure' : '';
			document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
		}
	},
    
    removeCookie: function(name, options){
		if (Common.getCookie(name) !== null) {
			Common.setCookie(name, null, options);
			return true;
		}
		return false;
	}
	
};