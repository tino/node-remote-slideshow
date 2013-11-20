$(document).ready ->
    slides_container = $('#slides')
    socket = io.connect window.location
    window.presentation = new Presentation socket, slides_container
