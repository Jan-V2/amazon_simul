package Model;


import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedList;


class Dijkstra_Path_Finder {

    private Graaf graaf = new Graaf();



    void find_path(Warehouse_Model.Robot robot, Coord destination){
        // uses dijkstras algorithm
        robot.setDestination(destination);

        class Node_Tracker{
            private ArrayList<ArrayList<Node>> node_cost_map = new ArrayList<>();
            private HashSet<Coord> found = new HashSet<>();
            private int current_cost = 0;

            Node_Tracker(Coord starting_point){
                Node start_node = new Node(starting_point);
                this.add_node(start_node);
            }

            void add_node(Node node){
                while (node_cost_map.size() < node.cost()+1){
                    node_cost_map.add(new ArrayList<>());
                }
                node_cost_map.get(node.cost()).add(node);
            }

            Node get_next(){
                while (node_cost_map.get(current_cost).size() < 1){
                    if (!(current_cost + 1 < node_cost_map.size())){
                        throw new IndexOutOfBoundsException("node cost map is empty before goal was found");
                    }
                    current_cost++;
                }
                return node_cost_map.get(current_cost).remove(0);
            }

            boolean has_visited(Coord coord){
                return found.contains(coord);
            }

            void add_visited(Node node){
                found.add(node.location);
            }

        }

        if(!robot.location.equals(robot.destination)){
            Node_Tracker tracker = new Node_Tracker(robot.location);
            Node next_node = tracker.get_next();
            while (!next_node.location.equals(robot.destination)){
                for (Coord neighbour_coord : graaf.get_traversable_neighbours(next_node.location)) {
                    if (!tracker.has_visited(neighbour_coord)){
                        tracker.add_node(new Node(neighbour_coord, next_node));
                    }
                }
                tracker.add_visited(next_node);
                next_node = tracker.get_next();
            }
            LinkedList<Coord> path = new LinkedList<>(next_node.shortestPath);
            path.add(next_node.location);
            robot.setPath(path);
        }else{
            System.out.println("Assigned empty path to robot_underway.");
            robot.setPath(new LinkedList<>());
        }
    }

    void find_path_to_scaffold(Warehouse_Model.Robot robot, Coord scaffold_location){
        robot.scaffold_location = scaffold_location;
        find_path(robot, graaf.get_traversable_neighbours(robot.scaffold_location)[0]);
    }


    private class Node{
        private Coord location;
        private ArrayList<Coord> shortestPath = new ArrayList<>();

        Node(Coord location) {
            this.location = location;
        }

        Node(Coord location, Node found_from) {
            this(location);
            this.shortestPath = new ArrayList<>(found_from.shortestPath);
            if (shortestPath.size() > 0){
                if(shortestPath.get(shortestPath.size()-1).equals(found_from.location)){
                    return;
                }
            }
            this.shortestPath.add(found_from.location);
        }

        int cost(){
            return shortestPath.size();
        }

    }

    ArrayList<Coord> get_parking_spots(){
        return graaf.parking_spots;
    }

    ArrayList<Coord> get_dock_spots(){
        return graaf.dock_spots;
    }

    ArrayList<Coord> get_scaffold_spots(){
        return graaf.scaffold_spots;
    }

    boolean is_parked(Warehouse_Model.Robot robot){
        return graaf.map_get(robot.location) == 'P';
    }


    char[][] get_world_map(){
        return graaf.map;
    }



