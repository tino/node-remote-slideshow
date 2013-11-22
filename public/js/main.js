(function() {
  $(document).ready(function() {
    var slides_container, socket;
    slides_container = $('#slides');
    socket = io.connect(window.location);
    return window.presentation = new Presentation(socket, slides_container);
  });

}).call(this);
