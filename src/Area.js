/**
 * Created by Administrator on 2017/6/19.
 */

/**
 * 区域邻居对
 * */
var AreaNeighborPair = function (area0, area1) {

    this.area0 = area0;
    this.area1 = area1;

};

AreaNeighborPair.prototype = {

    constructor: AreaNeighborPair,

    /**
     * 是否属于邻居对一员
     * */
    isRefArea: function (area) {

        return this.area0 == area || this.area1 == area;

    }

};

var AreaViewNode = function (area) {

    UI.Panel.prototype.constructor.call(this);

    this.area = area;
    this._checkBox = new UI.Checkbox();


    this.add(this._checkBox);

    $( this._checkBox.dom).attr("name", "areaNode");
    $( this._checkBox.dom).attr("value", area);

    this.add(new UI.Text("区" + area));

};

AreaViewNode.prototype = Object.create(UI.Panel.prototype);

Object.assign(AreaViewNode.prototype, {

    constructor: AreaViewNode,

    isSelected: function () {

        return this._checkBox.getValue();

    },

    setSelected : function (value) {

        this._checkBox.setValue(value);

    },

    setDisabled: function (value) {

        this._checkBox.setDisabled(value);

    },


});


/**
 * 基于模式框的区域配置面板
 * */
var AreaConfigPanel = function () {

    UI.Panel.prototype.constructor.call(this);

    this._neighborPairs = [];

    this._select = new UI.Select();
    this.add(this._select);


    this._nodeList = [];
    this._nodeDiv = new UI.Panel();
    this.add(this._nodeDiv);

    $(this.dom).css("width", "100%");

    $("#areaLink").append(this.dom);

    $(this._select.dom).change(this.selectAreaNodeHandler.bind(this));
    $("#saveArea").click(this.saveAreaCFG.bind(this));

};

AreaConfigPanel.prototype = Object.create(UI.Panel.prototype);

Object.assign(AreaConfigPanel.prototype, {

    constructor: AreaConfigPanel,

   getAllNeighbors: function () { return this._neighborPairs; },

   setAllNeighbors: function (value) { this._neighborPairs = value; },

   /**
    * 选择不同区域的处理函数
    * */
   selectAreaNodeHandler: function () {

       //下拉框中选择的区域
        var curArea =  $(this._select.dom).val();

        var nbs = this.getNeighbors(curArea);

       var selected, disabled;

       for (var i = 0; i < this._nodeList.length; ++i) {

           disabled = this._nodeList[i].area == curArea;

           this._nodeList[i].setDisabled(disabled);

           if (disabled) {

               this._nodeList[i].setSelected(false);
               continue;

           }

           selected = false;
           var j = 0;

           while (!selected && j < nbs.length) {

               selected = nbs[j++].isRefArea(this._nodeList[i].area);

           }

           this._nodeList[i].setSelected(selected);

        }

   },

   /**
    * 是否已经存在两个区域的邻居对象
    * */
   hasNeighborPair: function (area0, area1) {

        var np;

        for (var i = 0; i < this._neighborPairs.length; ++i) {

            np = this._neighborPairs[i];
            if (np.isRefArea(area0) && np.isRefArea(area1)) return true;

        }

        return false;

   },

   /**
    * 获得指定区域的邻居对象列表
    * */
   getNeighbors: function (area) {

       var nbs = [];

       var np;

       for (var i = 0; i < this._neighborPairs.length; ++i) {

           np = this._neighborPairs[i];
           if (np.isRefArea(area)) nbs.push(np);
       }

       return nbs;

   },


   /**
    * 保存当前区域的邻居对象
    * */
   saveAreaCFG: function () {

        var curArea =  $(this._select.dom).val();

        var node, neighborArea;

        for (var i = 0; i < this._nodeList.length; ++i) {

            node = this._nodeList[i];
            if (node.isSelected()) {

                neighborArea = node.area;

                if (this.hasNeighborPair(curArea, neighborArea)) continue;

                this._neighborPairs.push(new AreaNeighborPair(curArea, neighborArea));

            }

        }


   },

   /**
    * 根据地图上的区域更新区域面板
    * */
   updateByAreas: function (areaList) {

       this._select.clear();
       this._nodeDiv.clear();

       this._nodeList = [];

       var i = 0;

       var options = [];

       var option;

       for (i = 0; i < areaList.length; ++i) {

           option = "<option value='" + areaList[i] + "'>区";

           option += areaList[i] + "</option>";

           options[areaList[i]] = option;

       }

       this._select.setOptions(options);

       var avn;

       for (i = 0; i < areaList.length; ++i) {

           avn = new AreaViewNode(areaList[i]);
           this._nodeDiv.add(avn);

           this._nodeList.push(avn)

       }

       if (areaList.length > 0) {

           this._select.setValue(areaList[0]);
           this.selectAreaNodeHandler();

       }


   }

});