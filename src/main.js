/**
 * Created by Administrator on 2017/4/24.
 */

// For version detection, set to min. required Flash Player version, or 0 (or 0.0.0), for no version detection.
var swfVersionStr = "11.4.0";
// To use express install, set to playerProductInstall.swf, otherwise the empty string.
var xiSwfUrlStr = "playerProductInstall.swf";
var flashvars = {};
var params = {};
params.quality = "high";
params.bgcolor = "#000000";
params.allowscriptaccess = "always";
params.allowfullscreen = "true";
var attributes = {};
attributes.id = "MapConfigData";
attributes.name = "MapConfigData";
attributes.align = "middle";
swfobject.embedSWF(
    "MapConfigData.swf", "flashContent",
    "0", "0",
    swfVersionStr, xiSwfUrlStr,
    flashvars, params, attributes);
// JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.
swfobject.createCSS("#flashContent", "display:block;text-align:left;");

$(document).ready(function(){


    window.URL = window.URL || window.webkitURL;
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

    //菜单控制
    new MenuFile();
    new MenuConfig();

    var w = getValidWidth($("#mapImg").width());
    var h = getValidHeight($("#mapImg").height());

    mapName = "2.jpg";

    gridWidth = Math.floor(w / GRID_WIDTH);
    gridHeight = Math.floor(h / GRID_HEIGHT);

    //范围选择器
    var selector = new RangeSelector();

    areaLayer = new AreaLayer("areaLayer", selector, w, h);
    terrainLayer = new TerrainLayer("terrainLayer", selector, w, h);
    delaunayLayer = new DelaunayLayer("delaunayLayer", selector, w, h);
    areaLayer.setEnable(false);
    terrainLayer.setEnable(true);
    delaunayLayer.setEnable(false)
    areaLayer.isClear = false;
    terrainLayer.isClear = false;
    delaunayLayer.isClear = false;

    //地表编辑设置
    $("#terrainSelect input[name='editorType']").click(function () {

        areaLayer.setEnable(false);
        terrainLayer.setEnable(false);
        delaunayLayer.setEnable(false)
        areaLayer.isClear = false;
        terrainLayer.isClear = false;
        delaunayLayer.isClear = false;
        var value = parseInt($(this).val());

        if (value == 0) {
            areaLayer.setEnable(true);
        } else if (value == 1) {
            terrainLayer.setEnable(true);
        } else if(value == 2) {
            areaLayer.setEnable(true);
            areaLayer.isClear = true;
        }else if(value == 3) {
            terrainLayer.setEnable(true);
            terrainLayer.isClear = true;
        }else if(value == 4) {
            delaunayLayer.setEnable(true);

        }else if(value == 5) {
            delaunayLayer.setEnable(true);
            delaunayLayer.isClear = true;
        }

    });

    var sceneXElement = $("#sceneX");
    var sceneYElement = $("#sceneY");

    $("#terrainLayer").mousemove(function(event) {

        sceneXElement.text(event.offsetX);
        sceneYElement.text(event.offsetY);

    });

    $("#areaAlphaSet").slider({
        formatter: function(value) {

            areaLayer && areaLayer.setOpacity(value);

            return value;
        }
    });

    $("#terrainAlphaSet").slider({
        formatter: function(value) {

            terrainLayer && terrainLayer.setOpacity(value);

            return value;
        }
    });

});
