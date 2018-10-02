package controllers;

import play.api.libs.json.JsValue;
import play.api.libs.streams.ActorFlow;
import play.libs.streams.*;
import play.mvc.*;
import akka.actor.*;
import akka.stream.*;
import views.html.index;

import javax.inject.Inject;


import static play.mvc.Results.ok;

public class Application extends Controller {

    private final ActorSystem actorSystem;
    private final Materializer materializer;

    @Inject
    public Application(ActorSystem actorSystem, Materializer materializer){
        this.actorSystem = actorSystem;
        this.materializer = materializer;
    }


    public Result index() {
        return ok(index.render("Your new aslkjdvcozxicujvo is ready."));
    }

    public static LegacyWebSocket<String> socket() {
        return WebSocket.withActor(MyWebSocketActor::props);
    }

}
