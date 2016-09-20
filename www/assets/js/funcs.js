var loginCheck = function(data) {
  data = JSON.stringify(data);
  if (data && data.match(/Login.failed/i)) {
    myApp.alert("Session expired");
    myApp.loginScreen();
    Cookies.remove("loginok");
  }  else {
    window.uid = 	  Cookies.get("uid");
    $("#userid").val(window.uid);
  }
}
$.jsonp = function(url,_data,callback) {
 $.ajax({
	url : url,
	jsonp : 'callback',
	dataType : 'jsonp',
	data : _data,
	withCredentials : true,
	complete : function(xhr,status) {
          console.log("back from jsonp with status "+status+", url: "+url);
         loginCheck(xhr.responseJSON);
          callback(xhr.responseJSON);
        }
 });
}

