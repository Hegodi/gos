// Minimal Canvas2D-like context that records drawing calls and serializes them to SVG.
// Implements only the subset of the CanvasRenderingContext2D API used by drawing.js,
// simulation.js and tools.js, so the same draw functions can render to either target.
class SvgContext2D
{
	constructor(width, height)
	{
		this.width = width;
		this.height = height;
		this.elements = [];

		this.fillStyle = "#000000";
		this.strokeStyle = "#000000";
		this.lineWidth = 1;
		this.font = "10px sans-serif";
		this.textAlign = "start";

		this.transform = "matrix(1,0,0,1,0,0)";
		this.pathData = "";
	}

	setTransform(a, b, c, d, e, f)
	{
		this.transform = `matrix(${a},${b},${c},${d},${e},${f})`;
	}

	clearRect()
	{
		// No-op: SVG output starts from a blank canvas.
	}

	beginPath()
	{
		this.pathData = "";
	}

	closePath()
	{
		this.pathData += "Z ";
	}

	moveTo(x, y)
	{
		this.pathData += `M ${x} ${y} `;
	}

	lineTo(x, y)
	{
		this.pathData += `L ${x} ${y} `;
	}

	rect(x, y, w, h)
	{
		this.pathData += `M ${x} ${y} h ${w} v ${h} h ${-w} Z `;
	}

	arc(x, y, r, startAngle, endAngle, anticlockwise = false)
	{
		let delta = endAngle - startAngle;
		if (!anticlockwise && delta < 0)
		{
			delta += 2 * Math.PI;
		}
		else if (anticlockwise && delta > 0)
		{
			delta -= 2 * Math.PI;
		}

		if (Math.abs(delta) >= 2 * Math.PI - 1e-9)
		{
			// SVG arcs can't span a full circle in one segment, split it in two.
			let mid = startAngle + delta / 2;
			this.pathData += arcSegmentPath(x, y, r, startAngle, mid, anticlockwise);
			this.pathData += arcSegmentPath(x, y, r, mid, endAngle, anticlockwise);
		}
		else
		{
			this.pathData += arcSegmentPath(x, y, r, startAngle, endAngle, anticlockwise);
		}
	}

	stroke()
	{
		this.elements.push(`<path d="${this.pathData.trim()}" fill="none" stroke="${this.strokeStyle}" stroke-width="${this.lineWidth}" transform="${this.transform}"/>`);
	}

	fill()
	{
		this.elements.push(`<path d="${this.pathData.trim()}" fill="${this.fillStyle}" stroke="none" transform="${this.transform}"/>`);
	}

	fillText(text, x, y)
	{
		let anchor = {left: "start", center: "middle", right: "end", start: "start", end: "end"}[this.textAlign] ?? "start";
		let match = /([\d.]+)px\s+(.+)/.exec(this.font);
		let fontSize = match ? match[1] : "10";
		let fontFamily = match ? match[2] : "sans-serif";
		this.elements.push(`<text x="${x}" y="${y}" fill="${this.fillStyle}" font-family="${fontFamily}" font-size="${fontSize}" text-anchor="${anchor}" transform="${this.transform}">${escapeXml(String(text))}</text>`);
	}

	toSvgString(cropRect = null)
	{
		let vx = 0, vy = 0, vw = this.width, vh = this.height;
		if (cropRect != null)
		{
			vx = cropRect.x;
			vy = cropRect.y;
			vw = cropRect.w;
			vh = cropRect.h;
		}

		return `<svg xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" viewBox="${vx} ${vy} ${vw} ${vh}">` +
			`<rect x="0" y="0" width="${this.width}" height="${this.height}" fill="#000000"/>` +
			this.elements.join("\n") +
			`</svg>`;
	}
}

function arcSegmentPath(x, y, r, a0, a1, anticlockwise)
{
	let startX = x + r * Math.cos(a0);
	let startY = y + r * Math.sin(a0);
	let endX = x + r * Math.cos(a1);
	let endY = y + r * Math.sin(a1);
	let largeArc = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
	let sweep = anticlockwise ? 0 : 1;
	return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} ${sweep} ${endX} ${endY} `;
}

function escapeXml(text)
{
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
