var Vector2f = function(x,y)
{
    this.x = x;
    this.y = y;
}

Vector2f.prototype = {
    constructor: Vector2f,
    equals:function (p) {
        return p.y == this.y && p.x == this.x;
    },

    subtrac:function (p) {
        return new Vector2f(this.x - p.x, this.y - p.y) ;
    },
    
    dot:function (p) {
        return x * p.x + y * p.y;
    }
}
