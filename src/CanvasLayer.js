/**
 * Created by Administrator on 2017/6/16.
 */
var CanvasLayer = function(id, rangeSelector, w, h) {

    this._id = id;
    //canvas元素
    this._canvas = document.getElementById(id);
    //2d渲染上下文
    this._context = this._canvas.getContext("2d");
    //是否能够操作
    this._enable = false;
    //当前是否为清除操作
    this.isClear = false;
    //选择器
    this._selector = rangeSelector;

    //格子集合
    this._grids = {};

    this.resizeCanvas(w, h);

};

CanvasLayer.prototype = {

    constructor: CanvasLayer,

    getEnable: function () { return this._enable || this.isClear; },

    setEnable: function (value) {

        this._enable = value;

        var elements = $("#terrainSelect input[name='" + this._id + "']");

        if (value) {

            elements.removeAttr("disabled");
            $(this._canvas).css("z-index", 1);

        } else {

            elements.attr("disabled", "true");
            $(this._canvas).css("z-index", 0);

        }

    },

    setOpacity: function (value) {  $(this._canvas).css("opacity",value); },

    resizeCanvas: function (w, h) {

        $(this._canvas).attr("width", w);
        $(this._canvas).attr("height", h);

    },

    /**
     * 添加格子
     * */
    addGrid: function (grid) {

        this._grids[grid.id] = grid;
        grid.draw(this._context);

    },

    /**
     * 删除一个格
     */
    removeGrid : function (id) {

        var grid = this._grids[id];
        if (grid == null) return;
        delete this._grids[id];
        grid.clear(this._context);
    },

    /**
     * 获得格
     * */
    getGrid: function (x, y) {

        return this._grids[generateGridKey(x, y)];

    },


    /**
     * 移除所有格子
     * */
    removeAllGrids: function () {

        var grid;
        for (var key in this._grids) {
            grid = this._grids[key];
            grid.clear(this._context);
        }
        this._grids = {};
    }

};

/**
 * 区域层
 * */
var AreaLayer = function (id, rangeSelector, w, h) {

    this._areaList = {};
    CanvasLayer.prototype.constructor.call(this, id, rangeSelector, w, h);
    rangeSelector.addCallback(this.updateArea.bind(this));

};

AreaLayer.prototype = Object.create(CanvasLayer.prototype);

Object.assign(AreaLayer.prototype, {

    constructor: AreaLayer,

    getAllAreas: function () {

        var list = [];

        var grid;

        for (var key in this._areaList) {

            list.push(key);

        }

        list.sort(function (a0, a1) {

            return a0 - a1;

        });

        return list;

    },

    addGrid: function (grid) {

        var oldGrid = this._grids[grid.id];
        if (oldGrid) {

            this.removeGrid(grid.id);

        }

        CanvasLayer.prototype.addGrid.call(this, grid);

        if (this._areaList.hasOwnProperty(grid.area)) ++this._areaList[grid.area];
        else this._areaList[grid.area] = 1;

    },

    removeGrid : function (id) {

        var grid = this._grids[id];
        if (grid && this._areaList.hasOwnProperty(grid.area)) {


            if (--this._areaList[grid.area] == 0) {

                delete this._areaList[grid.area];

            }
        }

        CanvasLayer.prototype.removeGrid.call(this, id);

    },

    /**
     * 移除所有格子
     * */
    removeAllGrids: function () {

        CanvasLayer.prototype.removeAllGrids.call(this);

        this._areaList = {};

    },


    updateArea: function (selector) {

        if (!this.getEnable()) return;

        var rect = selector.getRect();
        var gridMinX = Math.floor(rect.x / GRID_WIDTH);
        var gridMaxX = Math.floor((rect.x + rect.width) / GRID_WIDTH);

        var gridMinY = Math.floor(rect.y / GRID_HEIGHT);
        var gridMaxY = Math.floor((rect.y + rect.height) / GRID_HEIGHT);


        var i, j;

        if (this.isClear) {

            for (i = gridMinX; i <= gridMaxX; ++i) {

                for (j = gridMinY; j <= gridMaxY; ++j) {

                    this.removeGrid(i + "_" + j);

                }

            }

        } else {

            var area = $("#areaId").val();

            if (!area) {

                alert("请输入区域id");
                return;

            }

            for (i = gridMinX; i <= gridMaxX; ++i) {

                for (j = gridMinY; j <= gridMaxY; ++j) {

                    var terrain = new AreaGrid(i, j, parseInt(area));
                    this.addGrid(terrain);

                }

            }

        }

    },

});

