$(function(){

    $("#startDate").datepicker('setDate', '-1M');  // 1달전
    $("#endDate").datepicker('setDate', 'today');
	
	//현황판 영역
	var window_w = $(window).width();
	var window_h = $(window).height();
	var map_h  = 	  window_h - 120;

	if(window_w > 1680){//mobile
			$('.center_area').css('height',map_h);	
	} else if(window_w < 1680){//mobile
			$('.center_area').css('height','100vh');
	}


    // draggable
    if($('.modal').length >= 1){
		$( ".modal" ).draggable({ 
			handle: ".modal-header",
			containment: "#wrap", 
			scroll: false,
			drag: function( event, ui ) {
				var mWidth = $(this).outerWidth() / 2;
				var mHeight = $(this).outerHeight() / 2;
				
				ui.position.left = ui.position.left + mWidth;
				ui.position.top = ui.position.top + mHeight;
			},
		});
    }


    // datepicker
    if($('.form-datepicker').length >= 1){
        $('.form-datepicker').datepicker({
            format: "yyyy년mm월dd일",
            language: "ko",
            autoclose: true,
            todayHighlight: true,
            orientation: "auto",
        // }).datepicker("setDate", new Date(1985,10,01)); // 날짜셋팅
        }).datepicker("setDate",'now'); // 오늘날짜
    }
    
});

$(window).resize(function () {

	//현황판 영역
	var window_w = $(window).width();
	var window_h = $(window).height();
	var map_h  = 	  window_h - 120;
	
			if(window_w > 1680){//mobile
					$(".customer_area .inner_customer").css("display", "block");
					$(".customer_area ").css("width", "370px");
					$(".center_area").css("width", "calc(100% - 740px)");
					$(".event_area .inner_event").css("display", "block");
					$(".event_area ").css("width", "370px");

					$('.center_area').css('height',map_h);

			} else if(window_w < 1680){//mobile
					$(".customer_area .inner_customer").css("display", "none");
					$(".customer_area ").css("width", "0");
					$(".center_area").css("width", "100%");
					$(".event_area .inner_event").css("display", "none");
					$(".event_area ").css("width", "0");

					$('.center_area').css('height','100vh');
			}

});		

//음성안내 열고 닫기
function dateTableView(viewbtn,viewdiv){

		var moWidth  = window.innerWidth;

		if($("."+viewdiv).is(":visible")){ 
			$("."+viewdiv).css("display", "none");
			$("."+viewdiv).removeClass("active");
		}else{ 

			if( moWidth < 820 ){
				   $("."+viewdiv).css("display", "flex");
			}else{
				 $("."+viewdiv).css("display", "table-row");
			}
			$("."+viewdiv).addClass("active");

		}

}

//검색열고닫기
function hideSearch(){

	if($(".search_area").is(":visible")){ 
		$(".search_area").css("display", "none");
		$(".search_close span").text("검색열기");
		$(".search_close i").attr("class","ti-angle-down");

	}else{ 
		$(".search_area").css("display", "block");
		$(".search_close span").text("검색닫기");
		$(".search_close i").attr("class","ti-angle-up");

	}

}

//고객열고 닫기
function hideCustomer(center){
	var window_w = $(window).width();

	if($(".customer_area .inner_customer").is(":visible")){ 
		$(".customer_area .inner_customer").css("display", "none");
		$(".customer_area ").css("width", "0");
		$(".center_area").css("width", "100%");
		$(".customer_button span").text("열기");
		$(".customer_button i").attr("class","ti-angle-right");

	}else{ 
			if(window_w < 1680){//mobile
					$(".event_area .inner_event").css("display", "none");
					$(".event_area ").css("width", "0");
			}
		$(".customer_area .inner_customer").css("display", "block");
		$(".customer_area ").css("width", "370px");
		$(".center_area").css("width", "calc(100% - 370px)");
		$(".customer_button span").text("닫기");
		$(".customer_button i").attr("class","ti-angle-left");

	}

}



//이벤트열고 닫기
function hideEvent(center){
	var window_w = $(window).width();
	if($(".event_area .inner_event").is(":visible")){ 
		$(".event_area .inner_event").css("display", "none");
		$(".event_area ").css("width", "0");
		$(".center_area").css("width", "100%");
		$(".event_button span").text("열기");
		$(".event_button i").attr("class","ti-angle-left");
	}else{ 
			if(window_w < 1680){//mobile
					$(".customer_area .inner_customer").css("display", "none");
					$(".customer_area ").css("width", "0");

			}
		$(".event_area .inner_event").css("display", "block");
		$(".event_area ").css("width", "370px");
		$(".center_area").css("width", "calc(100% - 370px)");
		$(".event_button span").text("닫기");
		$(".event_button i").attr("class","ti-angle-right");
	}

}


//경고창 닫기
function warning_close (item){
	
	$('.'+item).css('display','none');


}


