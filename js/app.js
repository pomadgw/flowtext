window.isTextBoxChanged = true;
window.timerToDelete = 0;
window.timeToEndWriting = 60;
window.currTime = 0;
window.textAreaTextColor = "#eeeeee";
window.progressColor = "#bdbdbd";
window.progressColorWarning = "#e91e63";

window.setTimerInNavBar = function (time) {
    minutes = Math.floor(time / 600);
    seconds = Math.ceil(Math.floor(time / 10) % 60);
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    $('#timer_minutes').text(minutes);
    $('#timer_seconds').text(seconds);
}

loadData = function () {
    if (!localStorage.getItem('data')) {
        localStorage.setItem('data', "{}");
    }
    window.textData = JSON.parse(localStorage.getItem('data'));
    for (var key in window.textData) {
        var $text = $('<li class="collection-item"><div>' + window.textData[key]['title'] +
            '<a href="#" title="Delete the text" data-title-text="' + key + '" class="secondary-content delete-text"><i class="material-icons">delete</i></a>' +
            '<a href="#" title="Open the text read-only" data-title-text="' + key +
            '" class="secondary-content open-text"><i class="material-icons">open_in_browser</i></a>' +
            '</div></li>');
        $('#choose-data-collection').append($text);
    }
}

saveData = function () {
    localStorage.setItem('data', JSON.stringify(window.textData));
}

main = function () {
    $('#content').val('');
    loadData();
    $('#modal-new-text').openModal();

    $('select').material_select();

    $('#modal-new-text').openModal();

    $('#btn-new-data').click(function (e) {
        $('#modal-new-text').openModal();
    });

    $('#btn-see-data').click(function (e) {
        $('#modal-choose-data').openModal();
        return false;
    });

    $('#modal-choose-data .open-text').click(function (e) {
        var key = $(this).attr('data-title-text');

        $('#content').val(window.textData[key]['content']);
        autosize($('#content'));
        
        $('#text-title').text(window.textData[key]['title']);
        $('#modal-choose-data').closeModal();

        return false;
    });

    $('#modal-choose-data .delete-text').click(function (e) {
        var key = $(this).attr('data-title-text');

        $('#delete-title').text(window.textData[key]['title']);
        $('#delete-title').attr('data-delete-title', key);
        $('#modal-choose-data').closeModal();
        $('#modal-confirmation-delete').openModal();

        return false;
    });

    $('#modal-new-text-open-text').click(function (e) {
        $('#modal-choose-data').openModal();
    });

    $('#modal-confirmation-submit').click(function (e) {
        var key = $('#delete-title').attr('data-delete-title');

        delete window.textData[key];
        saveData();

        $('#choose-data-collection').empty();
        loadData();

        $('#modal-confirmation-submit').closeModal();

        return true;
    });

    $('#modal-confirmation-cancel').click(function (e) {
        return false;
    });

    $('#modal-new-text-submit').click(function (e) {
        $('#content').removeAttr('readonly');

        window.textTitle = $('#title').val();
        $('title-text').text(window.textTitle);
        window.timeToEndWriting = parseInt($('#time').val());
        $('#text-title').text(window.textTitle);

        $('#content').val('');

        main_run();
    });
}

main_run = function () {
    $('#content').attr("placeholder", "Keep typing!");
    autosize($('#content'));
    $('#content').focus();
    
    window.isCalled = false;
    $('#navbar-main').animate({ height: 'toggle', opacity: 'toggle' }, 'slow');; //.addClass('hide')
    $('#progress-texting').css("background-color", window.progressColor);

    window.animateFading = function () {
        //console.log("Animating!");
        $('#content').animate({
            color: $.Color({ alpha: 0 })
        }, 4000);
        $('#progress-texting').animate({
            backgroundColor: window.progressColorWarning
        }, 4000);
    }

    window.resetAnimation = function () {
        $('#progress-texting').stop();
        $('#content').css("color", $.Color(window.textAreaTextColor));
        $('#progress-texting').css("background-color", window.progressColor);
        window.isCalled = false;

        console.log("Reset animating!");
    }

    window.textAreaHandle = window.setInterval(function () {
        //console.log(isTextBoxChanged);
        if (window.timerToDelete >= 10 && !window.isCalled) {
            //console.log("Prepare animating!");
            window.animateFading();
            window.isCalled = true;
        }

        if (!window.isTextBoxChanged && window.timerToDelete >= 50) {
            //console.log('Ouch!');
            $('#content').val('');
            window.timerToDelete = 0;
            window.resetAnimation();
            window.currTime = 0;
        }

        window.timerToDelete++;
    }, 100);

    $('#content').bind('input keyup', function (e) {
        console.log(isTextBoxChanged);
        window.isTextBoxChanged = true;
        window.timerToDelete = 0;
        autosize($('#content'));
        //console.log(e.keyCode);

        $('#content').stop();
        window.resetAnimation();
    });

    window.changeFlagHandle = setInterval(function () {
        isTextBoxChanged = false;
    }, 100);

    window.timeOutHandle = setInterval(function () {
        var remainingTime = window.timeToEndWriting * 10 - window.currTime;

        $('#progress-texting').css({
            width: (remainingTime / (window.timeToEndWriting * 10) * 100) + '%'
        });

        setTimerInNavBar(remainingTime);

        if (window.currTime >= window.timeToEndWriting * 10) {
            clearInterval(window.textAreaHandle);
            clearInterval(window.changeFlagHandle);

            $('#content').stop();
            $('#content').attr('readonly', 'readonly');
            $("#done").css('display', 'block');

            window.resetAnimation();
            
            $('#navbar-main').animate({ height: 'toggle', opacity: 'toggle' }, 'slow');;
            clearInterval(window.timeOutHandle);

            console.log(window.textData);
            var key = Sha256.hash(window.textTitle);
            window.textData[key] = {"title": window.textTitle, "content": $('#content').val()};
            console.log(window.textData);
            window.saveData();
            $('#choose-data-collection').empty();
            window.loadData();

            console.log("stop!");
        }
        window.currTime++;
    }, 100);
}
$(document).ready(main);