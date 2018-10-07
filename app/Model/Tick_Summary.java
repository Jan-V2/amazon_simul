package Model;

import com.google.gson.JsonObject;
import play.api.libs.json.Json;

import java.util.ArrayList;

class Tick_Summary {

    ArrayList<Robot_Move> robot_moves = new ArrayList<>();
    ArrayList<Coord> scaffold_placed = new ArrayList<>();
    ArrayList<Coord> scaffold_removed = new ArrayList<>();
    ArrayList<Integer> robot_unload = new ArrayList<>();
    ArrayList<Integer> robot_load = new ArrayList<>();
    int tick_id;
    Truck_State truck_state;



    void add_robot_move(Coord from, Coord to, int id){
        robot_moves.add(new Robot_Move(from, to, id));
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

    void add_robot_unload(Integer robot_id){
        robot_unload.add(robot_id);
    }

    void add_robot_load(Integer robot_id){
        robot_load.add(robot_id);
    }

    class Robot_Move{
        public  Coord from;
        public  Coord to;
        public int id;

        Robot_Move(Coord from, Coord to, int id){
            this.from = from;
            this.to = to;
            this.id = id;
        }

    }


    class Truck_State{
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