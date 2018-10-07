package Model;

import com.google.gson.JsonObject;
import play.api.libs.json.Json;

import java.util.ArrayList;

public class Tick_Summary {

    public ArrayList<Robot_Move> robot_moves = new ArrayList<>();
    public ArrayList<Coord> scaffold_placed = new ArrayList<>();
    public ArrayList<Coord> scaffold_removed = new ArrayList<>();
    public ArrayList<Coord> robot_unload = new ArrayList<>();
    public ArrayList<Coord> robot_load = new ArrayList<>();
    public Truck_State truck_state;


    void add_robot_move(Coord from, Coord to){
        robot_moves.add(new Robot_Move(from, to));
    }

    void add_scaffold_placed(Coord scaffold_coord){
        scaffold_placed.add(scaffold_coord);
    }

    void add_scaffold_removed(Coord scaffold_coord) {
        scaffold_removed.add(scaffold_coord);
    }

    void add_truck_state(Warehouse_Model.Truck truck){
        //todo think of a smarter way of doing this.
        truck_state = new Truck_State(truck);

    }

    void add_robot_unload(Coord robot_coord){
        robot_unload.add(robot_coord);
    }

    void add_robot_load(Coord robot_coord){
        robot_load.add(robot_coord);
    }

    public class Robot_Move{
        public  Coord from;
        public  Coord to;

        Robot_Move(Coord from, Coord to){
            this.from = from;
            this.to = to;
        }

    }

    public class Truck_State{
        public int travel_time_remaining;
        public boolean has_been_serviced;
        public boolean arrived_at_dock;

        Truck_State(Warehouse_Model.Truck truck){
            this.travel_time_remaining = truck.travel_time_remaining;
            this.has_been_serviced = truck.has_been_serviced;
            this.arrived_at_dock =truck.arrived_at_dock;
        }
    }


}