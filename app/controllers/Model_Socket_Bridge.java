package controllers;

import Model.IModel_Connector;
import Model.IModel_Receiver;
import Model.Warehouse_Model;
import akka.actor.*;
import com.google.gson.JsonObject;

public class Model_Socket_Bridge extends UntypedActor implements IModel_Receiver {
    private final ActorRef out;
    private final int reciver_id;

    public Model_Socket_Bridge(ActorRef out, IModel_Connector warehouse_model) {
        this.out = out;
        this.reciver_id = warehouse_model.connect(this);
    }

    public void onReceive(Object message) {
        if (message instanceof String) {
            out.tell("I received your message: " + message, self());
        }
    }

    @Override
    public void transmit_message(String message) {
    }

    @Override
    public void recieve_tick_report(JsonObject summary) {
        out.tell(summary.toString(), self());
    }


}