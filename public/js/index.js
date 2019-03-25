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

    $('#reviewType').on('change', function() {
        var selection = $(this).val()
        if(selection == 'Neighborhood Review') {
            $('#neigborhoodFields').show()
            $('#propertyFields').hide()
            $('#ownerFields').hide()
            $('#ownerEmailField').prop('required', false)
            $('#addressField').prop('required', false)
        } else if(selection == 'Owner Review') {
            $('#neigborhoodFields').hide()
            $('#propertyFields').hide()
            $('#ownerFields').show()
            $('#ownerEmailField').prop('required', true)
            $('#addressField').prop('required', false)
        } else {
            $('#neigborhoodFields').hide()
            $('#propertyFields').show()
            $('#ownerFields').hide()
            $('#ownerEmailField').prop('required', false)
            $('#addressField').prop('required', true)

        }
        
        
    })

})