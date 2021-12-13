// // //Carousel
// !function(t){t.fn.bcSwipe=function(e){var n={threshold:50};return e&&t.extend(n,e),this.each(function(){function e(t){1==t.touches.length&&(u=t.touches[0].pageX,c=!0,this.addEventListener("touchmove",i,!1))}function i(e){if(c){var i=e.touches[0].pageX,r=u-i;if(Math.abs(r)>=n.threshold){if(h(),o(t(this)))return;r>0?t(this).carousel("next"):t(this).carousel("prev")}}}function o(t){return t.find(".item.active").length<1}function h(){this.removeEventListener("touchmove",i),u=null,c=!1}var u,c=!1;"ontouchstart"in document.documentElement&&this.addEventListener("touchstart",e,!1)}),this}}(jQuery);

// $('.carousel').bcSwipe({ threshold: 50 });

$(window).on("load",function() {
  $(window).scroll(function() {
    var windowBottom = $(this).scrollTop() + $(this).innerHeight();
    $(".fade").each(function() {
      /* Check the location of each desired element */
      var objectBottom = $(this).offset().top + $(this).outerHeight();
      
      /* If the element is completely within bounds of the window, fade it in */
      if (objectBottom < windowBottom) { //object comes into view (scrolling down)
        if ($(this).css("opacity")==0) {$(this).fadeTo(200,1);}
      } else { //object goes out of view (scrolling up)
        // if ($(this).css("opacity")==1) {$(this).fadeTo(200,0);}
      }
    });
  }).scroll(); //invoke scroll-handler on page-load
});

$(".carousel-inner").css({
	
})

$("box-icon").css({

});
$('.carousel').on('touchstart', function(event){
    const xClick = event.originalEvent.touches[0].pageX;
    $(this).one('touchmove', function(event){
        const xMove = event.originalEvent.touches[0].pageX;
        const sensitivityInPx = 5;

        if( Math.floor(xClick - xMove) > sensitivityInPx ){
            $(this).carousel('next');
        }
        else if( Math.floor(xClick - xMove) < -sensitivityInPx ){
            $(this).carousel('prev');
        }
    });
    $(this).on('touchend', function(){
        $(this).off('touchmove');
    });
});

//.spinner-border

$(document).ready(() => {
  // $("#body").show();
  
    $(".spinner-border").css("display", "none");
  
});

// $(".nav").bcSwipe({threshold: 50});

$('#owl-carousel').owlCarousel({
    loop: true,
    margin: 30,
    dots: true,
    nav: true,
    items: 2,
});


if(!document.querySelector('nav').classList.contains('show-menu')){
  $(".vision_mission").css("margin-left", "20px");
}