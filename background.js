// get all unique words once the page loads
// cache all the results from 

var ASL = {};
ASL = 
(function(){

	var selector = {};
	var utils = {addListener:null, removeListener:null};
	var showASLTimer;
	var options = {};
	var defaults = {displayTime: 86400, scrolling:'no',callback : function(){}};

	var init = function(){
		utils.addListener(document, "dblclick", selector.showASL, false);
		var imgWrap = document.createElement('div');
		imgWrap.setAttribute('id', 'asl-outer-container');
		document.body.insertBefore(imgWrap,document.body.childNodes[0]);
		aslcontainer = document.createElement('div');
		aslcontainer.setAttribute('id', 'asl-container');
		imgWrap.appendChild(aslcontainer);
		imgWrap.style.display = 'none';
	};

	var setup = function (_options, callback){
		console.log("setup called in background");
		_options = _options || {};
		options.callback = callback || defaults.callback;
		options.displayTime = _options.displayTime ? _options.displayTime : defaults.displayTime;
		options.scrolling = _options.scrolling ? 'yes' : defaults.scrolling;
		init();
	};

	// wrapping event handlers for all browsers
	if(typeof window.addEventListener === 'function'){
		utils.addListener = function(el, type, callback,flag){
			if(flag === undefined) flag = false;
			el.addEventListener(type,callback,flag);
		}
	}else if(typeof window.attachEvent === 'function'){
		utils.addListener = function(el, type, callback){
			el.attachEvent(type,callback);
		} 
	}else{
		utils.addListener = function(el, type, callback){
			el['on'+type] = callback;
		}
	}
	
	// this returns the selected text
	selector.getSelected = function(e){
		var t = '';
		if(window.getSelection){
			t = window.getSelection();
		}else if(document.getSelection){
			t = document.getSelection();
		}else if(document.selection){
			t = document.selection.createRange().text;
		}
		return t;
	}

	// this gets called when a dblclick is done on the document
	selector.showASL = function(e){
		var str = String(selector.getSelected(e));
		var loadImg;


		if(str != ''){
			// trim spaces
			str = str.replace(/^\s+|\s+$/g,"");
			str = str.replace(/[\.\!\?\,\)\(\]\[\-\!]/g,"");
			var outerContainer = document.getElementById("asl-outer-container");
			var aslContainer = document.getElementById("asl-container");
			if(!loadImg){
				loadImg = document.createElement('img');
				loadImg.setAttribute('id', 'asl-load-img');
				loadImg.setAttribute('src', chrome.extension.getURL('images/loading.gif'));
				while (aslContainer.firstChild) {
    				aslContainer.removeChild(aslContainer.firstChild);
				}
				aslContainer.appendChild(loadImg);
				outerContainer.style.display = 'block';

			}else{
				loadImg.style.display = 'block';
			}
			// send it to ajax request
			// and do the below on success
			var url = 'http://smartsign.imtc.gatech.edu/videos?keywords='+str;
			var jqxhr = $.ajax(url)
						  .fail(function() {
						    console.log( "error" );
						  }) 
						  .always(function() {
						    //alert( "complete" );
						  })
						  .done(function(response) {
						    console.log(response);
						    var src = 'http://placekitten.com/240/200';
						    var html;
						    
						    if(response.length == 0){
						    	img404 = document.createElement('img');
								img404.setAttribute('id', 'asl-notfound-img');
								img404.setAttribute('src', src);
								while (aslContainer.firstChild) {
    								aslContainer.removeChild(aslContainer.firstChild);
								}
								aslContainer.appendChild(img404);
								outerContainer.style.display = 'block';
						    //chrome.extension.getURL('images/not-found.jpg');
						    }else{
						    	var videoid = response[0]['id'];
						    	src="http://www.youtube.com/embed/"+videoid+"?rel=0&autoplay=1";
						    	html = "<div id='asl-container'><a href='"+src+"'>See More</a>";
								html += "<iframe id='asl-iframe' frameBorder='0' scrolling='"+options.scrolling+"' name='asl-iframe' src='"+src+"'/>"
								html += "</div>	";
								outerContainer.innerHTML = html;
								outerContainer.style.display = 'block';
								options.callback.apply(null,[]);
						    }
						    clearTimeout(showASLTimer);
							showASLTimer = setTimeout(function(){outerContainer.style.display = 'none';}, options.displayTime*1000);
						  });
		}	
	};
	
	return {
		setup: setup,
		options:options
	}

}());
ASL.setup()