/**
 * Created by Administrator on 2017/6/16.
 */

var generateGridKey = function (x, y) {

    return x + "_" + y;

};


var Grid = function (x, y) {

    this.id = generateGridKey(x, y);
    this.x = x;
    this.y = y;

};

Grid.prototype = {

    constructor: Grid,

    clear: function (context) {

        context.clearRect(this.x * GRID_WIDTH - 1, this.y * GRID_HEIGHT - 1, GRID_WIDTH + 2, GRID_HEIGHT + 2);
    },

    draw: function (context) {

        var px = this.x * GRID_WIDTH;
        var py = this.y * GRID_HEIGHT;

        var color = arguments.length > 1 ? arguments[1] : "#FCFF18";

        context.clearRect(px, py, GRID_WIDTH, GRID_HEIGHT);
        context.strokeRect(px, py, GRID_WIDTH, GRID_HEIGHT);
        context.fillStyle = color;
        context.fillRect(px, py, GRID_WIDTH, GRID_HEIGHT);

    },

};

/**
 * 区域格
 * */
var AreaGrid = function (x, y, area) {

    Grid.prototype.constructor.call(this, x, y);
    this.area = area;

};

AreaGrid.prototype = Object.create(Grid.prototype);

Object.assign(AreaGrid.prototype, {

    constructor: AreaGrid,

    draw: function (context) {

        Grid.prototype.draw.call(this, context);

        var px = this.x * GRID_WIDTH;
        var py = this.y * GRID_HEIGHT;

        // context.clearRect(px, py, GRID_WIDTH, GRID_HEIGHT);
        // context.fillStyle = "#FCFF18";
        // context.fillRect(px, py, GRID_WIDTH, GRID_HEIGHT);

        context.fillStyle = "#000000";
        context.font="8px Arial";
        context.fillText("区" + this.area, px + 3, py + 17);
    },

});


/**
 * 地形格
 * */
var TerrainGrid = function (x, y, type) {

    Grid.prototype.constructor.call(this, x, y);
    this.type = type;

};

TerrainGrid.prototype = Object.create(Grid.prototype);

Object.assign(TerrainGrid.prototype, {

    constructor: TerrainGrid,

    isSolid: function () {

        return (this.type & SOLID) > 0;

    },

    draw: function (context) {

        var color;

        if ((this.type & SOLID) > 0) {

            color = "#ff0000";

        } else if ((this.type & MASK) > 0) {

            color = "#00ff00";

        } else if ((this.type & WATER) > 0) {

            color = "#41c3ff";

        } else if ((this.type & JUMP) > 0) {

            color = "#ba55d3";

        } else if ((this.type & SAFE) > 0) {

            color = "#5CACEE";

        } else {

            color = "#ffff00";

        }

        Grid.prototype.draw.call(this, context, color);

        var px = this.x * GRID_WIDTH;
        var py = this.y * GRID_HEIGHT;
        context.fillStyle = "#000000";
        context.font="14px Arial";

        var t = this.type;
        var c = 0;

        do {

            ++c;

        } while ((t = Math.floor(t / 10)) != 0)

        context.fillText(this.type, px + 8 - c * 2, py + 17);

    },
});
