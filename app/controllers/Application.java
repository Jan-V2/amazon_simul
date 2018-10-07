package controllers;

import play.libs.streams.ActorFlow;
import play.mvc.*;
import akka.actor.*;
import akka.stream.*;
import javax.inject.Inject;

public class Application extends Controller {
    //todo put model in seperate thread and pass it to the socket handeler via prop.

    private final ActorSystem actorSystem;
    private final Materializer materializer;

    @Inject
    public Application(ActorSystem actorSystem, Materializer materializer) {
        this.actorSystem = actorSystem;
        this.materializer = materializer;
    }

    public Result index() {
        Http.Request request = request();
        return Results.ok(views.html.main.render("test"));
    }

    public Result socket_test() {
        Http.Request request = request();
        return Results.ok(views.html.test.render());
    }
    
    public WebSocket socket() {
        return WebSocket.Text.accept(request ->
                ActorFlow.actorRef(MyWebSocketActor::props,
                        actorSystem, materializer
                )
        );
    }
}