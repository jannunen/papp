var chartsInitialized = false;
var tickListContent = "";
var ascent_types = {
  0: "Lead",
  1: "Top rope",
  2: "Automatic belay"
}
jQuery.browser = {};
(function () {
  jQuery.browser.msie = false;
  jQuery.browser.version = 0;
  if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
    jQuery.browser.msie = true;
    jQuery.browser.version = RegExp.$1;
  }
})();


var reloadStuffAfterTickChange = function() {
  // Remove the modal after 5 secs
  /*
  setTimeout(function() {
    myApp.closeModal();
  },3000);
  */
  // Reload dashboard chart
  var url = "/t/problematormobile/json_running6mo_both/?userid="+$("#userid").val();
  $.get(url,{},function(_data) {
    dashboardLineChart.setData(_data);	
  });
  var barurl = "/t/problematormobile/json_running6mogradebars_both/";
  $.get(barurl,{},function(back) {
    dashboardBarChart.setData(back);
  });
  // Refresh ticks today page

  $("#tickstodaylistcontainer").load("/t/problematormobile/_tickstoday/",function(back) {
    console.log("Tickstodaylist reloaded");
  });

  // Reload the dashboard's tick info
  $("#dash_climbinfo").load("/t/problematormobile/_dash_climbinfo/");

}

