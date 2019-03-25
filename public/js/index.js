$(document).ready(function () {

    function displayMessage() {
        setTimeout(function() {
            $('.loadermessage').fadeIn('slow')
        }, 2000)
    }

    $(window).on('load', function() {
        $('.loader').hide()
        $('.screen').hide()
        $('.loadermessage').css('display', 'none')
        clearTimeout(displayMessage)
    })

    $(window).on('beforeunload', function() {
        $('.loader').show()
        $('.screen').show()
        displayMessage()
    })


})