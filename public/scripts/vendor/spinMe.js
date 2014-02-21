

var spinMe = function(element,color,size){

    if(element.get(0).tagName.toLowerCase() === "button"){
        var loading_spinner_opts = {
            lines: 7, // The number of lines to draw
            length: 3, // The length of each line
            width: 3, // The line thickness
            radius: 4, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            color: color || '#fff', // #rgb or #rrggbb
            speed: 1, // Rounds per second
            trail: 46, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '-10', // Top position relative to parent in px
            left: 'auto' // Left position relative to parent in px
        };

        var width = element.width();
        var height = element.height();
        var text = element.html();
        element.html('');
        element.attr('disabled','disabled');
        element.width(width);
        element.height(height);

        var spinner = new Spinner(loading_spinner_opts).spin(element.get(0));

        return function(){
            spinner.stop();
            element.html(text);
            element.removeAttr('disabled');
            element.removeAttr('style');
        }

    }else if(element.get(0).tagName.toLowerCase() === "input"){
        var loading_spinner_opts = {
            lines: 7, // The number of lines to draw
            length: 3, // The length of each line
            width: 3, // The line thickness
            radius: 4, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            color: color || '#000', // #rgb or #rrggbb
            speed: 1, // Rounds per second
            trail: 46, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '-10', // Top position relative to parent in px
            left: 'auto' // Left position relative to parent in px
        };

        var spinner = new Spinner(loading_spinner_opts).spin();
        var $spinner = $(spinner.el);

        $spinner.css('top','-5px');
        $spinner.css('right','19px');
        $spinner.css('display','inline-block');

        element.after($spinner);

        return function(){
            spinner.stop();
        }

    }else if(element.get(0).tagName.toLowerCase() === "div"){

        var loading_spinner_opts = {
            lines: 7, // The number of lines to draw
            length: 3*size, // The length of each line
            width: 3*size, // The line thickness
            radius: 4*size, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            color: color || '#000', // #rgb or #rrggbb
            speed: 1, // Rounds per second
            trail: 46, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '-10', // Top position relative to parent in px
            left: 'auto' // Left position relative to parent in px
        };

        var spinner = new Spinner(loading_spinner_opts).spin();
        var $spinner = $(spinner.el);

        $spinner.css('top','-5px');
        $spinner.css('right','19px');
        $spinner.css('display','inline-block');

        element.after($spinner);

        return function(){
            spinner.stop();
        }

    }

}