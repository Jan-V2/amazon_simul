package Model;

import com.google.gson.JsonObject;
import play.api.libs.json.Json;

import java.util.ArrayList;

class Tick_Summary {

    ArrayList<Robot_Move> robot_moves = new ArrayList<>();
    ArrayList<Tuple<Coord, Integer>> scaffold_placed = new ArrayList<>();
    ArrayList<Tuple<Coord, Integer>> scaffold_removed = new ArrayList<>();
    ArrayList<Integer> robot_unload = new ArrayList<>();
    ArrayList<Integer> robot_load = new ArrayList<>();
    int tick_id;
    Truck_State truck_state;



    void add_robot_move(Coord from, Coord to, int id){
        robot_moves.add(new Robot_Move(from, to, id));
    }

    void add_scaffold_placed(Coord scaffold_coord, int robot_id){
        scaffold_placed.add(new Tuple<>(scaffold_coord, robot_id));
    }

    void add_scaffold_removed(Coord scaffold_coord, int robot_id) {
        scaffold_removed.add(new Tuple<>(scaffold_coord, robot_id));
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
        int truck_position;
        boolean has_moved;
        boolean did_reset;
        boolean has_been_serviced;


        Truck_State(Warehouse_Model.Truck truck){
            this.truck_position = truck.travel_time - truck.travel_time_remaining;
            if (truck.arrived_at_dock ){
                this.truck_position += truck.travel_time;
            }
            this.did_reset = truck.did_reset;
            this.has_moved = truck.has_moved();
            this.has_been_serviced = truck.has_been_serviced;
            truck.did_update();
        }
    }
}

