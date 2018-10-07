package Model;

public interface IModel_Connector {
    // return is the reciever number
    int connect(IModel_Receiver receiver);

    void disconnect_receiver(int reciever_id);
}