$(document).ready(function() {
$( document ).ajaxSuccess(function( event, xhr, settings ) {
  if (xhr && xhr.responseText && xhr.responseText.match(/Login.failed/i)) {
    myApp.alert("Session expired");
    myApp.loginScreen();
  }
})
  $(document).on('click','.del_betavideo', function () {
     var url = $(this).attr("data-href"); 
     $.post(url,{},function(back) {
       myApp.alert(back);
       // Close the action sheet also
       myApp.closeModal();
       mainView.router.refreshPage();
     }); 
     return false;
  });
 //- One group, title, three buttons
  $(document).on('click','.open_betavideos_actionsheet', function () {
    var _pid = $(this).attr("pid");
    $.getJSON("/t/problematormobile/_betavideos/",{pid : _pid},function(betavideos) {

      var buttons = [
        {
          text: 'Choose a betavideo',
          label: true
        },
      ];
      // ADd videos
      for (var idx in betavideos) {
        var v = betavideos[idx];
        var txt = '<a href="'+v.video_url+'" class="external">'+v.video_url+'</a>';
        if (v.userid == $("#userid").val()) {
          txt += '&nbsp; <a class="del_betavideo" href="#" data-href="/t/problematormobile/del_betavideo/?vid='+v.id+'">del</a>';
        }

        buttons.push({
          text : txt,
          label : true,
        }); 
      }

      // Add cancel
      buttons.push({
        text: 'Cancel',
        color: 'yellow'
      });

      myApp.actions(buttons);
    });
    return false;
  }); 
  $(document).on("click",".add_video",function() {
    var pid = $(this).attr("pid");
      myApp.prompt('Paste video url here. Note that you can link video starting from a certain point.<br /><br /><strong>Vimeo:</strong> Click share, click Link and add timecode if needed.<br /><br /><strong>Youtube:</strong> Right click and "Copy video at URL" or "Copy video URL at current time"','Add a betavideo', function (value) {
        var url = "/t/problematormobile/savebetavideo/";
        $.post(url,{"url" : value, "problemid":pid},function(back) {
          myApp.alert(back,"All is golden");
          mainView.router.refreshPage();
        });
      });
     return false;
  });

  $(document).on("click",".openfloorplan",function() {
    var gymid = $("#gymid").val();
     var myPhotoBrowser = myApp.photoBrowser({
       backLinkText : '',
       toolbar : false,
           zoom: true,
               photos: ['/problemator/assets/images/floorplans/floorplan_'+gymid+'.png']
     });   
     myPhotoBrowser.open(); // open photo browser
     return false;
  });
  // SHow global ascents
  $(document).on("click",".show_global_ascents",function(e) {
    var clickedLink = this;
    var pid = $(this).data("id");
    var url = window.api.apicallbase + "_popover_show_global_ascents/?pid="+pid;
    $.get(url,{pid : pid},function(back) {
      myApp.popover(back, clickedLink);

    });
  });

  $(document).on("click",".activatecalendar",function() {
    // Open calendar
    var date = $("#tstamp").val();
    var arr = date.split("-");
    var tickDate = new Date(arr[0],arr[1]-1,arr[2]);

    var calendarDateFormat = myApp.calendar({
      value : [tickDate],
      input: '#tstamp',
      closeOnSelect : true,
      onDayClick : function(p, dayContainer, year, month, day) {
        var given = this.value.pop();

        if (!isNaN(given.getDate())) {
          var show = ("0"+day).slice(-2)+"."+("0"+(parseInt(month)+1)).slice(-2)+"."+year;
          console.log(show);
          $(".curdate").html(show);
        }

      },
      dateFormat: 'yyyy-mm-dd'
    }).open();    
  });

  $(document).on("click",".savetickchange",function() {
    tickSaved = true; // Save global tickSaved state
    
    var data = $(this).parents(".edit_tick").serializeArray();
    // First, disable this button...
    $(this).attr("disabled","disabled");
    var self = $(this);
    var tid = $(this).attr("data-id");
    var url =$(this).parents(".edit_tick").attr("action");
    data.push({name : "id", value : tid});

    $.post(url,data,function(back) {
      console.log(back);
      myApp.alert(back,"Tick changed");
      self.removeAttr("disabled");
      mainView.router.refreshPage();
    });
    return false;
  });

  $(document).on("click",".savetick",function() {
    // First, disable this button...
    tickSaved = true; // Save global tickSaved state
    $(this).attr("disabled","disabled");
    var pid = $(this).data("id");
    
    saveTickFunction(this,"savetick",function(back,opt) {
      if (back.match(/error/i)) {
        document.location.href="/index.html";
        return;
      }
      /*
      myApp.addNotification({
        title: 'Info',
        message: 'Tick saved',
        hold : 4000
      });
      */
      $(this).removeAttr("disabled");
      reloadStuffAfterTickChange();
      mainView.router.refreshPage();
      $("h5[problemid="+pid+"]").removeClass("white").addClass("text-y");
      if ($("#swipe"+pid+" .item-title span.fa-check").length == 0) {
        $("#swipe"+pid+" .item-title").append('<span class="fa fa-check problemator-link"></span>');
      }
      mainView.router.back();      
    });
    return false;
  });

  $(document).on("blur","#email",function() {
    var email = $(this).val();
    var after = $(this).parent().parent().find(".item-after");
    // Check first if valid email
    if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
      after.empty().append('<span class="fa fa-times theme-red"> </span><span> invalid</span>');
      return false;
    }
    $.get("/t/problematormobile/emailcheck/",{email: email},function(back) {
      if (back.match(/reserved/i))  {
        after.empty().append('<span class="fa fa-times theme-red"> </span><span> used</span>');
      } else {
        after.empty().append('<span class="fa fa-check theme-green"> </span><span> ok</span>');
      }
    });
  });

  $(document).on("click",".spinnerminus",function() {
    var cur = parseInt($(this).siblings("input").val());
    cur--;
    if (cur <= 0) {
      cur = 1;
    }
    $(this).siblings("input").val(cur);
  });
  $(document).on("click",".spinnerplus",function() {
    var cur = parseInt($(this).siblings("input").val());
    cur++;
    $(this).siblings("input").val(cur);
  });

  $(document).on("click","#btn_savesettings",function() {
    $("#frmsettings").ajaxSubmit(function(back) {
      myApp.alert(back, 'Info');

    });
    return false;
  });

  $(document).on("click",".swipe_edit_date",function(el) {
    $(this).attr("disabled","disabled");
    var dateStr = $(this).data("tickdate");
    console.log("not implemented");				
    var myCalendar = app.calendar({
      value : new Date(y,m,d),
    });   
    // Show edit date dialog
  });

  $(document).on("click",".swipeuntick",function(el) {
    var gymid = $("#location").val();

    $(this).attr("disabled","disabled");
    var self = this;
    var tag = $(this).attr("data-tag");
    var tickid = $(this).attr("data-tickid");
    var parentli = $(el.target).parents("li");

    $.post("/t/problematormobile/untick/",{"tickid" : tickid,'userid' : $("#userid").val(),gymid : gymid},function(back) {
      reloadStuffAfterTickChange();
      myApp.swipeoutClose(parentli); 
      $("h5[tag="+tag+"]").removeClass("text-y").addClass("white");
      $(self).removeAttr("disabled");
    });
  });
  // Untick from single problem
  $(document).on("click",".untick",function(e) {
    var tickid = $(this).attr("data-id");
    var from = $(this).attr("data-from");
    var self = this;
    $(this).attr("disabled","disabled");
    var gymid = $("#location").val();
    var pid = $(this).data("pid");
    myApp.confirm('Really untick this problem?', function () {
      $.post("/t/problematormobile/untick/",{"tickid" : tickid,'pid' : pid,'userid' : $("#userid").val(),gymid : gymid},function(back) {
        $(self).removeAttr("disabled");
        /*
        myApp.addNotification({
          title: 'Info',
          message: 'Problem unticked',
          hold : 3000
        });
        */

        if (from == "manageticks") {
          // IF coming from manage ticks from a single problem view.
          myApp.closeModal();
          mainView.router.refreshPage();
        } else {
          mainView.router.refreshPage()
          reloadStuffAfterTickChange();
        }

        $("h5[problemid="+pid+"]").removeClass("text-y").addClass("white");
        $("#swipe"+pid+" .item-title").find(".fa-check").remove();
        mainView.router.back();      
      });
    },function() {
        $(self).removeAttr("disabled");
    });
    return false;
  });
                

 // Untick from single problem
   $(document).on("click",".manageticks",function(e) {
     var self = this;
     var pid = $(this).data("pid");
     $.getJSON("/t/problematormobile/_userticks/",{pid : pid},function(ticks) {

       var buttons = [
         {
           text: 'Tick(s) for the problem',
           label: true
         },
       ];
       // ADd ticks
       var now = moment();
       for (var idx in ticks) {
         var t = ticks[idx];
         var mt = moment(t.tstamp);
         var txt = "<span class='text-w'>";
         if (t.routetype == 'sport') {
           txt += ascent_types[t.ascent_type] + " ";
         }
         //txt += mt.from(now)+" with "+t.tries+" tries ";
         txt += mt.format("DD.MM.YYYY")+" with "+t.tries+" tries ";
         txt += '&nbsp; </span><a data-from="manageticks" class="untick" data-id="'+t.id+'" pid="'+t.problemid+'" href="#" ><span class="fa fa-times"></span></a>';

         buttons.push({
           text : txt,
           label : true,
         });
       }

       // Add cancel
       buttons.push({
         text: 'Cancel',
         color: 'yellow'
       });

       myApp.actions(buttons);
     });
     return false;

   });

  $(document).on("click",".swipetick",function(el) {
    $(this).attr("disabled","disabled");
    var self = this;
    var gymid = $("#location").val();
    var tag = $(this).attr("data-tag");
    var pid = $(this).data("pid");
    var parentli = $(el.target).parents("li");
    $.post("/t/problematormobile/savetick/",{"problemid" : pid,'userid' : $("#userid").val(),gymid : gymid},function(back) {
      reloadStuffAfterTickChange();
      myApp.swipeoutClose(parentli); 
      $("h5[tag="+tag+"]").removeClass("white").addClass("text-y");
      $("#swipe"+pid+" .item-title").append('<span class="fa fa-check problemator-link"></span>');
      $(self).removeAttr("disabled");
    });

  });


  $(document).on("click","#quicktick",function() {
    $(this).attr("disabled","disabled");
    var self = this;
    var gymid = $("#location").val();

    var probs = $("#quickproblems").val();
    $.post("/t/problematormobile/saveticks/",{"ticks" : probs,'userid' : $("#userid").val(),gymid : gymid},function(back) {
      myApp.alert(back,"Info");
      reloadStuffAfterTickChange();
      mainView.router.refreshPage();
      $(self).removeAttr("disabled");
    });
  });
  $(document).on("click","#quicktick2",function() {
    $(this).attr("disabled","disabled");
    var gymid = $("#location").val();

    var self = this;
    var probs = $("#quickproblems2").val();
    $.post("/t/problematormobile/saveticks/",{"ticks" : probs,'userid' : $("#userid").val(),gymid : gymid},function(back) {
      myApp.alert(back,"Info");
      reloadStuffAfterTickChange();
      $(self).removeAttr("disabled");
    });
  });

  $(document).on("click","#savesettings",function() {
    $(this).parents("form").ajaxSubmit(function(back) {
      alert(back);
    });
  });
  $(document).on("submit",".sendemail",function() {
    $(this).ajaxSubmit(function(back) {
      $("#sendemail").popup("close");
      alert(back);
    });
    return false;
  });
  $(document).on("click",".tryplus",function() {
    var pid = $(this).attr("data-pid");
    var tries = parseInt($("#tries"+pid).val());
    tries++;
    $("#tries"+pid).val(tries);
    return false;
  });
  $(document).on("click",".tryminus",function() {
    var pid = $(this).attr("data-pid");
    var tries = parseInt($("#tries"+pid).val());
    tries--;
    if (tries < 0) {
      tries = 0;
    }
    $("#tries"+pid).val(tries);
    return false;
  });
  $(document).on("change","#ranking_location",function() {
    // Change ranking gym

    $elem = myApp.alert(  'This calculation might take some while, have patience! =)', 'Calculating ranks...');

    var gymid = $("#ranking_location option:selected").map(function() { return $(this).val(); }).get().join(",");

    var boulderdone = false;
    var sportdone = false;
    //console.log("Gymid "+gymid);
    $("#list_ranking_boulder").load("/t/problematormobile/_ranking_boulder/?gymid="+gymid,function() {
    });
    $("#list_ranking_sport").load("/t/problematormobile/_ranking_sport/?gymid="+gymid,function() {
    });


  });
  // WHen user clicks the location from the gyminfo page.
  $(document).on("change","#newloc",function() {
    var newloc  = $("#newloc").val();
myApp.alert("todo");
    document.location.href="/t/problematormobile/index/"+newloc+"/";
  });
  $(document).on("click",".changelocation",function() { 
myApp.alert("todo");
    var newloc  = $("#newloc").val();
    document.location.href="/t/problematormobile/index/"+newloc+"/";
  });
});
$(document).on("pagecreate","#friends",function() {

  $(document).on("click",".reloadclimbersnear",function(e) {
    reloadClimbersNear();
  });

  $(document).on("click",".refresh_friendrequestsreceived",function(e) {
    reloadFriendRequestsReceived();
  });


  $("li a.friendreq").on("click",function(e) {
    e.preventDefault();
    var id = $(this).attr("data-userid");
    var href =	$("#confirmaddfriendrequest").find(".makefriendrequest").attr("href");
    href += id;
    $("#confirmaddfriendrequest").find(".makefriendrequest").attr("href",href);
    $("#confirmaddfriendrequest").popup("open");
  });

  $("li a.confirm_acceptfriendrequest").on("click",function(e) {
    e.preventDefault();
    var id = $(this).attr("data-target");
    var href = $("#acceptfriend").find(".acceptfriendrequest").attr("href");
    href += id;
    $("#acceptfriend").find(".acceptfriendrequest").attr("href",href);
    $("#acceptfriend").popup("open");

  });
  $(document).on("click",".acceptfriendrequest",function(e) {
    // Create friend request and show a popup that action was done
    var url = $(this).attr("href");
    $.get(url,function() {
      $("#popup_friendrequest_accepted").popup("open");
      // Reload friend list...
      reloadFriendList();
    });
  });

  $(document).on("click",".makefriendrequest",function() {
    // Create friend request and show a popup that action was done
    var url = $(this).attr("href");
    $.get(url,function() {
      $("#friendrequestdone").popup("open");
      // Reload requests sent list
      reloadFriendRequestsSent();
    });
  });
  // Set timeouts to automatically refresh requests and climbers nearby...
  var reloadLists = function() {
    reloadClimbersNear();
    reloadFriendRequestsReceived();

    setTimeout(reloadLists,listTimeout);
  }
  var listTimeout = 60*1000;
  setTimeout(reloadLists,listTimeout);
});
$(document).on("pagecreate","#map",function() {
  $("#karttaimg").width($(window).width()-10);
});
$(document).on("pageshow","#charts",function() {
  if (!chartsInitialized) {
    chartsInitialized = true;
    $('.sparkpie').sparkline('html', { type: 'pie', height: '1.0em' });

    var grades = [];
    grades["0"] = "0";
    grades["500"] = "1";
    grades["1000"] = "2";
    grades["1500"] = "3+";
    grades["2000"] = "4";
    grades["2500"] = "4+";
    grades["3000"] = "5";
    grades["3500"] = "5+";
    grades["4000"] = "6a";
    grades["4500"] = "6a+";
    grades["5000"] = "6b";
    grades["5500"] = "6b+";
    grades["6000"] = "6c";
    grades["6500"] = "6c+";
    grades["7000"] = "7a";
    grades["7500"] = "7a+";
    grades["8000"] = "7b";
    grades["8500"] = "7b+";
    grades["9000"] = "7c";
    grades["9500"] = "7c+";
    grades["10000"] = "8a";
    grades["10500"] = "8a+";
    grades["11000"] = "8b";
    grades["11500"] = "8b+";
    grades["12000"] = "8c";
    grades["12500"] = "8c+";
    grades["13000"] = "9a";

    var url = "/t/problematormobile/json_running6mo/?userid="+$("#userid").val();
    $.get(url,{},function(_data) {
      Morris.Line({
        element: 'running6mo',
        data: _data,
        xkey: 'y',
        hideHover : 'always',
        yLabelFormat : function (x) { 
          // ROund to nearest 500
          var near = Math.round(x/500)*500;
          return grades[near];
        },
        ykeys: ['a'],
        labels: ['Top10']
      });
    });
    var url = "/t/problematormobile/json_running6mo/?userid="+$("#userid").val()+"&routetype=sport";
    $.get(url,{},function(_data) {
      Morris.Line({
        element: 'running6mosport',
        data: _data,
        xkey: 'y',
        hideHover : 'always',
        yLabelFormat : function (x) { 
          // ROund to nearest 500
          var near = Math.round(x/500)*500;
          return grades[near];
        },
        ykeys: ['a'],
        labels: ['Top10']
      });
    });
    var url = "/t/problematormobile/json_bestyears/?userid="+$("#userid").val();
    $.get(url,{},function(_data) {
      Morris.Line({
        element: 'bestyears',
        data: _data,
        xkey: 'year',
        xLabelFormat : function (x) { 
          return x.getFullYear();
        },

        yLabelFormat : function (x) { 
          // ROund to nearest 500
          var near = Math.round(x/500)*500;
          return grades[near];
        },
        ykeys: ['a'],
        labels: ['Top10']
      });
    });
    var url = "/t/problematormobile/json_bestyears/?userid="+$("#userid").val()+"&routetype=sport";
    $.get(url,{},function(_data) {
      Morris.Line({
        element: 'bestyearssport',
        data: _data,
        xkey: 'year',
        xLabelFormat : function (x) { 
          return x.getFullYear();
        },

        yLabelFormat : function (x) { 
          // ROund to nearest 500
          var near = Math.round(x/500)*500;
          return grades[near];
        },
        ykeys: ['a'],
        labels: ['Top10']
      });
    });
  }
});
$(document).on("pagecreate", "#mainpage", function(){


  $("#problemlist").listview({
    autodividers: true,
    autodividersSelector: function (li) {
      var out = li.attr("wall");
      return out;
    }
  }).listview("refresh");

});

