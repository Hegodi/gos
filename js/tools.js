class Ruler
{
    constructor()
    {
        this.points = new Array();
        this.isActive = false;
        this.distance = 0.0;
    }

    SetPoint(point)
    {
        this.points.push(point);
        if (this.points.length > 2)
        {
            this.points.length = 0;
        }
        if (this.points.length == 2)
        {
            let dx = this.points[0].x - this.points[1].x;
            let dy = this.points[0].y - this.points[1].y;
            this.distance = Math.sqrt(dx *dx + dy *dy);
        }
    }

    Draw(context)
    {
        if (!this.isActive)
        {
            return;
        }

        for (let i=0 ;i<this.points.length; i++)
        {
	        context.lineWidth = 2;
            context.strokeStyle = "#999999";
	        context.beginPath();
	        context.arc(this.points[i].x, this.points[i].y, 5, 0, Math.PI * 2);
	        context.stroke();
    	    context.closePath();

            if (i == 1)
            {
                let c = {x: (this.points[0].x + this.points[1].x) * 0.5, y: (this.points[0].y + this.points[1].y) * 0.5};

	            context.lineWidth = 5;
	            context.beginPath();
	            context.moveTo(this.points[i-1].x, this.points[i-1].y);
	            context.lineTo(this.points[i].x, this.points[i].y);
	            context.stroke();
    	        context.closePath();

                context.fillStyle = "#222222";
	            context.beginPath();
                context.rect(c.x-50, c.y-21, 100, 30);
                context.fill();
    	        context.closePath();

                context.fillStyle = "#FFFFFF";
                context.font = "20px sans";
                context.textAlign = "center";
                context.fillText(this.distance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), c.x, c.y);
            }
        }

    }

    Reset()
    {
        this.points.length = 0;
        this.distance = 0.0;
    }
}

class Portractor
{
    constructor()
    {
        this.points = new Array();
        this.isActive = false;
        this.angle = 0.0;
    }

    SetPoint(point)
    {
        this.points.push(point);
        if (this.points.length > 3)
        {
            this.points.length = 0;
        }
        if (this.points.length == 3)
        {
            let v1 = {x: this.points[1].x - this.points[0].x, y: this.points[1].y - this.points[0].y};
            let v2 = {x: this.points[2].x - this.points[0].x, y: this.points[2].y - this.points[0].y};
            let dot = v1.x * v2.x + v1.y * v2.y;
            this.angle = Math.acos(dot / (Math.sqrt(v1.x*v1.x + v1.y*v1.y) * Math.sqrt(v2.x*v2.x + v2.y*v2.y))) * 180.0 / Math.PI;
        }
    }

    Draw(context)
    {
        if (!this.isActive)
        {
            return;
        }

        let c = {x: 0.0, y: 0.0};
        for (let i=0 ;i<this.points.length; i++)
        {
	        context.lineWidth = 2;
            context.strokeStyle = "#999999";
	        context.beginPath();
	        context.arc(this.points[i].x, this.points[i].y, 5, 0, Math.PI * 2);
	        context.stroke();
    	    context.closePath();

            c.x += this.points[i].x;
            c.y += this.points[i].y;

            if (i > 0)
            {

	            context.lineWidth = 5;
	            context.beginPath();
	            context.moveTo(this.points[0].x, this.points[0].y);
	            context.lineTo(this.points[i].x, this.points[i].y);
	            context.stroke();
    	        context.closePath();

                if (i == 2)
                {
                    c.x /= 3;
                    c.y /= 3;
                    context.fillStyle = "#222222";
	                context.beginPath();
                    context.rect(c.x-50, c.y-21, 100, 30);
                    context.fill();
    	            context.closePath();

                    context.fillStyle = "#FFFFFF";
                    context.font = "20px sans";
                    context.textAlign = "center";
                    context.fillText(this.angle.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + "°", c.x, c.y);
                }
            }
        }
    }

    Reset()
    {
        this.points.length = 0;
        this.angle = 0.0;
    }
}
