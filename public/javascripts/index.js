$(document).ready(function() {
    console.log($("body").data("ws-url"));
    const ws = new WebSocket($("body").data("ws-url"));
    ws.onmessage =  (packet) => {
        let message = JSON.parse(packet.data);
        console.log(message);
    }
});