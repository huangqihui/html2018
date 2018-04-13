/**
 * Created by Administrator on 2017/4/25.
 */
var MenuFile = function () {

    this._fileMenu = $("#fileMenu");
    this._itemOpen = $("#open");
    this._itemExportTerrain = $("#exportTerrain");
    this._itemExportMapZone = $("#exportMapZone");
    this._itemExportThumbnail = $("#exportThumbnail");

    this._fileInput = document.createElement( 'input' );
    this._fileInput.type = 'file';
    this._importer = new Importer();
    this._exporter = new Exporter();

    this.addEventListeners();

};

MenuFile.prototype = {

    constructor: MenuFile,

    addEventListeners: function () {

        this._fileInput.addEventListener( 'change', this.loadFileHandler.bind(this));
        this._itemOpen.click(this.openFileHandler.bind(this));

        this._itemExportTerrain.click(this.exportTerrainHandler.bind(this));
        this._itemExportMapZone.click(this.exportMapZoneHandler.bind(this));
        this._itemExportThumbnail.click(this.exportThumbnailHandler.bind(this));

    },

    loadFileHandler: function (event) {

        this._importer.importFile(this._fileInput.files[ 0 ] );

    },

    openFileHandler: function (event) {

        this._fileInput.click();

    },

    exportTerrainHandler: function (event) {

        var size = 4 + gridWidth * gridHeight * 2;
        var buffer = new ArrayBuffer(size);
        // var dv = new DataView(buffer);

        // var offset = 0;

        var swfArray = [];
        swfArray.push(gridHeight, gridWidth);

        // dv.setUint16(offset, gridWidth); offset += 2;
        // dv.setUint16(offset, gridHeight); offset += 2;

        var filename = mapName.split('.').shift();

        var xmlContent =
            "<map version=\"1.0\" orientation=\"orthogonal\" renderorder=\"right-down\" width=\"" + gridWidth + "\" height=\"" + gridHeight + "\" tilewidth=\"" + 1 + "\" tileheight=\"" + 1 + "\" nextobjectid=\"1\">\n" +

                "\t<properties>\n" +
                    "\t\t<property name=\"direction8\" value=\"1\"/>\n" +
                "\t</properties>\n" +
                "\t<tileset firstgid=\"0\" name=\"" + filename +  "\" tilewidth=\"" + 1 + "\" tileheight=\"" + 1 + "\" tilecount=\"" + (gridWidth * gridHeight)  + "\" columns=\"" + gridWidth + "\">\n" +
                    "\t\t<image source=\"" + mapName + "\" width=\"" + (gridWidth * 1) + "\" height=\"" + (gridHeight *1) + "\"/>\n" +
                    "\t\t<tile id=\"0\">\n" +
                        "\t\t\t<properties>\n" +
                            "\t\t\t\t<property name=\"障碍点\" value=\"9\"/>\n" +
                        "\t\t\t</properties>\n" +
                    "\t\t</tile>\n" +
                    "\t\t<tile id=\"1\">\n" +
                        "\t\t\t<properties>\n" +
                            "\t\t\t\t<property name=\"可通过点\" value=\"1\"/>\n" +
                        "\t\t\t</properties>\n" +
                    "\t\t</tile>\n" +
                "\t</tileset>\n" +
                "\t<layer name=\"块层 1\" width=\"" + gridWidth + "\" height=\"" + gridHeight + "\">\n" +
                    "\t\t<data>\n";

        var key, areaGrid, terrainGrid, terrainType, areaID;

        for (var i = 0; i < gridHeight; ++i) {

            for (var j = 0; j < gridWidth; ++j) {

                key = generateGridKey(j, i);

                areaGrid = areaLayer.getGrid(j, i);
                terrainGrid = terrainLayer.getGrid(j, i);

                areaID = areaGrid ? areaGrid.area : 0;
                terrainType = terrainGrid ? terrainGrid.type : 0;

                swfArray.push(terrainType, areaID);

                // dv.setUint8(offset, terrainType); offset += 1;
                // dv.setUint8(offset, areaID); offset += 1;
                xmlContent += "\t\t\t<tile gid=\"" + ((terrainGrid != null && terrainGrid.isSolid()) ? 0 : 1)  + "\"/>\n";
            }
        }



        xmlContent += "\t\t</data>\n" +
            "\t</layer>\n" +
            "</map>\n";

        var tris = delaunayLayer.delaunay.triangles;
        var edges = delaunayLayer.availableEdges;
        var trisCount = tris.length
        swfArray.push(trisCount);
        for(var trisIndex = 0; trisIndex < trisCount; trisIndex ++) {
            var tempTri = tris[trisIndex];
            swfArray.push(tempTri.cornerA.x,tempTri.cornerA.y,tempTri.cornerA.cornerType,
                tempTri.cornerB.x,tempTri.cornerB.y,tempTri.cornerB.cornerType,
                tempTri.cornerC.x,tempTri.cornerC.y,tempTri.cornerC.cornerType)
        }

        var edgesCount = edges.length;
        swfArray.push(edgesCount);
        for(var edgesIndex = 0; edgesIndex < edgesCount; edgesIndex ++) {
            var tempEdge = edges[edgesIndex];
            swfArray.push(tempEdge.startC.x,tempEdge.startC.y,tempEdge.startC.cornerType,
                tempEdge.endC.x,tempEdge.endC.y,tempEdge.endC.cornerType);
        }

        if (areaPanel) {

            var nbs = areaPanel.getAllNeighbors();
            for (var j = 0; j < nbs.length; ++j) {

                swfArray.push(parseInt(nbs[j].area0), parseInt(nbs[j].area1));

            }

        }


        try {

            swfobject.getObjectById("MapConfigData").compress(swfArray);

        } catch (error) {

            console.log(error.message);
            setTimeout(function () {

                swfobject.getObjectById("MapConfigData").compress(swfArray);

            }, 200);

        }


        // new Exporter().export(dv.buffer, filename + ".config", "application/octet-binary");
        this._exporter.export(xmlContent, filename + ".tmx", "text/xml");

    },

    exportMapZoneHandler: function (event) {

        var img = document.getElementById("mapImg");

        var zoneWidth = Math.ceil($("#mapImg").width() / MAPZONE_WIDTH);
        var zoneHeight = Math.ceil($("#mapImg").height() / MAPZONE_HEIGHT);


        var canvas = document.createElement("canvas");
        canvas.setAttribute("width", MAPZONE_WIDTH);
        canvas.setAttribute("height", MAPZONE_HEIGHT);
        var ctx = canvas.getContext("2d");

        var extensive = mapName.split('.').pop();

        var toEx = extensive == "jpg" ? "jpeg" : "png";

        for (var i = 0; i < zoneHeight; ++i) {

            for (var j = 0; j < zoneWidth; ++j) {

                ctx.clearRect(0, 0, MAPZONE_WIDTH, MAPZONE_HEIGHT);

                ctx.drawImage(img, j * MAPZONE_WIDTH, i * MAPZONE_HEIGHT, MAPZONE_WIDTH, MAPZONE_HEIGHT, 0,0, MAPZONE_WIDTH, MAPZONE_HEIGHT);

                var code = canvas.toDataURL("image/" + toEx);

                var parts = code.split(';base64,');
                var contentType = parts[0].split(':')[1];
                var raw = window.atob(parts[1]);
                var rawLength = raw.length;

                var uInt8Array = new Uint8Array(rawLength);

                for (var k = 0; k < rawLength; ++k) {
                    uInt8Array[k] = raw.charCodeAt(k);
                }

                this._exporter.export(uInt8Array.buffer, (j + "_" + i) + "."+ extensive, contentType);

            }

        }

        // alert("地图导出完成");

    },

    exportThumbnailHandler: function () {

        var img = document.getElementById("mapImg");

        var iw = $("#mapImg").width();
        var ih = $("#mapImg").height();

        var s = Math.min(630 / iw, 500 / ih);

        var cw = iw * s;
        var ch = ih * s;

        var canvas = document.createElement("canvas");
        canvas.setAttribute("width", cw);
        canvas.setAttribute("height", ch);

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, cw, ch);

        var code = canvas.toDataURL("image/jpeg");

        var parts = code.split(';base64,');
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var k = 0; k < rawLength; ++k) {
            uInt8Array[k] = raw.charCodeAt(k);
        }

        this._exporter.export(uInt8Array.buffer, mapName.split(".").shift() + ".jpg", contentType);

    },

}