    class Graaf{
        //todo add bridge nodes, to make it more like dijkstra.
        //todo make this into "proper" dijkstra by generating a mesh of nodes from the map.
        protected final char[][] map = new char[][]{//the cols on the sides have to be untraversable.
                {'X','X','X','X','D','D','D','D','D','X','X','X','X','X'},
                {'X','R','R','R','R','R','R','R','R','R','R','R','R','X'},
                {'X','R','X','X','P','P','P','P','P','X','X','X','R','X'},
                {'X','R','X','X','X','X','X','X','X','X','X','X','R','X'},
                {'X','R','S','S','S','S','S','S','S','S','S','S','R','X'},
                {'X','R','R','R','R','R','R','R','R','R','R','R','R','X'},
                {'X','R','S','S','S','S','S','S','S','S','S','S','R','X'},
                {'X','R','S','S','S','S','S','S','S','S','S','S','R','X'},
                {'X','R','R','R','R','R','R','R','R','R','R','R','R','X'},
                {'X','R','S','S','S','S','S','S','S','S','S','S','R','X'},
                {'X','R','S','S','S','S','S','S','S','S','S','S','R','X'},
                {'X','R','R','R','R','R','R','R','R','R','R','R','R','X'},
                {'X','R','S','S','S','S','S','S','S','S','S','S','R','X'},
                {'X','R','S','S','S','S','S','S','S','S','S','S','R','X'},
                {'X','R','R','R','R','R','R','R','R','R','R','R','R','X'},
                {'X','X','X','X','X','X','X','X','X','X','X','X','X','X'},};
        //todo bug with E and R nodes
        private ArrayList<Coord> parking_spots;
        private ArrayList<Coord> dock_spots;
        private ArrayList<Coord> scaffold_spots;

        public Graaf(){
            /*todo
             * pregenerate all the nodes
             * init the scaffolds
             * */

            // initializing spot array.
            this.parking_spots = get_all_of_type('P');
            this.dock_spots = get_all_of_type('D');
            this.scaffold_spots = get_all_of_type('S');


        }

        private ArrayList<Coord> get_all_of_type(char type){
            ArrayList<Coord> found_spots = new ArrayList<>();
            for (int y=0; y<map.length; y++) {
                for (int x=0; x<map[0].length; x++) {
                    if (map[y][x] == type){
                        found_spots.add(new Coord(x,y));
                    }
                }
            }
            return found_spots;
        }

        Coord[] get_traversable_neighbours(final Coord coord){
            ArrayList<Coord> checked_coords = new ArrayList<>();

            if (coord.x >= map[0].length || coord.x < 0
                    || coord.y >= map.length || coord.y < 0){
                throw new IndexOutOfBoundsException("coord outside of grid");
            }else if(map[coord.y][coord.x] == 'X'){
                throw new IllegalArgumentException("coord is on untraversable square");
            }else{
                Coord mid_left = coord.translate_x(-1);
                checked_coords.add(traversability_check(coord, mid_left));

                Coord mid_right = coord.translate_x(1);
                checked_coords.add(traversability_check(coord, mid_right));

                if (coord.y < map.length - 1){
                    Coord bot = coord.translate_y(1);
                    checked_coords.add(traversability_check(coord, bot));
                }
                if (coord.y > 0){
                    Coord top = coord.translate_y(-1);
                    checked_coords.add(traversability_check(coord, top));
                }
            }

            ArrayList<Coord> ret = new ArrayList<>();
            for (Coord checked_coord : checked_coords) {
                if (checked_coord != null) {
                    ret.add(checked_coord);
                }
            }

            return ret.toArray(new Coord[0]);
        }

        private Coord traversability_check(Coord from, Coord to ) {
            char to_type = map_get(to);
            if (to_type == 'S' || to_type == 'X'){
                return null;
            }else if (to_type == 'R' || to_type == 'P' || to_type == 'D'){
                return to;
            }else if (to_type == 'E') {
                if( to.x > from.x){
                    return to;
                }else{
                    return null;
                }
            }else if (to_type == 'W'){
                if (to.x < from.x){
                    return to;
                }else{
                    return null;
                }
            }else{
                throw new IllegalArgumentException("to_type " + String.valueOf(to_type) + "is invalid.");
            }
        }

        private char map_get(Coord coord){
            return map[coord.y][coord.x];
        }
    }

}
