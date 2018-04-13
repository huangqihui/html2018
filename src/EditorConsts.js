/**
 * Created by Administrator on 2017/4/24.
 */

if (!Object.assign) {
    // 定义assign方法
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(target) { // assign方法的第一个参数
            'use strict';
            // 第一个参数为空，则抛错
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            // 遍历剩余所有参数
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                // 参数为空，则跳过，继续下一个
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }
                nextSource = Object(nextSource);

                // 获取改参数的所有key值，并遍历
                var keysArray = Object.keys(nextSource);
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    // 如果不为空且可枚举，则直接浅拷贝赋值
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}

//格子宽度
const GRID_WIDTH = 25;
//格子高度
const GRID_HEIGHT = 25;

const MAPZONE_WIDTH = 256;
const MAPZONE_HEIGHT = 256;

//障碍点
const SOLID = 1;
//遮罩
const MASK = 2;
//水路
const WATER = 4;
//跳点
const JUMP = 8;
//安全区
const SAFE = 16;

//区域的canvas层
var areaLayer;
//地形的canvas层
var terrainLayer;

var areaPanel;

var delaunayLayer;

var gridWidth, gridHeight;

var mapName;

function getValidWidth(width) {

    return Math.ceil(width / GRID_WIDTH) * GRID_WIDTH;

}

function getValidHeight(height) {

    return Math.ceil(height / GRID_HEIGHT) * GRID_HEIGHT;

}