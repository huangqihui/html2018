var Triangle = function (a,b,c) {
    this.cornerA = a;
    this.cornerB = b;
    this.cornerC = c;
}

Triangle.prototype = {
        constructor: Triangle,
        isPointInside:function(point){
            var pA = new Vector2f(this.cornerA.x,this.cornerA.y);
            var pB = new Vector2f(this.cornerB.x,this.cornerB.y);
            var pC = new Vector2f(this.cornerC.x,this.cornerC.y);
            var v0 = pC.subtrac(pA);
            var v1 = pB.subtrac(pA);
            var v2 = point.subtrac(pA);

            var dot00 = v0.dot(v0);
            var dot01 = v0.dot(v1);
            var dot02 = v0.dot(v2);
            var dot11 = v1.dot(v1);
            var dot12 = v1.dot(v2);
            var inverDeno = 1 / (dot00 * dot11 - dot01 * dot01);
            var u = (dot11 * dot02 - dot01 * dot12) * inverDeno;
            if (u < 0 || u > 1) // if u out of range, return directly
            {
                 return false ;
            }
            var v = (dot00 * dot12 - dot01 * dot02) * inverDeno ;
            if (v < 0 || v > 1) // if v out of range, return directly
            {
                 return false ;
            }
            return u + v <= 1 ;
        }

}
