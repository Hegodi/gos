
function DrawGridLine(context, x0, y0, x1, y1)
{
	context.beginPath();
	context.moveTo(x0, y0);
	context.lineTo(x1, y1);
	context.stroke();
	context.closePath();
}

function DrawMirroFlat(context, mirror, ghost)
{
	if (ghost)
	{
		context.fillStyle = context.strokeStyle = "#550000"
	}
	else
	{
		context.fillStyle = context.strokeStyle = "#CC0000"
	}
	context.lineWidth = 3;
	context.beginPath();
	context.moveTo(mirror.x - mirror.tangentX * mirror.length * 0.5, mirror.y - mirror.tangentY * mirror.length * 0.5);
	context.lineTo(mirror.x + mirror.tangentX * mirror.length * 0.5, mirror.y + mirror.tangentY * mirror.length * 0.5);
	context.stroke();
	context.closePath();

	context.beginPath();
	context.arc(mirror.x, mirror.y, 4, 0, 2*Math.PI);
	context.fill();
	context.closePath();
}

function DrawMirroCurved(context, mirror, ghost, showDetails)
{
	if (ghost)
	{
		context.fillStyle = context.strokeStyle = "#550000"
	}
	else
	{
		context.fillStyle = context.strokeStyle = "#CC0000"
	}

    let angle0 = mirror.angle - mirror.arcAngle/2;
    let angle1 = mirror.angle + mirror.arcAngle/2;

    let center = mirror.GetCenter();
	context.lineWidth = 3;
	context.beginPath();
	context.arc(center.x, center.y, mirror.radius, angle0 * Math.PI / 180.0, angle1 * Math.PI / 180.0);
	context.stroke();
	context.closePath();

	context.beginPath();
	context.arc(mirror.x, mirror.y, 4, 0, 2*Math.PI);
	context.fill();
	context.closePath();

    if (showDetails)
    {
        DrawCurvedSurfaveDetails(context,mirror);
    }
}

function DrawBloquer(context, mirror, ghost)
{
	if (ghost)
	{
		context.fillStyle = context.strokeStyle = "#555555"
	}
	else
	{
		context.fillStyle = context.strokeStyle = "#FFFFFF"
	}
	context.lineWidth = 3;
	context.beginPath();
	context.moveTo(mirror.x - mirror.tangentX * mirror.length * 0.5, mirror.y - mirror.tangentY * mirror.length * 0.5);
	context.lineTo(mirror.x + mirror.tangentX * mirror.length * 0.5, mirror.y + mirror.tangentY * mirror.length * 0.5);
	context.stroke();
	context.closePath();

	context.beginPath();
	context.arc(mirror.x, mirror.y, 4, 0, 2*Math.PI);
	context.fill();
	context.closePath();
}

function DrawSourcePoint(context, source, ghost)
{
	if (ghost)
	{
		context.fillStyle = context.strokeStyle = "#555500"
	}
	else
	{
		context.fillStyle = context.strokeStyle = "#FFFF00"
	}
	context.beginPath();
	context.arc(source.x, source.y, 5, 0, Math.PI*2, false);
	context.fill();
	context.closePath();
}

function DrawSourceBeam(context, source, ghost)
{
	if (ghost)
	{
		context.fillStyle = context.strokeStyle = "#555500"
	}
	else
	{
		context.fillStyle = context.strokeStyle = "#FFFF00"
	}
	context.lineWidth = 2;
	context.beginPath();
	context.moveTo(source.x - source.tangentX * source.length * 0.5, source.y - source.tangentY * source.length * 0.5);
	context.lineTo(source.x + source.tangentX * source.length * 0.5, source.y + source.tangentY * source.length * 0.5);
	context.stroke();
	context.closePath();

	context.beginPath();
	context.arc(source.x, source.y, 4, 0, 2*Math.PI);
	context.fill();
	context.closePath();
}

