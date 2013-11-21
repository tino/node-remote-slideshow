
class @Presentation
    constructor: (@socket, @slides_container, options) ->
        @options =
            transition: 'show/hide'
        $.extend @options, options or {}

        @socket.on 'init', (data) =>
            @init data
            console.log "presentation initiated"

        @socket.on 'init presenter', (data) =>
            @init data
            @init_presenter()
            console.log "presenter view initiated"

        @socket.on 'slide to', (data) =>
            @slideTo data.slide_num
            console.log "changed to #{data.slide_num}"

        @presenting = false
        if window.location.hash == '#presenter'
            @socket.emit 'presenter present'
            @presenting = true
        else
            @socket.emit 'viewer present'

        @socket.on 'reload', (data) =>
            console.log 'reload'
            if not @presenting
                window.location.reload()

    init: (data) ->
        for slideName in data.slides
            @slides_container.append "<div class='slide'><img src='#{data.path}/#{slideName}'></div>"
        @slides = @slides_container.find('.slide')
        @slides.hide()
        @controls =
            container: $('#control-bar')
            prev: $('#control-bar').find('.slide-control .prev')
            next: $('#control-bar').find('.slide-control .next')
            current: $('#control-bar').find('.slide-control .current-slide')
            total: $('#control-bar').find('.slide-control .total-slides')
        @controls.total.text @slides.length

        @info =
            container: $ '#info'
            current: $('#info').find('.current-slide')
            total: $('#info').find('.total-slides')
        @info.total.text @slides.length

        @slideTo data.current or 1

        @socket.emit 'init complete', {}

    init_presenter: ->
        @controls.container.removeClass 'hidden'
        @info.container.addClass 'hidden'
        @controls.prev.bind 'click', =>
            @prevSlide()
        @controls.next.bind 'click', =>
            @nextSlide()

    slideTo: (slide_num) ->
        if slide_num is @currentSlide then return

        visibleSlide = @slides.filter ":visible"
        slideToShow = @slides.filter ":nth-child(#{slide_num})"
        @currentSlide = slide_num

        switch @options.transition
            when 'show/hide'
                visibleSlide.hide();
                slideToShow.show();
            when 'slide'
                visibleSlide.slideUp 500, ->
                    slideToShow.slideDown(1000)
            else
                visibleSlide.fadeOut(500);
                slideToShow.fadeIn(500)

        @info.current.text slide_num
        @controls.current.text slide_num
        @controls.prev.removeClass('disabled')
        @controls.next.removeClass('disabled')
        if slide_num == 1
            @controls.prev.addClass('disabled')
        if slide_num == @slides.length
            @controls.next.addClass('disabled')

    nextSlide: ->
        if @currentSlide + 1 > @slides.length then return
        @socket.emit 'slide to', {slide_num: @currentSlide + 1}
        @slideTo(@currentSlide + 1)

    prevSlide: ->
        if @currentSlide - 1 == 0 then return
        @socket.emit 'slide to', {slide_num: @currentSlide - 1}
        @slideTo(@currentSlide - 1)
