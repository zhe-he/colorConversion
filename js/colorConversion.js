/*
* colorConversion 色值转换
* by: zhe-he
* e-mail: luanhong_feiguo@sina.com
* version: 1.0
* last-updata: 2015-8-17
*/


~function (){
	function colorConversion(){};

	colorConversion.prototype = {
		constructor: 	colorConversion,
		colorType: 	function (value){
			if (value == null) {
				throw '请输入色值';
			};
			var reHex = /^#(([0-9a-f]{3})|([0-9a-f]{6}))$/i;
			var reRgb = /^rgb\((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]),(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]),(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\)$/i;
			var reHsl = /^hsl\((\d+(?:|\.\d+)),((?:\d|[1-9]\d)(?:|\.\d+)|100)%,((?:\d|[1-9]\d)(?:|\.\d+)|100)%\)$/i;

			var i,type,valueArr = [];
			if (reHex.test(value)) {
				type = 'hex';
				var str = RegExp.$1;
				if (str.length === 3) {
					for (i = 0; i < 3; i++) {
						valueArr[i] = str.charAt(i) + str.charAt(i);
					};
				}else{
					for (i = 0; i < 3; i++) {
						valueArr[i] = str.substr(2*i,2);
					};
				};
			}else if(reRgb.test(value)) {
				type = 'rgb';
				for (i = 1; i < 4; i++) {
					valueArr[i-1] = RegExp['$'+i];
				};

			}else if(reHsl.test(value)) {
				type = 'hsl';
				for (i = 1; i < 4; i++) {
					valueArr[i-1] = RegExp['$'+i];
				};
			}else{
				throw '色值格式不正确';
			};
			return {type: type, valueArr: valueArr};
		},
		toRgb: 		function (value){
			var json = this.colorType(value);
			var rgbArr = [];
			if (json.type === 'hex') {
				for (var i = 0; i < 3; i++) {
					rgbArr[i] = parseInt(json.valueArr[i],16);
				};
			} else if(json.type === 'hsl') {
				json.valueArr[0]%=360;
				json.valueArr[1]/=100;
				json.valueArr[2]/=100;
				if (json.valueArr[1] === 0) {
					for (var i = 0; i < 3; i++) {
						rgbArr[i] = Math.round(json.valueArr[2]*255);
					};
				}else{
					var q,p,k,r,g,b;
					if (json.valueArr[2] < 0.5) {
						q = json.valueArr[2]*(1+json.valueArr[1]);
					}else{
						q = json.valueArr[2]+json.valueArr[1]-(json.valueArr[2]*json.valueArr[1]);
					};
					p = 2*json.valueArr[2]-q;
					k = json.valueArr[0]/360;

					r = k + 1/3;
					g = k;
					b = k - 1/3;

					r = check(r);
					g = check(g);
					b = check(b);

					rgbArr[0] = Math.round(assignment(r)*255);
					rgbArr[1] = Math.round(assignment(g)*255);
					rgbArr[2] = Math.round(assignment(b)*255);

					function check(x){
						if (x < 0) {
							x = x + 1
						}else if( x > 1){
							x = x - 1;
						};
						return x;
					}

					function assignment(x){
						if (x < 1/6) {
							return p+((q-p)*6*x);
						} else if(x >= 1/6 && x < 1/2){
							return q;
						}else if(x >= 1/2 && x < 2/3){
							return p+((q-p)*6*(2/3-x));
						}else{
							return p;
						};
					}
				};
			} else if(json.type === 'rgb'){
				rgbArr = json.valueArr;
			};

			return 'rgb('+rgbArr[0]+','+rgbArr[1]+','+rgbArr[2]+')';
		},
		toHex: 	function (value){
			var json = this.colorType(value);
			var hexArr = [];
			if (json.type === 'hsl') {
				var str = this.toRgb(value);
				str = str.substring(4,str.length-1);
				json.valueArr = str.split(',');
				json.type = 'rgb';
			};
			if(json.type === 'rgb') {
				for (var i = 0; i < 3; i++) {
					var value = Number(json.valueArr[i]);
					hexArr[i]=value<16?'0'+value.toString(16):value.toString(16);
				};
			};
			if(json.type === 'hex'){
				hexArr = json.valueArr;
			}
			return '#'+hexArr[0]+hexArr[1]+hexArr[2];
		},
		toHsl: 	function (value){
			var json = this.colorType(value);
			
			var h,s,l;
			if (json.type === 'hex') {
				var str = this.toRgb(value);
				str = str.substring(4,str.length-1);
				json.valueArr = str.split(',');
				json.type = 'rgb';
			};
			if (json.type === 'rgb') {
				// rgb 0~255 -> 0~1
				for (var i = 0; i < 3; i++) {
					json.valueArr[i]/=255;
				};

				var max = Math.max(json.valueArr[0],json.valueArr[1],json.valueArr[2]);
				var min = Math.min(json.valueArr[0],json.valueArr[1],json.valueArr[2]);

				l = (max+min)/2;
				var disC = max - min;

				if (max === min) {
					h = 0;
				} else{
					if (max === json.valueArr[0]) {
						var dis = json.valueArr[1]-json.valueArr[2];
						if (dis >= 0) {
							h = 60*dis/disC;
						}else{
							h = 60*dis/disC+360;
						};

					}else if(max === json.valueArr[1]){
						h = 60*(json.valueArr[2]-json.valueArr[0])/disC + 120;
					}else {
						h = 60*(json.valueArr[0]-json.valueArr[1])/disC + 240;
					};
				};

				if (l === 0 || max === min) {
					s = 0;
				}else if (l <= 0.5) {	// 0<l<=0.5
					s = disC/(2*l);
				}else{	// l>0.5
					s = disC/(2-2*l);
				};
			};
			if (json.type === 'hsl') {
				h = +json.valueArr[0];
				s = json.valueArr[1]/100;
				l = json.valueArr[2]/100;
			};
			

			// 判断整数
			var reInteger = /^\d+$/;
			h=reInteger.test(h)?h:h.toFixed(1);
			s=reInteger.test(s*100)?s*100:(s*100).toFixed(1);
			l=reInteger.test(l*100)?l*100:(l*100).toFixed(1);

			return 'hsl('+h+','+s+'%,'+l+'%)';
		}
	}
 
	window.colorConversion = new colorConversion;
}();