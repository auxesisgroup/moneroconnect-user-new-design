// Modal on dashboard page Load
// $(document).ready(function() {
//   $('#successModal').modal('show');
// });
$(document).ready(function () {
    $('.next').click(function () {
        var nextId = $(this).parents('.tab-pane').next().attr("id");
        $('[href=#' + nextId + ']').tab('show');
        return false;
    })
    $('button[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        //update progress
        var step = $(e.target).data('step');
        var percent = (parseInt(step) / 2) * 100;
        $('.progress-bar').css({
            width: percent + '%'
        });
        $('.progress-bar').text("Step " + step + " of 2");
        //e.relatedTarget // previous tab
    })
    $('.first').click(function () {
        $('#myWizard a:first').tab('show')
    })
});


//Form disable button

//RegisterForm
$(document).ready(function () {
    $('#registerForm > .form-group > input').keyup(function () {
        var empty1 = false;
        $('#registerForm > .form-group > input').each(function () {
            if ($(this).val() === '') {
                empty1 = true;
            }
        });
        if (empty1) {
//            $('#regFormSubmit').attr('disabled', 'disabled');
        }
        else {
            //$('#register').removeAttr('disabled');
            $('#regFormSubmit').prop("disabled", false);
        }
    });

    $('#regOTPForm > .form-group > input').keyup(function () {
        var empty1 = false;
        $('#regOTPForm > .form-group > input').each(function () {
            if ($(this).val() === '') {
                empty1 = true;
            }
        });
        if (empty1) {
            $('#regOTPBtn').attr('disabled', 'disabled');
        }
        else {
            //$('#register').removeAttr('disabled');
            $('#regOTPBtn').prop("disabled", false);
        }
    });

    $('#bitSendOTP').keyup(function () {
        var empty1 = false;
        $('#bitSendOTP').each(function () {
            if ($(this).val() === '') {
                empty1 = true;
            }
        });
        if (empty1) {
            $('#bitsendsubmit').attr('disabled', 'disabled');
        }
        else {
            //$('#register').removeAttr('disabled');
            $('#bitsendsubmit').prop("disabled", false);
        }
    });

    $('#sendBITForm > .container-fluid > .inputwrap > input').keyup(function () {
        var empty1 = false;
        $('#sendBITForm > .container-fluid > .inputwrap  > input').each(function () {
            if ($(this).val() === '') {
                empty1 = true;
            }
        });
        if (empty1) {
            $('#nextBtn').attr('disabled', 'disabled');
        }
        else {
            //$('#register').removeAttr('disabled');
            $('#nextBtn').prop("disabled", false);
        }
    });

});


// Dashboard Table js

$.fn.pageMe = function(opts) {
    var $this = this,
    defaults = {
        perPage: 7,
        showPrevNext: false,
        hidePageNumbers: false
    },
    settings = $.extend(defaults, opts);

    var listElement = $this;
    var perPage = settings.perPage;
    var children = listElement.children();
    var pager = $('.pager');

    if (typeof settings.childSelector != "undefined") {
        children = listElement.find(settings.childSelector);
    }

    if (typeof settings.pagerSelector != "undefined") {
        pager = $(settings.pagerSelector);
    }

    var numItems = children.size();
    var numPages = Math.ceil(numItems / perPage);

    pager.data("curr", 0);

    if (settings.showPrevNext) {
        $('<li><a href="#" class="prev_link">«</a></li>').appendTo(pager);
    }

    var curr = 0;
    while (numPages > curr && (settings.hidePageNumbers == false)) {
        $('<li><a href="#" class="page_link">' + (curr + 1) + '</a></li>').appendTo(pager);
        curr++;
    }

    if (settings.showPrevNext) {
        $('<li><a href="#" class="next_link">»</a></li>').appendTo(pager);
    }

    pager.find('.page_link:first').addClass('active');
    pager.find('.prev_link').hide();
    if (numPages <= 1) {
        pager.find('.next_link').hide();
    }
    pager.children().eq(1).addClass("active");

    children.hide();
    children.slice(0, perPage).show();

    pager.find('li .page_link').click(function() {
        var clickedPage = $(this).html().valueOf() - 1;
        goTo(clickedPage, perPage);
        return false;
    });
    pager.find('li .prev_link').click(function() {
        previous();
        return false;
    });
    pager.find('li .next_link').click(function() {
        next();
        return false;
    });

    function previous() {
        var goToPage = parseInt(pager.data("curr")) - 1;
        goTo(goToPage);
    }

    function next() {
        goToPage = parseInt(pager.data("curr")) + 1;
        goTo(goToPage);
    }

    function goTo(page) {
        var startAt = page * perPage,
        endOn = startAt + perPage;

        children.css('display', 'none').slice(startAt, endOn).show();

        if (page >= 1) {
            pager.find('.prev_link').show();
        } else {
            pager.find('.prev_link').hide();
        }

        if (page < (numPages - 1)) {
            pager.find('.next_link').show();
        } else {
            pager.find('.next_link').hide();
        }

        pager.data("curr", page);
        pager.children().removeClass("active");
        pager.children().eq(page + 1).addClass("active");

    }
};

$(document).ready(function() {

    $('#wallhistory').pageMe({pagerSelector: '#wallHisPager', showPrevNext: true, hidePageNumbers: false, perPage: 4});

});


var $cards = $("#accordion > .card");
var $btns = $(".filtrBtn").on("click", function() {
    var active = $btns.removeClass("FilterActive").filter(this).addClass("FilterActive").data("filter");
    $cards.hide().filter("." + active).show();
});
