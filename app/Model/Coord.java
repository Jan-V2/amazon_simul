package Model;

class Coord{
    public int x;
    public int y;

    public Coord(int x, int y){
        this.x = x;
        this.y = y;
    }

    public int getY() {
        return y;
    }

    public int getX() {
        return x;
    }

    public int hashCode() {
        return (x * 301) ^ y;
    }

    public boolean equals(Object o) {
        if (o instanceof Coord) {
            Coord other = (Coord) o;
            return (x == other.x && y == other.y);
        }
        return false;
    }

    public Coord translate(int x, int y){
        return new Coord(this.x + x, this.y + y);
    }

    public Coord translate_y(int y){
        return new Coord(this.x, this.y + y);
    }

    public Coord translate_x(int x){
        return new Coord(this.x + x, this.y);
    }

    @Override
    public String toString() {
        return "{ "+this.x+","+this.y+" }";
    }
}