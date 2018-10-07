var $messages = $("#messages"),
    $send = $("#send"),
    $message = $("#message"),
    connection = new WebSocket("ws://localhost:9000/ws");

$send.prop("disabled", true);

var send = function () {
    var text = $message.val();
    $message.val("");
    connection.send(text);
};

connection.onopen = function () {
    $send.prop("disabled", false);
    $messages.prepend($("<li class='bg-info' style='font-size: 1.5em'>Connected</li>"));
    $send.on('click', send);
    $message.keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            send();
        }
    });
};
connection.onerror = function (error) {
    console.log('WebSocket Error ', error);
};
connection.onmessage = function (event) {
    $messages.append($("<li style='font-size: 1.5em'>" + event.data + "</li>"));
    console.log(JSON.parse(event.data));
};