const MaxBounces = 10;
const MaxDistanceBetweenBounces = 10000;
const ErrorTolerance = 1e-12;
const SelectDstSqr = 250;
const VERSION = "v1.1"


class Ray
{
	constructor()
	{
		this.points = new Array();
	}

	addPoint(x, y)
	{
		this.points.push({x : x, y: y});
	}
}

class Simulation
{
	constructor(context, canvas)
	{
		this.context = context;
		this.canvas = canvas;
		this.arraySources = new Array();
		this.arrayPasiveElements = new Array();
		this.rays = new Array();

		this.activeElement = null;
		this.isActiveElementNew = false;
		this.gridEnabled = false;
		this.gridSize = 50;
		this.showDetails = false;

		this.toolRule = new Ruler();
		this.toolPortractor = new Portractor();
	}

	reset()
	{
		this.arraySources.length = 0;
		this.arrayPasiveElements.length = 0;
		this.rays.length = 0;
		this.activeElement = null;
		this.isActiveElementNew = false;
		this.refresh();
	}

	addSourcePoint(numberRays)
	{
		this.activeElement = new SourcePoint(-1000, -1000, numberRays);
		this.isActiveElementNew = true;
	}

	addSourceBeam(length, numberRays)
	{
		this.activeElement = new SourceBeam(-1000, -1000, length, numberRays);
		this.isActiveElementNew = true;
	}

	addMirrorFlat(size)
	{
		this.activeElement = new SurfaceFlat(-1000, -1000, size, true);
		this.isActiveElementNew = true;
	}

	addMirrorCurved(radius, arcAngle)
	{
		this.activeElement = new SurfaceCurved(-1000, -1000, radius, arcAngle, true);
		this.isActiveElementNew = true;
	}

	addBloquer(size)
	{
		this.activeElement = new SurfaceFlat(-1000, -1000, size, false);
		this.isActiveElementNew = true;
	}

	addConvergingLens(size, focalLength)
	{
		this.activeElement = new ThinLens(-1000, -1000, size, focalLength, true);
		this.isActiveElementNew = true;
	}

	addDivergingLens(size, focalLength)
	{
		this.activeElement = new ThinLens(-1000, -1000, size, focalLength, false);
		this.isActiveElementNew = true;
	}

	addThickLens(r1, r2)
	{
		this.activeElement = new ThickLens(r1, r2);
		this.isActiveElementNew = true;
		console.log("Add thick lens", this.activeElement);
	}

	confirmAddActiveElement()
	{
		if (this.activeElement == null)
		{
			return;
		}

		switch(this.activeElement.elementType)
		{
			case (ElementSourcePoint):
			case (ElementSourceBeam):
				this.arraySources.push(this.activeElement)
				break;
			case (ElementMirrorFlat):
			case (ElementMirrorCurved):
			case (ElementLensConverging):
			case (ElementLensDiverging):
			case (ElementBlocker):
			case (ElementThickLens):
				this.arrayPasiveElements.push(this.activeElement);
				break;
		}
		this.isActiveElementNew = false;
		this.refresh();
	}

	refresh()
	{
		this.calculateRayTrace();
		this.render();
	}

	changePositionActiveElement(x, y, recalculate)
	{
		if (this.activeElement == null)
		{
			return;
		}

		this.activeElement.x = x;
		this.activeElement.y = y;
		this.activeElement.Update();
		if (recalculate)
		{
			this.calculateRayTrace();
		}
		this.render();
	}

	canSelect(x, y, targetX, targetY)
	{
		let dx = x - targetX;
		let dy = y - targetY;
		return (dx * dx + dy * dy < SelectDstSqr);
	}

	trySelectElement(x, y)
	{
		this.activeElement = null;
		// Sources
		for(let i=0; i<this.arraySources.length; i++)
		{
			if (this.canSelect(x, y, this.arraySources[i].x, this.arraySources[i].y))
			{
				this.activeElement = this.arraySources[i];
			}
		}

		//  Elements
		for (let i=0; i<this.arrayPasiveElements.length; i++)
		{
			if (this.canSelect(x, y, this.arrayPasiveElements[i].x, this.arrayPasiveElements[i].y))
			{
				this.activeElement = this.arrayPasiveElements[i];
			}
		}
		this.render();
	}

	tryDeleteElement(x, y)
	{
		this.activeElement = null;
		this.isActiveElementNew = false;
		// Sources
		for(let i=0; i<this.arraySources.length; i++)
		{
			if (this.canSelect(x, y, this.arraySources[i].x, this.arraySources[i].y))
			{
				this.arraySources.splice(i, 1);
				this.refresh();
				return;
			}
		}

		// Elements
		for (let i=0; i<this.arrayPasiveElements.length; i++)
		{
			if (this.canSelect(x, y, this.arrayPasiveElements[i].x, this.arrayPasiveElements[i].y))
			{
				this.arrayPasiveElements.splice(i, 1);
				this.refresh();
				return;
			}
		}
	}