var DelaunayLayer = function (id, rangeSelector, w, h) {
    CanvasLayer.prototype.constructor.call(this, id, rangeSelector, w, h);
    rangeSelector.addCallback(this.addCorner.bind(this));
    this.delaunay = new Delaunay();
    this.corners = new Array();
    this.availableEdges = new Array();

}
DelaunayLayer.prototype = Object.create(CanvasLayer.prototype);
Object.assign(DelaunayLayer.prototype, {

    constructor: DelaunayLayer,


    addCorner:function(selector){

        if (!this.getEnable()) return;
        var rect = selector.getRect();
        var gridMinX = Math.floor(rect.x / GRID_WIDTH);
        var gridMaxX = Math.floor((rect.x + rect.width) / GRID_WIDTH);

        var gridMinY = Math.floor(rect.y / GRID_HEIGHT);
        var gridMaxY = Math.floor((rect.y + rect.height) / GRID_HEIGHT);

        if(gridMaxX > gridWidth)return;
        if(gridMaxY > gridHeight)return;

        var i, j;

        if (this.isClear) {

            for (i = gridMinX; i <= gridMaxX; ++i) {

                for (j = gridMinY; j <= gridMaxY; ++j) {
                   // this.removeGrid(i + "_" + j);
                    this._context.clearRect(rect.x,rect.y,rect.width,rect.height);

                    for(var round = this.corners.length - 1;round >= 0 ;round --)
                    {
                        if(this.corners[round].x == i && this.corners[round].y == j)
                        {
                            this.corners[round].clear();
                            this.corners.splice(round,1);
                            this._context.clearRect(0,0,5000,5000);
                            break;
                        }
                    }
                }
            }

        } else {

            var type = 0;

            $("#terrainSelect input[name='delaunayLayer']:checked").each(function () {

                //console.log($(this).val())
                type = parseInt($(this).val())

            });

            for (i = gridMinX; i <= gridMaxX; ++i) {

                for (j = gridMinY; j <= gridMaxY; ++j) {
                   // var terrain = new TerrainGrid(i, j, type);
                  //  this.addGrid(terrain);
                    var corner = new Corner(i,j,type);
                    if(this.cornersIndexOf(corner) == -1)
                    {
                        this.corners.push(corner);
                        corner.draw(this._context);
                    }
                }
            }
        };

        if(this.corners.length > 4)
        {
            this.availableEdges = new Array();
            this._context.clearRect(0,0,gridWidth * GRID_WIDTH,gridHeight * GRID_HEIGHT);
            this.delaunay.triangulate(this.corners);
            var edges = this.delaunay.edges;
            for(var k = 0;k<edges.length;k++)
            {
                var start = edges[k].startC;
                var end = edges[k].endC;
                start.draw(this._context);
                // end.draw(this._context);
                var color = "#ffffff"
                if(start.cornerType != 1 && end.cornerType != 1)
                {
                    color = "#000000"
                    this.availableEdges.push(edges[k]);
                }
                this._context.strokeStyle = color;
                this._context.beginPath()
                this._context.moveTo(start.x * GRID_WIDTH + GRID_WIDTH * 0.5,start.y * GRID_HEIGHT + GRID_HEIGHT * 0.5 );
                this._context.lineTo(end.x * GRID_WIDTH + GRID_WIDTH * 0.5,end.y * GRID_HEIGHT + GRID_HEIGHT * 0.5 );
                //    this._context.moveTo(start.x,start.y );
                //     this._context.lineTo(end.x ,end.y );
                this._context.stroke();
            }

        }
    },
    removeAllCorner:function () {
        this._context.clearRect(0,0,gridWidth * GRID_WIDTH,gridHeight * GRID_HEIGHT);
        this.corners = new Array();
    },

    cornersIndexOf:function (corner) {
        if(!corner)return -1;
        for(var i = 0;i<this.corners.length;i++)
        {
            if(this.corners[i].equals(corner))
                return i;
        }

        return -1;
    }
});
/**
 * 地形层
 * */
var TerrainLayer = function (id, rangeSelector, w, h) {

    CanvasLayer.prototype.constructor.call(this, id, rangeSelector, w, h);
    rangeSelector.addCallback(this.updateTerrain.bind(this));
};

TerrainLayer.prototype = Object.create(CanvasLayer.prototype);

Object.assign(TerrainLayer.prototype, {

    constructor: TerrainLayer,

    updateTerrain: function (selector) {

        if (!this.getEnable()) return;

        var rect = selector.getRect();
        var gridMinX = Math.floor(rect.x / GRID_WIDTH);
        var gridMaxX = Math.floor((rect.x + rect.width) / GRID_WIDTH);

        var gridMinY = Math.floor(rect.y / GRID_HEIGHT);
        var gridMaxY = Math.floor((rect.y + rect.height) / GRID_HEIGHT);


        var i, j;

        if (this.isClear) {

            for (i = gridMinX; i <= gridMaxX; ++i) {

                for (j = gridMinY; j <= gridMaxY; ++j) {

                    this.removeGrid(i + "_" + j);

                }

            }

        } else {

            var type = 0;

            $("#terrainSelect input[name='terrainLayer']:checked").each(function () {

                type |= parseInt($(this).val());

            });

            for (i = gridMinX; i <= gridMaxX; ++i) {

                for (j = gridMinY; j <= gridMaxY; ++j) {

                    var terrain = new TerrainGrid(i, j, type);
                    this.addGrid(terrain);

                }

            }

        }

    },

});