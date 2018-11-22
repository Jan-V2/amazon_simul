package Model;


import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

import java.util.*;

public class Warehouse_Model implements Runnable, IModel_Connector {
    // genereert voor elke tick een tick report en geeft die door aan de server.

    //todo the js client should control the model speed

    private HashMap<Integer, IModel_Receiver> receivers = new HashMap<>();
    private int next_reciver_num = 0;
    private float ticktime = 1.0f;//ticktime in seconds
    private int max_robots;
    private ArrayList<Robot> robots = new ArrayList<>();

    // scaffolds get removed when they get taken out of storage
    private ArrayList<Scaffold> scaffolds_in_storage = new ArrayList<>();
    private Truck truck = new Truck(9);
    private Dijkstra_Path_Finder dijkstra_path_finder = new Dijkstra_Path_Finder();
    private Json_Handeler json_handeler = new Json_Handeler();

    private int robot_id = 0;
    private int tick_id = 0;

    /*todo:
     * implement different node types
     * implement dijkstra*/

    public Warehouse_Model( int max_robots){
        this.max_robots = max_robots;
        //tries to add max robots number of robots.

        for (int i = 0; i <this.max_robots ; i++) {
            add_robot();
        }

    }

    public Warehouse_Model(){
        this(3);
    }

    private void run_model(int ticktime_in_ms){
        /*todo
         * spawn robots
         * truck komt aan brengt/neemt een stellage mee
         * een robot_underway neemt de stellage naar het gekozen hokje
         * waneer de robot_underway is aangekomen gaat hij weer terug naar het laaddok
         * als de robot_underway naar een vakje wil waar al een andere robot_underway op zit wacht hij een tick.
         *
         */

        // todo there are still bugs in here. if two robots need to be on each others coord, they will get stuck.

        //todo add scaffolds_in_storage to the simulation

        class Model_Controls{
            private Tick_Summary summary;

            Tick_Summary get_tick_summary(){
                summary.add_truck_state(truck);
                summary.tick_id = tick_id;
                return summary;
            }

            void move_truck(){
                if (truck.travel_time_remaining > 0) {
                    truck.travel_time_remaining--;
                }
            }

            void move_robots(){
                for (Robot robot : robots) {
                    if (!robot.path.isEmpty()) {
                        // todo removed collision check
                        //ArrayList<Coord> other_robot_coords = get_robot_locations(robot);
                        Coord new_location = robot.path.peek();

                        //if (!other_robot_coords.contains(new_location)){
                            summary.add_robot_move(robot.location, new_location, robot.id);
                            robot.location = robot.path.remove(0);
                        //}
                    }
                }
            }

            void send_robot_to_dock(Robot robot){
                ArrayList<Coord> free_dock_coords = get_free_docks();
                if (free_dock_coords.size() > 0) {
                    dijkstra_path_finder.find_path(robot, free_dock_coords.get(0));
                    truck.robot_underway = true;
                }
            }

            void load_unload_truck(Robot robot, boolean loading) {
                if (!loading) {
                    if (truck.carrying_goods && !robot.carrying_scaffold){
                        truck.carrying_goods = false;
                        robot.carrying_scaffold = true;
                        summary.add_robot_load(robot.id);
                    }else{
                        throw new ArrayIndexOutOfBoundsException("goods can't be exchanged, actors are in wrong state.");
                    }
                }else {
                    if (!truck.carrying_goods && robot.carrying_scaffold){
                        truck.carrying_goods = true;
                        robot.carrying_scaffold = false;
                        summary.add_robot_unload(robot.id);
                    }else{
                      //  throw new ArrayIndexOutOfBoundsException("goods can't be exchanged, actors are in wrong state.");
                    }
                }
            }

            void send_robot_to_scaffold(Robot robot, boolean pickup){
                if (pickup) {
                    Scaffold scaffold = scaffolds_in_storage.get(new Random().nextInt(scaffolds_in_storage.size()));
                    dijkstra_path_finder.find_path_to_scaffold(robot, scaffold.get_location());
                }else {
                    ArrayList<Coord> free_scaf = get_free_scaffold_spots();
                    dijkstra_path_finder.find_path_to_scaffold
                            (robot,free_scaf.get(new Random().nextInt(free_scaf.size())));
                }
            }

            void load_unload_scaffold(Robot robot, boolean loading){
                if (loading) {
                    // picks up scaffold
                    System.out.println("picking scaffold up at " + robot.scaffold_location);
                    boolean found = false;
                    for (int i = 0; i < scaffolds_in_storage.size(); i++) {
                        if (scaffolds_in_storage.get(i).location.equals(robot.scaffold_location)) {
                            scaffolds_in_storage.remove(i);
                            found = true;
                            break;
                        }
                    }
                    if (found){
                        summary.add_scaffold_removed(robot.scaffold_location, robot.id);
                        summary.add_robot_load(robot.id);

                        robot.carrying_scaffold = true;
                    }

                } else {
                    // drops of scaffold
                    scaffolds_in_storage.add(new Scaffold(robot.scaffold_location));
                    robot.carrying_scaffold = false;

                    summary.add_scaffold_placed(robot.scaffold_location, robot_id);
                    summary.add_robot_unload(robot.id);

                }
            }

            void park_robot(Robot robot){
                robot.going_to_warehouse = false;
                ArrayList<Coord> parking_spots = get_free_parking_spots();
                if (parking_spots.size() > 0){
                    dijkstra_path_finder.find_path(robot, parking_spots.get(0));
                }else{
                    System.out.println("could not move robot_underway from dock to parking. no free parking.");
                }
            }
        }


        truck.reset_truck();

        Model_Controls model_controls = new Model_Controls();

        Timer timer = new Timer();
        int one_second = 1000;
        // this timer seems kind of wonky, but i'll see.
        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                model_controls.summary = new Tick_Summary();

                model_controls.move_truck();

                if (truck.travel_time_remaining == 0){
                    if (!truck.arrived_at_dock && !truck.robot_underway){
                        truck.arrived_at_dock = true;
                    }
                    if (truck.has_been_serviced){
                        truck.reset_truck();
                    }
                }

                model_controls.move_robots();

                for (Robot robot :robots) {
                    if (robot.at_destination()){
                        // all the idle robots
                        if (!truck.has_been_serviced && truck.robot_underway  &&
                                robot.is_at_dock() && truck.arrived_at_dock){
                            // services truck
                            model_controls.load_unload_truck(robot, robot.carrying_scaffold);
                            truck.has_been_serviced = true;
                            truck.leave_dock();

                            if (robot.carrying_scaffold){
                                model_controls.send_robot_to_scaffold(robot, false);
                            }else {
                                model_controls.park_robot(robot);
                            }
                        }else if (!robot.is_at_dock() && robot.carrying_scaffold){
                            // drops off scaffold
                            model_controls.load_unload_scaffold(robot,false);
                            model_controls.park_robot(robot);
                        }else if (truck.arrived_at_dock && truck.robot_underway &&
                                !truck.carrying_goods && robot.picking_up_scaffold_for_truck){
                            // loads scaffold
                            model_controls.load_unload_scaffold(robot,true);
                            model_controls.send_robot_to_dock(robot);
                        }else if (truck.arrived_at_dock){
                            if (!truck.robot_underway){
                                // assigns robot to truck
                                if (truck.carrying_goods){
                                    model_controls.send_robot_to_dock(robot);
                                }else{
                                    model_controls.send_robot_to_scaffold(robot, true);
                                    robot.picking_up_scaffold_for_truck = true;
                                }
                                truck.robot_underway = true;
                            }
                        }
                    }
                }

                // sends changes to the server

                send_out_updates(json_handeler.get_tick_result(model_controls.get_tick_summary()));
                tick_id++;
            }
        }, 0, ticktime_in_ms);

    }

    private void send_out_updates(JsonObject update){
        int i = 0;
        while (i < next_reciver_num){
            IModel_Receiver receiver = this.receivers.getOrDefault(i, null);
            if (receiver != null){
                receiver.recieve_tick_report(update);
            }
            i++;
        }

    }

    private ArrayList<Coord> get_robot_locations(Robot exclude){
        // returns a list with the locations of every robot_underway,
        // except for the one given as argument.
        ArrayList<Coord> ret = new ArrayList<>();
        int index = 0;
        for (Robot robot: robots) {
            if (robot.location != exclude.location){
                ret.add(robot.location);
                index++;
            }
        }
        return ret;
    }

    private void add_robot(){
        // adds a robot_underway in an empty parking space, if there's room.
        ArrayList<Coord> parking_spots = get_free_parking_spots();
        if (parking_spots.size() > 0){
            robots.add(new Robot(parking_spots.get(0)));
        }else{
            System.out.println("failed to add robot_underway, no free spots.");
        }
    }

    private ArrayList<Coord> get_free_docks(){
        return get_free_coords(dijkstra_path_finder.get_dock_spots());
    }

    private ArrayList<Coord> get_free_parking_spots(){
        return get_free_coords(dijkstra_path_finder.get_parking_spots());
    }

    private ArrayList<Coord> get_free_scaffold_spots(){
        return get_free_coords(dijkstra_path_finder.get_scaffold_spots());
    }

    private ArrayList<Coord> get_free_coords(ArrayList<Coord> coords){
        ArrayList<Coord> ret = new ArrayList<>();
        for (Coord spot: coords) {
            boolean found = false;
            for (Robot robot : this.robots ) {
                if (robot.location.equals(spot)){
                    found = true;
                    break;
                }
            }
            if (!found){
                ret.add(spot);
            }
        }
        return ret;
    }

    @Override
    public void run() {
        System.out.println("running model");
        run_model(1200);
    }

    @Override
    public int connect(IModel_Receiver receiver) {
        int this_receiver_id = this.next_reciver_num;
        this.receivers.put(this_receiver_id, receiver);
        this.next_reciver_num++;
        System.out.println("connected reciever");
        return this_receiver_id;
    }

    @Override
    public void disconnect_receiver(int receiver_id) {
        receivers.remove(receiver_id);
    }

    protected class Robot{
        Coord location;
        Coord destination;
        Coord scaffold_location;
        private boolean carrying_scaffold = false;
        boolean going_to_warehouse = false;
        boolean picking_up_scaffold_for_truck = false;
        final int id;


        LinkedList<Coord> path = new LinkedList<>();

        public Robot(Coord location){
            this.location = location;
            id = robot_id;
            robot_id++;
        }

        void setDestination(Coord destination) {
            this.destination = destination;
        }

        protected Boolean at_destination() {
            return path.size() == 0;
        }

        protected void setPath(LinkedList<Coord> path) {
            this.path.clear();
            while(!path.isEmpty()){
                this.path.add(path.remove());
            }
        }

        boolean is_at_dock(){
            for (Coord coord:dijkstra_path_finder.get_dock_spots()) {
                if (coord.equals(this.location)){
                    return true;
                }
            }
            return false;
        }
    }

    protected class Truck{

        final int travel_time;
        int travel_time_remaining;
        private int old_travel_time;
        private boolean carrying_goods = false;
        boolean arrived_at_dock = false;
        boolean has_been_serviced = false;
        boolean robot_underway = false;
        boolean at_endpoint = false;
        public boolean did_reset = false;


        Truck(int travel_time){
            this.travel_time = travel_time;
            this.old_travel_time = travel_time;
        }

        public boolean get_has_load() {
            return carrying_goods;
        }

        void toggle_has_load() {
            //todo make truck leave
            this.carrying_goods = !this.carrying_goods;
        }

        void leave_dock() {
            this.travel_time_remaining = travel_time;
        }

        void reset_truck(){
            System.out.println(scaffolds_in_storage.size() +  " scaffolds now in storage");
            this.leave_dock();
            this.arrived_at_dock = false;
            this.has_been_serviced = false;
            this.robot_underway = false;
            this.at_endpoint = false;
            double scaffolds_in_storage_ratio = // lower means higher change new one will arrive.
                    (double) scaffolds_in_storage.size() / (double) dijkstra_path_finder.get_scaffold_spots().size();
            this.carrying_goods = Math.random() > scaffolds_in_storage_ratio;
            this.did_reset = true;
        }

        public boolean has_moved(){
            return this.travel_time_remaining != this.old_travel_time;
        }

        public void did_update() {
            this.old_travel_time = this.travel_time_remaining;
            this.did_reset = false;
        }
    }

    class Scaffold{
        Coord location;

        Scaffold(Coord location){
            this.location = location;
        }

        Coord get_location() {
            return this.location;
        }
    }

    class Json_Handeler{
        private JsonArray world_map;

        Json_Handeler(){
            {
                // turns the world map into a json array
                char[][] map = dijkstra_path_finder.get_world_map();
                JsonArray json_map = new JsonArray();
                for (char[] array: map) {
                    JsonArray row = new JsonArray();
                    for (char item: array) {
                        if (item == 'E' || item == 'w'){
                            item = 'R';
                        }
                        row.add(new JsonPrimitive(item));
                    }
                    json_map.add(row);
                }
                world_map = json_map;

            }
        }

        JsonObject get_tick_result(Tick_Summary tick_summary){
            JsonObject tick_result = new JsonObject();
            JsonObject tick_summary_json = new JsonObject();


            tick_summary_json.add("tick_id", new JsonPrimitive(tick_summary.tick_id));
            tick_summary_json.add("scaffold_placed",
                    coord_id_array_to_json_array(tick_summary.scaffold_placed));
            tick_summary_json.add("scaffold_removed",
                    coord_id_array_to_json_array(tick_summary.scaffold_removed));
            tick_summary_json.add("robot_unload",
                    int_array_to_json_array(tick_summary.robot_unload));
            tick_summary_json.add("robot_load",
                    int_array_to_json_array(tick_summary.robot_load));
            {
                JsonObject truck_state = new JsonObject();
                truck_state.add("position",
                        new JsonPrimitive(tick_summary.truck_state.truck_position));
                truck_state.add("did_reset",
                        new JsonPrimitive(tick_summary.truck_state.did_reset));
                truck_state.add("has_moved",
                        new JsonPrimitive(tick_summary.truck_state.has_moved));
                tick_summary_json.add("truck_state", truck_state);
            }

            {
                JsonArray robot_moves = new JsonArray();
                for (Tick_Summary.Robot_Move robot_move: tick_summary.robot_moves) {
                    JsonObject robot_move_json = new JsonObject();
                    robot_move_json.add("from", coord_to_json_object(robot_move.from));
                    robot_move_json.add("to", coord_to_json_object(robot_move.to));
                    robot_move_json.add("id", new JsonPrimitive(robot_move.id));
                    robot_moves.add(robot_move_json);
                }

                tick_summary_json.add("robot_moves", robot_moves);
            }


            tick_result.add("timestamp",new JsonPrimitive(System.currentTimeMillis()));
            tick_result.add("tick_summary", tick_summary_json);
            tick_result.add("world_state", get_modelstate_as_json());
            return tick_result;
        }

        private JsonArray coord_id_array_to_json_array(ArrayList<Tuple<Coord, Integer>> arrayList){
            JsonArray array = new JsonArray();
            for (Tuple<Coord, Integer> item: arrayList) {
                JsonObject obj = new JsonObject();
                obj.add("coord", coord_to_json_object(item.first));
                obj.addProperty("robo_id", item.second);
                array.add(obj);
            }
            return array;
        }

        private JsonArray int_array_to_json_array(ArrayList<Integer> arrayList){
            JsonArray ret = new JsonArray();
            for (Integer in: arrayList) {
                ret.add(new JsonPrimitive(in));
            }
            return ret;
        }

        private JsonObject coord_to_json_object(Coord coord){
            JsonObject ret = new JsonObject();
            ret.add("x", new JsonPrimitive(coord.x));
            ret.add("y", new JsonPrimitive(coord.y));
            return ret;
        }

        private JsonObject get_modelstate_as_json(){


            JsonObject ret = new JsonObject();
            ret.add("world_map", world_map);
            ret.add("tick_id", new JsonPrimitive(tick_id));

            {
                JsonArray robo_infos = new JsonArray();
                for (Robot robot :robots) {
                    JsonObject robo_info = new JsonObject();
                    robo_info.add("x", new JsonPrimitive(robot.location.x));
                    robo_info.add("y", new JsonPrimitive(robot.location.y));
                    robo_info.add("has_scaffold", new JsonPrimitive(robot.carrying_scaffold));
                    robo_info.add("id", new JsonPrimitive(robot.id));

                    robo_infos.add(robo_info);

                }
                ret.add("robo_info", robo_infos);
            }
            {
                JsonArray scaffold_positions = new JsonArray();
                for (Scaffold scaffold : scaffolds_in_storage) {
                    JsonObject scaffold_position  = new JsonObject();
                    scaffold_position.add("x", new JsonPrimitive(scaffold.location.x));
                    scaffold_position.add("y", new JsonPrimitive(scaffold.location.y));
                    scaffold_positions.add(scaffold_position);
                }
                ret.add("scaffold_positions", scaffold_positions);
            }
            {
                // this can't be directly translated into render commands
                // should try to fix this once i know how the render code is going to work.
                // todo fix this
                JsonObject truck_state = new JsonObject();
                truck_state.add("at_dock", new JsonPrimitive(truck.arrived_at_dock));
                truck_state.add("travel_time", new JsonPrimitive(truck.travel_time_remaining));
                ret.add("truck", truck_state);
            }
            return ret;
        }

    }


}