	DeleteActiveElement()
	{
		for(let i=0; i<this.arraySources.length; i++)
		{
			if (this.arraySources[i] == this.activeElement)
			{
				this.arraySources.splice(i, 1);
				this.activeElement = null;
				this.isActiveElementNew = false;
				this.refresh();
				return;
			}
		}

		// Elements
		for (let i=0; i<this.arrayPasiveElements.length; i++)
		{
			if (this.arrayPasiveElements[i] == this.activeElement)
			{
				this.arrayPasiveElements.splice(i, 1);
				this.activeElement = null;
				this.isActiveElementNew = false;
				this.refresh();
				return;
			}
		}

	}

	cloneActiveElement()
	{
		if (this.activeElement == null || this.isActiveElementNew)
		{
			return;
		}


		let newElement = null;
		let copyAll = true;
		switch(this.activeElement.elementType)
		{
			case (ElementSourcePoint):
				newElement = new SourcePoint(0,0,10);
				break;
			case (ElementSourceBeam):
				newElement = new SourceBeam(0,0,10, 10);
				break;
			case (ElementMirrorFlat):
				newElement = new SurfaceFlat(0,0,10, true);
				break;
			case (ElementMirrorCurved):
				newElement = new SurfaceCurved(0,0,10, 10, true)
				break;
			case (ElementLensConverging):
				newElement = new ThinLens(0,0,10,10, true);
				break;
			case (ElementLensDiverging):
				newElement = new ThinLens(0,0,10,10, false);
				break;
			case (ElementBlocker):
				newElement = new SurfaceFlat(0,0,10, true);
				break;
			case (ElementThickLens):
				newElement = this.activeElement.Clone();
				copyAll = false;
				break;
		}

		if (copyAll)
		{
			newElement = Object.assign(newElement, this.activeElement)
		}
		this.activeElement = newElement;
		this.isActiveElementNew = true;

		this.render();
	}


	render()
	{
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Grid
		this.context.strokeStyle = "#444444";
		this.context.lineWidth = 0.5;
		if (this.gridEnabled)
		{
			let numWidth = this.canvas.width / this.gridSize + 1;
			let numHeight = this.canvas.height / this.gridSize + 1;
			console.log("Grid Size: " + this.gridSize);
			let x = 0;
			for (let i=0; i<numWidth; i++, x += this.gridSize)
			{
				DrawGridLine(this.context,x, 0, x, this.canvas.height);
			}

			let y = 0;
			for (let i=0; i<numHeight; i++, y+=this.gridSize)
			{
				DrawGridLine(this.context,0, y, this.canvas.width, y);
			}
		}

		this.context.strokeStyle = "#888800";
		this.context.lineWidth = 1.0;
		for(let i=0; i<this.rays.length; i++)
		{
			DrawRay(this.context,this.rays[i]);
		}


		// Sources
		for(let i=0; i<this.arraySources.length; i++)
		{
			if (this.arraySources[i].elementType == ElementSourcePoint)
			{
				DrawSourcePoint(this.context,this.arraySources[i], false);
			}
			else if (this.arraySources[i].elementType == ElementSourceBeam)
			{
				DrawSourceBeam(this.context,this.arraySources[i], false);
			}
		}

		// Elements
		for (let i=0; i<this.arrayPasiveElements.length; i++)
		{
			if (this.arrayPasiveElements[i].elementType == ElementMirrorFlat)
			{
				DrawMirroFlat(this.context,this.arrayPasiveElements[i], false);
			}
			if (this.arrayPasiveElements[i].elementType == ElementMirrorCurved)
			{
				DrawMirroCurved(this.context,this.arrayPasiveElements[i], false, this.showDetails);
			}
			else if (this.arrayPasiveElements[i].elementType == ElementLensConverging)
			{
				DrawLensConverging(this.context,this.arrayPasiveElements[i], false, this.showDetails);
			}
			else if (this.arrayPasiveElements[i].elementType == ElementLensDiverging)
			{
				DrawLensDiverging(this.context,this.arrayPasiveElements[i], false, this.showDetails);
			}
			else if (this.arrayPasiveElements[i].elementType == ElementBlocker)
			{
				DrawBloquer(this.context,this.arrayPasiveElements[i], false);
			}
			else if (this.arrayPasiveElements[i].elementType == ElementThickLens)
			{
				DrawThickLens(this.context,this.arrayPasiveElements[i], false, this.showDetails);
			}
		}

		if (this.activeElement != null)
		{
			if (this.isActiveElementNew)
			{
				switch(this.activeElement.elementType)
				{
					case (ElementSourcePoint):
						DrawSourcePoint(this.context,this.activeElement, true);
						break;
					case (ElementSourceBeam):
						DrawSourceBeam(this.context,this.activeElement, true);
						break;
					case (ElementMirrorFlat):
						DrawMirroFlat(this.context,this.activeElement, true);
						break;
					case (ElementMirrorCurved):
						DrawMirroCurved(this.context,this.activeElement, true);
						break;
					case (ElementLensConverging):
						DrawLensConverging(this.context,this.activeElement, true);
						break;
					case (ElementLensDiverging):
						DrawLensDiverging(this.context,this.activeElement, true);
						break;
					case (ElementBlocker):
						DrawBloquer(this.context,this.activeElement, true);
						break;
					case (ElementThickLens):
						DrawThickLens(this.context,this.activeElement, true);
						break;
				}

			}
			else
			{
				this.context.strokeStyle = "white";
				this.context.lineWidth = 2.0;
				this.context.beginPath();
				this.context.arc(this.activeElement.x, this.activeElement.y, 15, 0, Math.PI*2, false);
				this.context.stroke();
				this.context.closePath();
			}
		}
		else
		{
			this.toolRule.Draw(this.context)
			this.toolPortractor.Draw(this.context);
		}
	}

