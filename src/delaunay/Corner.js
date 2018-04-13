var Corner = function (x,y,cornerType) {
    this.x = x;
    this.y = y;
    this.cornerType = cornerType;
    this.edgeList = new Array();
    this.r = 8;
}

Corner.prototype = {
    constructor: Corner,
    clear:function (context) {

    },

    draw:function (context) {

        var px = this.x*GRID_WIDTH + GRID_WIDTH * 0.5 - this.r * 0.5;
        var py = this.y*GRID_HEIGHT + GRID_HEIGHT * 0.5 - this.r * 0.5;

        context.clearRect(px , py, this.r, this.r);
        context.strokeRect(px, py, this.r, this.r);
        context.fillStyle = "#ffcc00";
        context.fillRect(px,  py, this.r, this.r);

    },
    equals:function (p) {
        return p.y == this.y && p.x == this.x;
    },

}