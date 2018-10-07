package controllers;

import Model.Warehouse_Model;
import akka.stream.javadsl.Flow;
import play.libs.streams.ActorFlow;
import play.mvc.*;
import akka.actor.*;
import akka.stream.*;
import javax.inject.Inject;

public class Application extends Controller {
    //todo put model in seperate thread and pass it to the socket handeler via prop.

    private final ActorSystem actorSystem;
    private final Materializer materializer;
    private final Warehouse_Model warehouse_model;

    @Inject
    public Application(ActorSystem actorSystem, Materializer materializer) {
        this.actorSystem = actorSystem;
        this.materializer = materializer;
        this.warehouse_model = new Warehouse_Model();
        warehouse_model.run();
        // creates the model
       // Props test = Props.create(Model_Socket_Bridge.class, , "TEst");


    }

    private Props create_model_props(ActorRef out) {
        // this is where the constructor for this actor is called.
        return Props.create(Model_Socket_Bridge.class, out, warehouse_model);
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
                ActorFlow.actorRef(this::create_model_props,
                        actorSystem, materializer
        ));
    }
}