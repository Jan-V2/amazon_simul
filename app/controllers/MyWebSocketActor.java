package controllers;

import Model.IModel_Update_Receiver;
import Model.Warehouse_Model;
import akka.actor.*;
import com.google.gson.JsonObject;

public class MyWebSocketActor extends UntypedActor implements IModel_Update_Receiver {
    Warehouse_Model model;

    //todo put

    public static Props props(ActorRef out) {
        return Props.create(MyWebSocketActor.class, out);
    }

    private final ActorRef out;

    public MyWebSocketActor(ActorRef out) {
        this.out = out;
        this.model = new Warehouse_Model(this);
        this.model.run();
    }

    public void onReceive(Object message) {
        if (message instanceof String) {
            out.tell("I received your message: " + message, self());
        }
    }

    @Override
    public void get_message(String message) {
    }

    @Override
    public void recieve_tick_report(JsonObject summary) {
        out.tell(summary.toString(), self());
    }


}