var Edge = function (startC,endC) {
    this.startC = startC;
    this.endC = endC;
    this.leftTri = null;
    this.rightTri = null;
}


Edge.prototype = {
    constructor:Edge,
    reverse:function () {
        var tempCorner = this.startC;
        this.startC = this.endC;
        this.endC = tempCorner;
        var tempTri = this.leftTri;
        this.leftTri = tempTri;
        this.rightTri = this.leftTri;
    },
    getOtherCorner:function (corner) {
        if(this.startC.equals(corner))
        {
            return this.endC;
        }
        if(this.endC.equals(corner))
        {
            return this.startC;
        }
        return null;
    },
    getOtherTriangle:function (tri) {
        if(tri == this.leftTri) return this.rightTri;
        if(tri == this.rightTri) return this.leftTri;
        return null;
    },

    clear:function () {
        this.startC = null;
        this.endC = null;
        this.leftTri = null;
        this.rightTri = null;
    }
}