function mapLoaded() {

    var w = getValidWidth($("#mapImg").width());
    var h = getValidHeight($("#mapImg").height());

    gridWidth = Math.floor(w / GRID_WIDTH);
    gridHeight = Math.floor(h / GRID_HEIGHT);

    if (areaLayer) {
        areaLayer.resizeCanvas(w, h);
        areaLayer.removeAllGrids();
    }
    if (terrainLayer) {
        terrainLayer.resizeCanvas(w, h);
        terrainLayer.removeAllGrids();
    }
    if (delaunayLayer) {
        delaunayLayer.resizeCanvas(w, h);
        delaunayLayer.removeAllCorner()
        delaunayLayer.removeAllGrids();
    }
}

function saveMapTerrain(bytes) {

    var data = new Uint8Array(bytes.length);

    for (var i = 0; i < bytes.length; ++i) {

        data[i] = bytes[i];

    }
    var filename = mapName.split('.').shift();
    new Exporter().export(data.buffer, filename + ".terrain", "application/octet-binary");

}



function openMapTerrain(bytes) {

    if (!areaLayer || !terrainLayer) return;

    areaLayer.removeAllGrids();
    terrainLayer.removeAllGrids();

    gridHeight = bytes.shift();
    gridWidth = bytes.shift();

    var t,a, gridX, gridY, index, area, terrain;

    var len = Math.min(2 * gridWidth * gridHeight, bytes.length);

    var i = 0;

    for (i = 0; i < len; i += 2) {

        t = bytes[i];
        a = bytes[i+1];

        index = i / 2;

        gridX = index % gridWidth;
        gridY = Math.floor(index / gridWidth);

        if (a > 0) {

            area = new AreaGrid(gridX, gridY, a);
            areaLayer.addGrid(area);

        }

        if ((t & (SOLID | MASK | WATER | JUMP | SAFE)) > 0) {

            terrain = new TerrainGrid(gridX, gridY, t);
            terrainLayer.addGrid(terrain);

        }

    }


    var anps = [];

    while (i < bytes.length) {

        if (!areaPanel) areaPanel = new AreaConfigPanel();
        anps.push(new AreaNeighborPair(bytes[i++], bytes[i++]));

    }

    areaPanel.setAllNeighbors(anps);

}