function DrawLensConverging(context, lens, ghost, showDetails)
{
	if (ghost)
	{
		context.fillStyle = context.strokeStyle = "#228822"
	}
	else
	{
		context.fillStyle = context.strokeStyle = "#66FF66"
	}
	let p0 = {x: lens.x - lens.tangentX * lens.length * 0.5, y: lens.y - lens.tangentY * lens.length * 0.5}
	let p1 = {x: lens.x + lens.tangentX * lens.length * 0.5, y: lens.y + lens.tangentY * lens.length * 0.5}

	context.beginPath();
	context.lineWidth = 2;
	context.moveTo(p0.x, p0.y);
	context.lineTo(p1.x, p1.y);
	context.stroke();

	context.moveTo(p0.x, p0.y);
	context.lineTo(p0.x + lens.tangentX * 8 + lens.normalX * 4, p0.y + lens.tangentY * 8 + lens.normalY * 4);
	context.moveTo(p0.x, p0.y);
	context.lineTo(p0.x + lens.tangentX * 8 - lens.normalX * 4, p0.y + lens.tangentY * 8 - lens.normalY * 4);

	context.moveTo(p1.x, p1.y);
	context.lineTo(p1.x - lens.tangentX * 8 + lens.normalX * 4, p1.y - lens.tangentY * 8 + lens.normalY * 4);
	context.moveTo(p1.x, p1.y);
	context.lineTo(p1.x - lens.tangentX * 8 - lens.normalX * 4, p1.y - lens.tangentY * 8 - lens.normalY * 4);

	context.stroke();
	context.closePath();

	context.beginPath();
	context.arc(lens.x, lens.y, 4, 0, 2*Math.PI);
	context.fill();
	context.closePath();

    if (showDetails)
    {
        DrawLensDetails(context, lens);
    }
}

function DrawLensDiverging(context, lens, ghost, showDetails)
{
	if (ghost)
	{
		context.fillStyle = context.strokeStyle = "#222288"
	}
	else
	{
		context.fillStyle = context.strokeStyle = "#6666FF"
	}
	let p0 = {x: lens.x - lens.tangentX * lens.length * 0.5, y: lens.y - lens.tangentY * lens.length * 0.5}
	let p1 = {x: lens.x + lens.tangentX * lens.length * 0.5, y: lens.y + lens.tangentY * lens.length * 0.5}

	context.beginPath();
	context.lineWidth = 2;
	context.moveTo(p0.x, p0.y);
	context.lineTo(p1.x, p1.y);
	context.stroke();

	context.moveTo(p0.x, p0.y);
	context.lineTo(p0.x - lens.tangentX * 8 + lens.normalX * 4, p0.y - lens.tangentY * 8 + lens.normalY * 4);
	context.moveTo(p0.x, p0.y);
	context.lineTo(p0.x - lens.tangentX * 8 - lens.normalX * 4, p0.y - lens.tangentY * 8 - lens.normalY * 4);

	context.moveTo(p1.x, p1.y);
	context.lineTo(p1.x + lens.tangentX * 8 + lens.normalX * 4, p1.y + lens.tangentY * 8 + lens.normalY * 4);
	context.moveTo(p1.x, p1.y);
	context.lineTo(p1.x + lens.tangentX * 8 - lens.normalX * 4, p1.y + lens.tangentY * 8 - lens.normalY * 4);

	context.stroke();
	context.closePath();

	context.beginPath();
	context.arc(lens.x, lens.y, 4, 0, 2*Math.PI);
	context.fill();
	context.closePath();

    if (showDetails)
    {
        DrawLensDetails(context, lens);
    }
}

