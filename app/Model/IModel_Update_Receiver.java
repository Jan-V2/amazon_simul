package Model;

import com.google.gson.JsonObject;

public interface IModel_Update_Receiver {

    public void get_message(String message);

    public void recieve_tick_report(JsonObject summary);
}


