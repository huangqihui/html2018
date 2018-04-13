var Delaunay = function () {
    this.edges = new Array();
    this.triangles = new Array();

}

Delaunay.prototype = {
    constructor:Delaunay,
    createOutside:function (corners) {
         corners.sort(function (a0, a1) {

            return a0.x - a1.x;

        });
        for(var i =0;i< corners.length ;i++)
        {
           // console.log(indexArr[i].x);
          //  console.log(corners[i].x);
        }
       // var cur = corners[indexArr[0]];
        var cur = corners[0];
        var next;
        var start = cur;
        var minAngle;
        var vec = new Vector2f(0, 1);// 初始给一个向下的向量
        var tempVec = new Vector2f(0,0);
        do{
            minAngle = 7;
           for(var j =0;j< corners.length ;j++)
           {
                var temp = corners[j];
               if(temp == cur) continue;
               tempVec.x = temp.x - cur.x;
               tempVec.y = temp.y - cur.y;
               var tempAngle = this.getAngleBetween(vec, tempVec);
               if(tempAngle < minAngle) {
                   minAngle = tempAngle;
                   next = temp;
               }
           }

           var edge = new Edge(cur, next);
            cur.edgeList.push(edge);
            next.edgeList.push(edge);
            this.edges.push(edge);
            // 换成下一个点
            vec.x = next.x - cur.x;
            vec.y = next.y - cur.y;
            cur = next;
            next = null;

        }while (cur != start);
    },

    getAngleBetween:function (vec1, vec2) {
        var len1 = Math.sqrt(vec1.x * vec1.x + vec1.y * vec1.y);
        var len2 = Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y);
        var angle = Math.acos((vec1.x * vec2.x + vec1.y * vec2.y) / (len1 * len2));
        // 保留小数点后10位，向下取整
        angle = Math.floor(angle * 10000000000) / 10000000000;
        return angle;
    },
    clearArr:function (arr) {
        if(!arr)return;
        for(var i = arr.length - 1;i>=0;i--)
        {
            arr.pop();
        }
    },

    triangulate:function (corners) {
        this.clearArr(this.edges);
        this.clearArr(this.triangles);
        for(var i =0;i< corners.length ;i++)
        {
            this.clearArr(corners[i].edgeList)
        }
        // 首先生成外围边，按照逆时针生成
        this.createOutside(corners);

        // 按边逐步插入Delaunay三角形，只需遍历一遍所有边，因为每条边至多生成一次三角形
        var vec1 = new Vector2f(0,0);
        var vec2 = new Vector2f(0,0);
        var vec3 = new Vector2f(0,0);
        for(var j = 0; j < this.edges.length; j++) {
            var edge = this.edges[j];
            var target = null;
            var maxAngle23 = 0;
            var maxAngle12 = 0;
            if(edge.leftTri != null && edge.rightTri != null) continue;
            if(edge.leftTri != null) edge.reverse();
            for(var m =0;m< corners.length ;m++)
            {
                var corner = corners[m];
                vec1.x = edge.endC.x - edge.startC.x;
                vec1.y = edge.endC.y - edge.startC.y;
                vec2.x = corner.x - edge.startC.x;
                vec2.y = corner.y - edge.startC.y;
                // 如果点不在边左边就忽略
                if(vec1.x * vec2.y - vec2.x * vec1.y >= 0) continue;
                vec3.x = corner.x - edge.endC.x;
                vec3.y = corner.y - edge.endC.y;
                var angle23 = this.getAngleBetween(vec2, vec3);
                if(angle23 > maxAngle23) {
                    maxAngle23 = angle23;
                    maxAngle12 = this.getAngleBetween(vec1, vec2);
                    target = corner;
                } else if(angle23 == maxAngle23) {
                    var angle12 = this.getAngleBetween(vec1, vec2);
                    if(angle12 > maxAngle12) {
                        maxAngle12 = angle12;
                        target = corner;
                    }
                }
            }
            if(target == null) continue;
            // 获取到了与当前边形成Delaunay三角形的点了，开始构建三角形
            var tempEdges;
            var tempEdge;
            // 首先构建三角形
            var tri = new Triangle(target, edge.endC, edge.startC);

            this.triangles.push(tri);
            // 创建两条边
            tempEdges = target.edgeList;
            var startEdge = null;
            var endEdge = null;
            for(var n =0;n< tempEdges.length ;n++)
            {
                tempEdge = tempEdges[n];
                var otherCorner = tempEdge.getOtherCorner(target);
                if(otherCorner == edge.startC) {
                    startEdge = tempEdge;
                } else if(otherCorner == edge.endC) {
                    endEdge = tempEdge;
                }
            }

            if(startEdge != null) {
                startEdge.rightTri = tri;
            } else {
                startEdge = new Edge(edge.startC, target);
                startEdge.rightTri = tri;
                startEdge.startC.edgeList.push(startEdge);
                startEdge.endC.edgeList.push(startEdge);
                this.edges.push(startEdge);
            }

            if(endEdge != null) {
                endEdge.leftTri = tri;
            } else {
                endEdge = new Edge(edge.endC, target);
                endEdge.leftTri = tri;
                endEdge.startC.edgeList.push(endEdge);
                endEdge.endC.edgeList.push(endEdge);
                this.edges.push(endEdge);
            }
            // 设置三角形的相邻三角形
            var otherTri;
            otherTri = edge.getOtherTriangle(tri);
            tri.nextTriA = otherTri;
            if(otherTri != null) otherTri.nextTriB = tri;
            otherTri = startEdge.getOtherTriangle(tri);
            tri.nextTriB = otherTri;
            // 可能是A边或C边，用B角做判断
            if(otherTri != null) {
                if(otherTri.cornerB == startEdge.endC) otherTri.nextTriA = tri;
                else otherTri.nextTriC = tri;
            }

            otherTri = endEdge.getOtherTriangle(tri);
            tri.nextTriC = otherTri;
            if(otherTri != null) otherTri.nextTriB = tri;
        }
    }
}