function DrawLensDetails(context, lens)
{
    let f1 = {x: lens.x + lens.normalX * lens.focalLength, y: lens.y + lens.normalY * lens.focalLength};
    let f2 = {x: lens.x - lens.normalX * lens.focalLength, y: lens.y - lens.normalY * lens.focalLength};
    let f1_2 = {x: lens.x + lens.normalX * 2*lens.focalLength, y: lens.y + lens.normalY * 2*lens.focalLength};
    let f2_2 = {x: lens.x - lens.normalX * 2*lens.focalLength, y: lens.y - lens.normalY * 2*lens.focalLength};
    context.lineWidth = 0.5;

    context.beginPath();
    context.moveTo(lens.x, lens.y)
    context.lineTo(f1_2.x, f1_2.y);
    context.lineTo(f2_2.x, f2_2.y);
    context.stroke();
    context.closePath();

    context.beginPath();
    context.arc(f1.x, f1.y, 3, 0, 2 * Math.PI);
    context.fill();
    context.closePath();

    context.beginPath();
    context.arc(f2.x, f2.y, 3, 0, 2 * Math.PI);
    context.fill();
    context.closePath();
}

function DrawCurvedSurfaveDetails(context, surface)
{
    let center = surface.GetCenter();
    context.lineWidth = 0.5;

    context.beginPath();
    context.moveTo(surface.x, surface.y)
    context.lineTo(center.x, center.y)
    context.stroke();
    context.closePath();

    context.beginPath();
    context.arc(center.x, center.y, 3, 0, 2 * Math.PI);
    context.fill();
    context.closePath();
}


function DrawRay(context, ray)
{
	for(let j=1; j<ray.points.length; j++)
	{
		context.beginPath();
		context.moveTo(ray.points[j-1].x, ray.points[j-1].y);
		context.lineTo(ray.points[j].x, ray.points[j].y);
		context.stroke();
		context.closePath();
	}
}

function DrawThickLens(context, lens, ghost, showDetails)
{
	if (ghost)
	{
		context.fillStyle = context.strokeStyle = "#41758c"
	}
	else
	{
		context.fillStyle = context.strokeStyle = "#7ad7ff"
	}
	context.lineWidth = 3;

    let sA_angle0 = lens.surfaces[0].angle - lens.surfaces[0].arcAngle/2;
    let sA_angle1 = lens.surfaces[0].angle + lens.surfaces[0].arcAngle/2;
    let sA_center = lens.surfaces[0].GetCenter();
    let sB_angle0 = lens.surfaces[1].angle - lens.surfaces[1].arcAngle/2;
    let sB_angle1 = lens.surfaces[1].angle + lens.surfaces[1].arcAngle/2;
    let sB_center = lens.surfaces[1].GetCenter();

	context.beginPath();
	context.arc(sA_center.x, sA_center.y, lens.surfaces[0].radius, sA_angle0 * Math.PI / 180.0, sA_angle1 * Math.PI / 180.0);
	context.stroke();
	context.closePath();

	context.beginPath();
	context.arc(sB_center.x, sB_center.y, lens.surfaces[1].radius, sB_angle0 * Math.PI / 180.0, sB_angle1 * Math.PI / 180.0);
	context.stroke();
	context.closePath();

	for (let i=2; i<4; i++)
	{
		let sur = lens.surfaces[i];
		let p0 = {x: sur.x - sur.tangentX * sur.length * 0.5, y: sur.y - sur.tangentY * sur.length * 0.5}
		let p1 = {x: sur.x + sur.tangentX * sur.length * 0.5, y: sur.y + sur.tangentY * sur.length * 0.5}

		context.beginPath();
		context.moveTo(p0.x, p0.y);
		context.lineTo(p1.x, p1.y);
		context.stroke();
	}

    if (showDetails)
    {
        DrawCurvedSurfaveDetails(context, lens.surfaces[0]);
        DrawCurvedSurfaveDetails(context, lens.surfaces[1]);
    }

	/*
	context.strokeStyle = "#FFFFFF";
	for (let i=0; i<4; i++)
	{
		let sur = lens.surfaces[i];
		let p0 = {x: sur.x, y: sur.y};
		let p1 = {x: sur.x + sur.normalX * 100, y: sur.y + sur.normalY * 100};
		context.beginPath();
		context.moveTo(p0.x, p0.y);
		context.lineTo(p1.x, p1.y);
		context.stroke();

	}
	*/

	context.beginPath();
	context.arc(lens.x, lens.y, 4, 0, 2*Math.PI);
	context.fill();
	context.closePath();


}
