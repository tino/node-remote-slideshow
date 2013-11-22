(function() {
  this.Presentation = (function() {
    function Presentation(socket, slides_container, options) {
      var _this = this;
      this.socket = socket;
      this.slides_container = slides_container;
      this.options = {
        transition: 'show/hide'
      };
      $.extend(this.options, options || {});
      this.socket.on('init', function(data) {
        _this.init(data);
        return console.log("presentation initiated");
      });
      this.socket.on('init presenter', function(data) {
        _this.init(data);
        _this.init_presenter();
        return console.log("presenter view initiated");
      });
      this.socket.on('slide to', function(data) {
        _this.slideTo(data.slide_num);
        return console.log("changed to " + data.slide_num);
      });
      this.presenting = false;
      if (window.location.hash === '#presenter') {
        this.socket.emit('presenter present');
        this.presenting = true;
      } else {
        this.socket.emit('viewer present');
      }
      this.socket.on('reload', function(data) {
        console.log('reload');
        if (!_this.presenting) {
          return window.location.reload();
        }
      });
    }

    Presentation.prototype.init = function(data) {
      var slideName, _i, _len, _ref;
      _ref = data.slides;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        slideName = _ref[_i];
        this.slides_container.append("<div class='slide'><img src='" + data.path + "/" + slideName + "'></div>");
      }
      this.slides = this.slides_container.find('.slide');
      this.slides.hide();
      this.controls = {
        container: $('#control-bar'),
        prev: $('#control-bar').find('.slide-control .prev'),
        next: $('#control-bar').find('.slide-control .next'),
        current: $('#control-bar').find('.slide-control .current-slide'),
        total: $('#control-bar').find('.slide-control .total-slides')
      };
      this.controls.total.text(this.slides.length);
      this.info = {
        container: $('#info'),
        current: $('#info').find('.current-slide'),
        total: $('#info').find('.total-slides')
      };
      this.info.total.text(this.slides.length);
      this.slideTo(data.current || 1);
      return this.socket.emit('init complete', {});
    };

    Presentation.prototype.init_presenter = function() {
      var _this = this;
      this.controls.container.removeClass('hidden');
      this.info.container.addClass('hidden');
      this.controls.prev.bind('click', function() {
        return _this.prevSlide();
      });
      return this.controls.next.bind('click', function() {
        return _this.nextSlide();
      });
    };

    Presentation.prototype.slideTo = function(slide_num) {
      var slideToShow, visibleSlide;
      if (slide_num === this.currentSlide) {
        return;
      }
      visibleSlide = this.slides.filter(":visible");
      slideToShow = this.slides.filter(":nth-child(" + slide_num + ")");
      this.currentSlide = slide_num;
      switch (this.options.transition) {
        case 'show/hide':
          visibleSlide.hide();
          slideToShow.show();
          break;
        case 'slide':
          visibleSlide.slideUp(500, function() {
            return slideToShow.slideDown(1000);
          });
          break;
        default:
          visibleSlide.fadeOut(500);
          slideToShow.fadeIn(500);
      }
      this.info.current.text(slide_num);
      this.controls.current.text(slide_num);
      this.controls.prev.removeClass('disabled');
      this.controls.next.removeClass('disabled');
      if (slide_num === 1) {
        this.controls.prev.addClass('disabled');
      }
      if (slide_num === this.slides.length) {
        return this.controls.next.addClass('disabled');
      }
    };

    Presentation.prototype.nextSlide = function() {
      if (this.currentSlide + 1 > this.slides.length) {
        return;
      }
      this.socket.emit('slide to', {
        slide_num: this.currentSlide + 1
      });
      return this.slideTo(this.currentSlide + 1);
    };

    Presentation.prototype.prevSlide = function() {
      if (this.currentSlide - 1 === 0) {
        return;
      }
      this.socket.emit('slide to', {
        slide_num: this.currentSlide - 1
      });
      return this.slideTo(this.currentSlide - 1);
    };

    return Presentation;

  })();

}).call(this);
