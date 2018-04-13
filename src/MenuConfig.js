/**
 * Created by Administrator on 2017/6/19.
 */
var MenuConfig = function () {

    this._areaModal = $("#areaModal");

    this.addEventListeners();

};

MenuConfig.prototype = {

    constructor: MenuConfig,

    addEventListeners: function () {

        this._areaModal.click(this.areaModalHandler.bind(this));

    },

    areaModalHandler: function () {

        if (!areaPanel) areaPanel = new AreaConfigPanel();
        areaPanel.updateByAreas(areaLayer.getAllAreas());


    },

};