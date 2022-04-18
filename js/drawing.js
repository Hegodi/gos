
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
		context.strokeStyle = "#550000"
	}
	else
	{
		context.strokeStyle = "#CC0000"
	}
	context.lineWidth = 3;
	context.beginPath();
	context.moveTo(mirror.x - mirror.tangentX * mirror.length * 0.5, mirror.y - mirror.tangentY * mirror.length * 0.5);
	context.lineTo(mirror.x + mirror.tangentX * mirror.length * 0.5, mirror.y + mirror.tangentY * mirror.length * 0.5);
	context.stroke();
	context.closePath();
}

function DrawMirroCurved(context, mirror, ghost)
{
	if (ghost)
	{
		context.strokeStyle = "#550000"
	}
	else
	{
		context.strokeStyle = "#CC0000"
	}
	context.lineWidth = 3;
	context.beginPath();
	//context.arc(mirror.x, mirror.y, mirror.radius, (mirror.angle - mirror.arcAngle/2) * Math.PI / 180.0, (mirror.angle + mirror.arcAngle/2) * Math.PI / 180.0);
	context.arc(mirror.x, mirror.y, mirror.radius, mirror.angle * Math.PI / 180.0, (mirror.angle + mirror.arcAngle) * Math.PI / 180.0);
	context.stroke();
	context.closePath();
}

function DrawBloquer(context, mirror, ghost)
{
	if (ghost)
	{
		context.strokeStyle = "#555555"
	}
	else
	{
		context.strokeStyle = "#FFFFFF"
	}
	context.lineWidth = 3;
	context.beginPath();
	context.moveTo(mirror.x - mirror.tangentX * mirror.length * 0.5, mirror.y - mirror.tangentY * mirror.length * 0.5);
	context.lineTo(mirror.x + mirror.tangentX * mirror.length * 0.5, mirror.y + mirror.tangentY * mirror.length * 0.5);
	context.stroke();
	context.closePath();
}

function DrawSourcePoint(context, source, ghost)
{
	if (ghost)
	{
		context.fillStyle = "#555500"
	}
	else
	{
		context.fillStyle = "#FFFF00"
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
		context.strokeStyle = "#555500"
	}
	else
	{
		context.strokeStyle = "#FFFF00"
	}
	context.lineWidth = 2;
	context.beginPath();
	context.moveTo(source.x - source.tangentX * source.length * 0.5, source.y - source.tangentY * source.length * 0.5);
	context.lineTo(source.x + source.tangentX * source.length * 0.5, source.y + source.tangentY * source.length * 0.5);
	context.stroke();
	context.closePath();
}

function DrawLensConverging(context, lens, ghost)
{
	if (ghost)
	{
		context.strokeStyle = "#228822"
	}
	else
	{
		context.strokeStyle = "#66FF66"
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
}

function DrawLensDiverging(context, lens, ghost)
{
	if (ghost)
	{
		context.strokeStyle = "#222288"
	}
	else
	{
		context.strokeStyle = "#6666FF"
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
