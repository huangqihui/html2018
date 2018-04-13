/**
 * Created by Administrator on 2017/4/25.
 */

var link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link );

var Exporter = function () {

    this._exportObjs = [];

}

Exporter.prototype = {

    constructor: Exporter,


    export: function (output, filename, type) {

        this._exportObjs.push({output: output, filename: filename, type: type});

        if (!this._isExporting) this.exportNext();

        // var blob;
        //
        // if (typeof window.Blob == "function") {
        //     blob = new Blob([output], {type: type});
        // } else {
        //     var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
        //     var bb = new BlobBuilder();
        //     bb.append(output);
        //     blob = bb.getBlob(type);
        // }
        //
        // var objectURL = URL.createObjectURL( blob );
        //
        // if ('download' in link) {
        //     link.href = objectURL;
        //     link.download = filename;
        //     var evt = document.createEvent("MouseEvents");
        //     evt.initEvent("click", true, true);
        //     link.dispatchEvent(evt);
        // } else if (navigator.msSaveBlob) {
        //     navigator.msSaveBlob(blob, filename);
        // } else {
        //     location.href = objectURL;
        // }

    },

    exportNext: function () {

        var params = this._exportObjs.shift();

        if (!params) {
            this._isExporting = false;
            alert("导出完成");
            return;
        }

        this._isExporting = true;

        var output = params["output"];
        var filename = params["filename"];
        var type = params["type"];

        if (typeof window.Blob == "function") {
            blob = new Blob([output], {type: type});
        } else {
            var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
            var bb = new BlobBuilder();
            bb.append(output);
            blob = bb.getBlob(type);
        }

        var objectURL = URL.createObjectURL( blob );

        if ('download' in link) {
            link.href = objectURL;
            link.download = filename;
            var evt = document.createEvent("MouseEvents");
            evt.initEvent("click", true, true);
            link.dispatchEvent(evt);
        } else if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            location.href = objectURL;
        }

        setTimeout(this.exportNext.bind(this), 200);

    },

};