	calculateRayTrace()
	{
		this.rays.length = 0;

		for(let i=0; i<this.arraySources.length; i++)
		{
			let source = this.arraySources[i];
			if (source.elementType == ElementSourcePoint)
			{
				let angle = 0.0;
				let deltaAngle = 2* Math.PI / (source.numberRays);
				for (let j=0; j<source.numberRays; j++, angle += deltaAngle)
				{
					let dirX = Math.cos(angle);
					let dirY = Math.sin(angle);
					let ray = this.calculateRay({x: source.x, y: source.y}, {x: dirX, y:dirY});
					this.rays.push(ray);
				}
			}
			else if (source.elementType == ElementSourceBeam)
			{
				let lengthX = source.tangentX * source.length;
				let lengthY = source.tangentY * source.length;
				let x0 = source.x - lengthX * 0.5;
				let y0 = source.y - lengthY * 0.5;
				let deltaX = lengthX / (source.numberRays - 1);
				let deltaY = lengthY / (source.numberRays - 1);
				for (let j=0; j<source.numberRays; j++)
				{
					let ray = this.calculateRay({x: x0 + deltaX * j, y: y0 + j * deltaY}, {x: source.normalX, y: source.normalY});
					this.rays.push(ray);
				}
			}
		}
	}

	calculateRay(pos, dir)
	{
		let ray = new Ray();
		ray.addPoint(pos.x, pos.y);
		let numBounces = 0;
		let done = false;
		let lastPoint = pos;
		let elementType = null;
		while (numBounces < MaxBounces && !done)
		{
			// Find first bounce
			let firstBounce = null;
			let firstElement = null;
			let p0 = lastPoint;
			let p1 = {x: lastPoint.x + MaxDistanceBetweenBounces*dir.x, y: lastPoint.y + MaxDistanceBetweenBounces*dir.y};
			for (let i=0; i<this.arrayPasiveElements.length; i++)
			{
				let element = this.arrayPasiveElements[i];
				let bounce = null;
				switch(element.elementType)
				{
					case ElementLensConverging:
					case ElementLensDiverging:
					case ElementMirrorFlat:
					case ElementBlocker:
						let lengthHalfX = element.tangentX * element.length * 0.5 ;
						let lengthHalfY = element.tangentY * element.length * 0.5 ;
						let p2 = {x: element.x - lengthHalfX,  y: element.y - lengthHalfY};
						let p3 = {x: element.x + lengthHalfX,  y: element.y + lengthHalfY};
						bounce = intersectionLineVsLine(p0, p1, p2, p3, true);
						break;
					case ElementMirrorCurved:
						bounce = intersectionLineVsCircle(p0, p1, element.GetCenter(), element.radius, element.normalX, element.normalY, element.arcAngle);
						break;
					case ElementThickLens:
						let result = intersectionWithThickLense(p0, p1, element);
						bounce = result.bounce;
						element = result.element;
						break;

				}

				if (bounce != null && bounce.t > ErrorTolerance)
				{
					if (firstBounce == null || bounce.t < firstBounce.t)
					{
						firstBounce = bounce;
						firstElement = element;
					}
				}
			}

			// Resolve bounce
			if (firstBounce != null)
			{
				ray.addPoint(firstBounce.x, firstBounce.y);
				switch(firstElement.elementType)
				{
					case ElementLensConverging:
						dir = calculateLens(dir, firstBounce, firstElement, false);
						break;
					case ElementLensDiverging:
						dir = calculateLens(dir, firstBounce, firstElement, true);
						break;
					case ElementMirrorFlat:
						dir = calculateReflectionFlat(dir, firstElement);
						break;
					case ElementMirrorCurved:
						dir = calculateReflectionCurved(dir, firstBounce, firstElement);
						break;
					case ElementBlocker:
						done = true;
						break;
					case ElementThickLens:
						console.log("ERROR:: this should never be hit!!")
						break;
					case ElementInterfaceCurve:
					case ElementInterfaceFlat:
						dir = RefractionSurface(dir, firstBounce, firstElement)
						break;
				}
				lastPoint = {x: firstBounce.x, y:firstBounce.y};
				numBounces++;
				// This should never happen!! but it seeoms sometimes it does due to some numeric rounding :(
				if (dir == null)
				{
					done = true;
				}
			}
			else
			{
				ray.addPoint(p1.x, p1.y);
				done = true;
			}
		}

		return ray;
	}

	disableAllTools()
	{
		this.toolRule.Reset();
		this.toolRule.isActive = false;

		this.toolPortractor.Reset();
		this.toolPortractor.isActive = false;
	}
}
