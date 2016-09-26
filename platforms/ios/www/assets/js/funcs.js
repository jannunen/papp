var loginCheck = function(data) {
  data = JSON.stringify(data);
  if (data && data.match(/Login.failed/i)) {
    myApp.alert("Session expired");
    //mainView.router.load("#index");
    debugger;
    window.uid = null;
    Cookies.remove("loginok");
    myApp.loginScreen();
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
        },
        error : function(data, status, thrown) {
          debugger;
          console.log("back from jsonp with ERROR "+thrown.message+", url: "+url);
        }
 });
}

