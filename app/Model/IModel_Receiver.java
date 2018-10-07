package Model;

import com.google.gson.JsonObject;

public interface IModel_Receiver {

    void transmit_message(String message);

    void recieve_tick_report(JsonObject world_state);
}


