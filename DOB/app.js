(function($) {
    "use strict";
    $.fn.sliderResponsive = function(settings) {
  
      var set = $.extend(
        {
          slidePause: 5000,
          fadeSpeed: 1000,
          autoPlay: "on",
          showArrows: "off",
          hideDots: "off",
          hoverZoom: "on",
          titleBarTop: "off"
        },
        settings
      );
  
      var $slider = $(this);
      var size = $slider.find("> div").length; //number of slides
      var position = 0; // current position of carousal
      var sliderIntervalID; // used to clear autoplay
  
      // Add a Dot for each slide
      $slider.append("<ul></ul>");
      $slider.find("> div").each(function(){
        $slider.find("> ul").append('<li></li>');
      });
  
      // Put .show on the first Slide
      $slider.find("div:first-of-type").addClass("show");
  
      // Put .showLi on the first dot
      $slider.find("li:first-of-type").addClass("showli")
  
       //fadeout all items except .show
      $slider.find("> div").not(".show").fadeOut();
  
      // If Autoplay is set to 'on' than start it
      if (set.autoPlay === "on") {
          startSlider();
      }
  
      // If showarrows is set to 'on' then don't hide them
      if (set.showArrows === "on") {
          $slider.addClass('showArrows');
      }
  
      // If hideDots is set to 'on' then hide them
      if (set.hideDots === "on") {
          $slider.addClass('hideDots');
      }
  
      // If hoverZoom is set to 'off' then stop it
      if (set.hoverZoom === "off") {
          $slider.addClass('hoverZoomOff');
      }
  
      // If titleBarTop is set to 'on' then move it up
      if (set.titleBarTop === "on") {
          $slider.addClass('titleBarTop');
      }
  
      // function to start auto play
      function startSlider() {
        sliderIntervalID = setInterval(function() {
          nextSlide();
        }, set.slidePause);
      }
  
      // on mouseover stop the autoplay
      $slider.mouseover(function() {
        if (set.autoPlay === "on") {
          clearInterval(sliderIntervalID);
        }
      });
  
      // on mouseout starts the autoplay
      $slider.mouseout(function() {
        if (set.autoPlay === "on") {
          startSlider();
        }
      });
  
      //on right arrow click
      $slider.find("> .right").click(nextSlide)
  
      //on left arrow click
      $slider.find("> .left").click(prevSlide);
  
      // Go to next slide
      function nextSlide() {
        position = $slider.find(".show").index() + 1;
        if (position > size - 1) position = 0;
        changeCarousel(position);
      }
  
      // Go to previous slide
      function prevSlide() {
        position = $slider.find(".show").index() - 1;
        if (position < 0) position = size - 1;
        changeCarousel(position);
      }
  
      //when user clicks slider button
      $slider.find(" > ul > li").click(function() {
        position = $(this).index();
        changeCarousel($(this).index());
      });
  
      //this changes the image and button selection
      function changeCarousel() {
        $slider.find(".show").removeClass("show").fadeOut();
        $slider
          .find("> div")
          .eq(position)
          .fadeIn(set.fadeSpeed)
          .addClass("show");
        // The Dots
        $slider.find("> ul").find(".showli").removeClass("showli");
        $slider.find("> ul > li").eq(position).addClass("showli");
      }
  
      return $slider;
    };
  })(jQuery);
  



  //Multiple Carosal
  $(document).ready(function () {
    var itemsMainDiv = ('.MultiCarousel');
    var itemsDiv = ('.MultiCarousel-inner');
    var itemWidth = "";

    $('.leftLst, .rightLst').click(function () {
        var condition = $(this).hasClass("leftLst");
        if (condition)
            click(0, this);
        else
            click(1, this)
    });

    ResCarouselSize();

    $(window).resize(function () {
        ResCarouselSize();
    });

    //this function define the size of the items
    function ResCarouselSize() {
        var incno = 0;
        var dataItems = ("data-items");
        var itemClass = ('.item');
        var id = 0;
        var btnParentSb = '';
        var itemsSplit = '';
        var sampwidth = $(itemsMainDiv).width();
        var bodyWidth = $('body').width();
        $(itemsDiv).each(function () {
            id = id + 1;
            var itemNumbers = $(this).find(itemClass).length;
            btnParentSb = $(this).parent().attr(dataItems);
            itemsSplit = btnParentSb.split(',');
            $(this).parent().attr("id", "MultiCarousel" + id);


            if (bodyWidth >= 1200) {
                incno = itemsSplit[3];
                itemWidth = sampwidth / incno;
            }
            else if (bodyWidth >= 992) {
                incno = itemsSplit[2];
                itemWidth = sampwidth / incno;
            }
            else if (bodyWidth >= 768) {
                incno = itemsSplit[1];
                itemWidth = sampwidth / incno;
            }
            else {
                incno = itemsSplit[0];
                itemWidth = sampwidth / incno;
            }
            $(this).css({ 'transform': 'translateX(0px)', 'width': itemWidth * itemNumbers });
            $(this).find(itemClass).each(function () {
                $(this).outerWidth(itemWidth);
            });

            $(".leftLst").addClass("over");
            $(".rightLst").removeClass("over");

        });
    }


    //this function used to move the items
    function ResCarousel(e, el, s) {
        var leftBtn = ('.leftLst');
        var rightBtn = ('.rightLst');
        var translateXval = '';
        var divStyle = $(el + ' ' + itemsDiv).css('transform');
        var values = divStyle.match(/-?[\d\.]+/g);
        var xds = Math.abs(values[4]);
        if (e == 0) {
            translateXval = parseInt(xds) - parseInt(itemWidth * s);
            $(el + ' ' + rightBtn).removeClass("over");

            if (translateXval <= itemWidth / 2) {
                translateXval = 0;
                $(el + ' ' + leftBtn).addClass("over");
            }
        }
        else if (e == 1) {
            var itemsCondition = $(el).find(itemsDiv).width() - $(el).width();
            translateXval = parseInt(xds) + parseInt(itemWidth * s);
            $(el + ' ' + leftBtn).removeClass("over");

            if (translateXval >= itemsCondition - itemWidth / 2) {
                translateXval = itemsCondition;
                $(el + ' ' + rightBtn).addClass("over");
            }
        }
        $(el + ' ' + itemsDiv).css('transform', 'translateX(' + -translateXval + 'px)');
    }

    //It is used to get some elements from btn
    function click(ell, ee) {
        var Parent = "#" + $(ee).parent().attr("id");
        var slide = $(Parent).attr("data-slide");
        ResCarousel(ell, Parent, slide);
    }

});


