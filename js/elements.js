
const ElementInvalid = Symbol("Invalid");
const ElementSourcePoint = Symbol("SourcePoint");
const ElementSourceBeam = Symbol("SourceBeam");
const ElementMirrorFlat = Symbol("MirrorFlat");
const ElementMirrorCurved = Symbol("MirrorCurved");
const ElementLensConverging = Symbol("LensConverging");
const ElementLensDiverging = Symbol("LensDiverging");
const ElementBlocker = Symbol("Blocker");
const ElementThickLens = Symbol("ThickLens");
const ElementInterfaceCurve = Symbol("InterfaceCurve");
const ElementInterfaceFlat = Symbol("InterfaceFlat");

const RADIUS_INF = 100000;

function Distance2(p0, p1)
{
	let dx = p1.x - p0.x;
	let dy = p1.y - p0.y;
	return dx * dx + dy * dy;
}

function Distance(p0, p1)
{
	return Math.sqrt(Distance2(p0,p1));
}

function intersectionLineVsLine(p0, p1, p2, p3, onlyInside)
{
    let s1 = {x: p1.x - p0.x, y: p1.y - p0.y};
	let s2 = {x: p3.x - p2.x, y: p3.y - p2.y};

	let d = (-s2.x * s1.y + s1.x * s2.y);
	if (d == 0)
	{
		return null;
	}
	let s = (-s1.y * (p0.x - p2.x) + s1.x * (p0.y - p2.y)) / d;
	let t = (s2.x * (p0.y - p2.y) - s2.y * (p0.x - p2.x)) / d;

	if (!onlyInside || (s >= 0 && s <= 1 && t >= 0 && t <= 1))
	{
		// Collision detected
           return {t: t, x: p0.x + t * s1.x, y: p0.y + t * s1.y};
	}
	return null;
}

function intersectionLineVsCircle(p0, p1, C, r, nX, nY, arcAngle)
{
	let d = {x: p1.x - p0.x, y: p1.y - p0.y};
	let f = {x: p0.x - C.x, y:p0.y - C.y};

	let a = d.x * d.x + d.y * d.y;
	let b = 2 * (f.x * d.x + f.y * d.y);
	let c = (f.x * f.x + f.y * f.y ) - r * r;

	let discriminant = b * b - 4 * a * c;
	if (discriminant < 0)
	{
		return null;
	}
  	discriminant = Math.sqrt( discriminant );

	let t1 = (-b - discriminant)/(2*a);
	let t2 = (-b + discriminant)/(2*a);

	let bounce1 = {t: t1, x: p0.x + t1*d.x, y: p0.y + t1*d.y};
	let bounce2 = {t: t2, x: p0.x + t2*d.x, y: p0.y + t2*d.y};

	let dotMin = Math.cos(arcAngle * 0.5 * Math.PI / 180);

	if (bounce1.t > 0.0)
	{
		let br = {x: (bounce1.x - C.x)/r, y: (bounce1.y - C.y)/r}
		let dot = br.x * nX + br.y * nY;
		if (dot < dotMin)
		{
			bounce1.t = -1;
		}
	}

	if (bounce2.t > 0.0)
	{
		let br = {x: (bounce2.x - C.x)/r, y: (bounce2.y - C.y)/r}
		let dot = br.x * nX + br.y * nY;
		if (dot < dotMin)
		{
			bounce2.t = -1;
		}
	}

	if (bounce1.t > 0.0 && bounce2.t > 0.0)
	{
		if (bounce1.t < bounce2.t)
		{
			return bounce1;
		}
		else
		{
			return bounce2;
		}
	}
	else
	{
		if (bounce1.t > 0.0)
		{
			return bounce1;
		}
		else if (bounce2.t > 0.0)
		{
			return bounce2;
		}
	}
	return null;
}


function calculateReflectionFlat(rayDir, element)
{
    let tanCmp = rayDir.x * element.tangentX + rayDir.y * element.tangentY;
    let norCmp = rayDir.x * element.normalX + rayDir.y * element.normalY;

    return {x: tanCmp * element.tangentX - norCmp * element.normalX, y: tanCmp * element.tangentY - norCmp * element.normalY};
}

function calculateReflectionCurved(rayDir, bounce, element)
{
	let center = element.GetCenter();
	let normal = {x: (center.x - bounce.x)/element.radius, y: (center.y - bounce.y)/element.radius};
	let tangent = {x: normal.y, y: -normal.x}

    let tanCmp = rayDir.x * tangent.x + rayDir.y * tangent.y;
    let norCmp = rayDir.x * normal.x + rayDir.y * normal.y;

    return {x: tanCmp * tangent.x - norCmp * normal.x, y: tanCmp * tangent.y - norCmp * normal.y};
}

function calculateLens(rayDir, hitPos, lens, diverging)
{
	// TODO: this is overcomplicated, simplify
	let p = {x: hitPos.x - rayDir.x, y: hitPos.y - rayDir.y};
	let o = {x: lens.x, y: lens.y};
	let k = (p.x - lens.x) * lens.tangentX + (p.y-lens.y) * lens.tangentY;
	let h = {x: lens.x + lens.tangentX * k, y: lens.y + lens.tangentY * k}

	let f = 0.0;
	let dot = rayDir.x * lens.normalX + rayDir.y * lens.normalY;
	if (lens.x == hitPos.x && lens.y == hitPos.y)
	{
		return rayDir;
	}
	if (diverging)
	{
		dot *= -1;
	}

	if (dot > 0)
	{
	 	f = {x: lens.x + lens.normalX * lens.focalLength, y: lens.y + lens.normalY * lens.focalLength};
	}
	else
	{
	 	f = {x: lens.x - lens.normalX * lens.focalLength, y: lens.y - lens.normalY * lens.focalLength};
	}

	let intersection = intersectionLineVsLine(p, o, h, f, false)
	return {x: hitPos.x - intersection.x, y: hitPos.y - intersection.y};
}

class SourcePoint
{
	constructor(x, y, numberRays)
	{
		this.x = x;
		this.y = y;
		this.numberRays = numberRays;
        this.elementType = ElementSourcePoint;
	}

	Update() {}

	GetData()
	{
		return this.x.toString() + ";" + this.y.toString() + ";" + this.numberRays.toString();
	}


	SetFromData(data)
	{
		let bits = data.split(";");
		if (bits.length < 3)
		{
			throw(this.elementType.toString());
		}
		else
		{
			this.x = parseFloat(bits[0]);
			this.y = parseFloat(bits[1]);
			this.numberRays = parseInt(bits[2]);
		}
	}
}

class OrientableElement
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
		this.angle = 0.0;
		this.normalX = 0;
		this.normalY = 0;
		this.tangentX = 0;
		this.tangentY = 0;
		this.setAngle(0.0);
	}

	Update() {};

	setAngle(angle)
	{
		angle = parseFloat(angle);
		//console.log("Set Angle: " + angle.toString() + " this.angle: " + this.angle.toString());
		this.angle = angle;
		if (this.angle > 360.0) this.angle -= 360.0;
		else if (this.angle < 0.0) this.angle += 360.0;
		let angleRad = angle * Math.PI / 180.0;
		this.normalX = Math.cos(angleRad);
		this.normalY = Math.sin(angleRad);
		this.tangentX = - this.normalY;
		this.tangentY = this.normalX;
	}

	GetData()
	{
		return this.x.toString() + ";" + this.y.toString() + ";" + this.angle.toString();
	}

	SetFromData(data)
	{
		let bits = data.split(";");
		if (bits.length < 3)
		{
			throw("OrientableElement");
		}
		else
		{
			this.x = parseFloat(bits[0]);
			this.y = parseFloat(bits[1]);
			this.setAngle(parseFloat(bits[2]));
		}
	}
}

class SourceBeam extends OrientableElement
{
    constructor(x,y, length, numberRays)
    {
        super(x,y);
        this.length = length;
        this.numberRays = numberRays;
        this.elementType = ElementSourceBeam;
		this.setAngle(0.0);
    }

	GetData()
	{
		return super.GetData() + ";" +  this.length.toString() + ";" + this.numberRays.toString();
	}

	SetFromData(data)
	{
		super.SetFromData(data);

		let bits = data.split(";");
		if (bits.length < 5)
		{
			throw(this.elementType.toString());
		}
		else
		{
			this.length = parseFloat(bits[3]);
			this.numberRays = parseInt(bits[4]);
		}
	}
}

class SurfaceFlat extends OrientableElement
{
	constructor(x, y, length, mirror)
	{
		super(x,y)
		this.length = length;
		if (mirror)
		{
        	this.elementType = ElementMirrorFlat;
		}
		else
		{
			this.elementType = ElementBlocker;
		}
	}

	GetData()
	{
		return super.GetData() + ";" + this.length.toString();
	}

	SetFromData(data)
	{
		super.SetFromData(data);

		let bits = data.split(";");
		if (bits.length < 4)
		{
			throw(this.elementType.toString());
		}
		else
		{
			this.length = parseFloat(bits[3]);
		}
	}
}

class SurfaceCurved extends OrientableElement
{
	constructor(x, y, radius, arcAngle)
	{
		super(x,y)
		this.radius = radius;
		this.arcAngle = arcAngle;
 		this.elementType = ElementMirrorCurved;
	}

	GetData()
	{
		return super.GetData() + ";" + this.radius.toString() + ";" + this.arcAngle.toString();
	}

	GetCenter()
	{
    	let cx = this.x - this.normalX * this.radius;
    	let cy = this.y - this.normalY * this.radius;
		return {x: cx, y: cy};
	}

	SetFromData(data)
	{
		super.SetFromData(data);

		let bits = data.split(";");
		if (bits.length < 5)
		{
			throw(this.elementType.toString());
		}
		else
		{
			this.radius = parseFloat(bits[3]);
			this.arcAngle = parseFloat(bits[4]);
		}
	}
}

class InterfaceCurved extends SurfaceCurved
{
	constructor(x, y)
	{
		super(x,y,10, 30,)
 		this.elementType = ElementInterfaceCurve;
		this.n1 = 1.0;
		this.n2 = 2.0;
	}

}

class InterfaceFlat extends SurfaceFlat
{
	constructor(x, y)
	{
		super(x,y,10, false);
 		this.elementType = ElementInterfaceFlat;
		this.n1 = 1.0;
		this.n2 = 1.0;
	}
}

class ThinLens extends OrientableElement
{
	constructor(x, y, length, focalLength, converging)
	{
		super(x,y);
		this.length = length;
		this.focalLength = focalLength;
		this.converging = converging;
		if (this.converging)
		{
			this.elementType = ElementLensConverging;
		}
		else
		{
			this.elementType = ElementLensDiverging;
		}
	}

	GetData()
	{
		return super.GetData() + ";" + this.length.toString() + ";" + this.focalLength.toString();
	}

	SetFromData(data)
	{
		super.SetFromData(data);

		let bits = data.split(";");
		if (bits.length < 5)
		{
			throw(this.elementType.toString());
		}
		else
		{
			this.length = parseFloat(bits[3]);
			this.focalLength = parseInt(bits[4]);
		}
	}
}

class ThickLens extends OrientableElement
{
	constructor(r1, r2)
	{
		super(0.0, 0.0);
		this.height = 0.0;
		this.thickness = 0.0;
		this.surfaces = new Array();
		this.surfaces.push(new InterfaceCurved(0,0));
		this.surfaces.push(new InterfaceCurved(0,0));
		this.surfaces.push(new InterfaceFlat(0,0));
		this.surfaces.push(new InterfaceFlat(0,0));

		this.refractiveIndex = 2.0;
		this.elementType = ElementThickLens;

		this.surfaceAconvex = r1 >= 0.0;
		this.surfaceBconvex = r2 >= 0.0;
		this.edgesSurfaceA;
		this.edgesSurfaceB;

		this.SetValuesIfConsistent(150.0, 40.0, r1 == 0 ? RADIUS_INF : 200.0, r2 == 0 ? RADIUS_INF : 200.0);
		this.setAngle(0.0);
	}

	Update()
	{
		this.surfaces[0].x = this.x - this.normalX * this.thickness * 0.5;
		this.surfaces[0].y = this.y - this.normalY * this.thickness * 0.5;
		if (this.surfaceAconvex)
		{
			this.surfaces[0].n1 = 1.0;
			this.surfaces[0].n2 = this.refractiveIndex;
		}
		else
		{
			this.surfaces[0].n2 = 1.0;
			this.surfaces[0].n1 = this.refractiveIndex;
		}
		
		this.surfaces[1].x = this.x + this.normalX * this.thickness * 0.5;
		this.surfaces[1].y = this.y + this.normalY * this.thickness * 0.5;
		if (this.surfaceBconvex)
		{
			this.surfaces[1].n1 = 1.0;
			this.surfaces[1].n2 = this.refractiveIndex;
		}
		else
		{
			this.surfaces[1].n2 = 1.0;
			this.surfaces[1].n1 = this.refractiveIndex;
		}

		this.surfaces[2].n1 = 1.0;
		this.surfaces[2].n2 = this.refractiveIndex;

		this.surfaces[3].n1 = 1.0;
		this.surfaces[3].n2 = this.refractiveIndex;

		this.edgesSurfaceA = this.ComputeEdgesSurfaceA();
		this.edgesSurfaceB = this.ComputeEdgesSurfaceB();

		let cA = (1-Math.cos(0.5 * this.surfaces[0].arcAngle * Math.PI / 180.0)) * this.surfaces[0].radius;
		let cB = (1-Math.cos(0.5 * this.surfaces[1].arcAngle * Math.PI / 180.0)) * this.surfaces[1].radius;

		let offset = 0.0;
		let extraThickness = 0.0;
		if (this.surfaceAconvex)
		{
			extraThickness -= cA;
			offset += cA / 2;
		}
		else
		{
			extraThickness += cA;
			offset -= cA / 2;
		}

		if (this.surfaceBconvex)
		{
			extraThickness -= cB;
			offset -= cB / 2;
		}
		else
		{
			extraThickness += cB;
			offset += cB / 2;
		}

		this.surfaces[2].x = this.x + this.height * 0.5 * this.tangentX + this.normalX * offset;
		this.surfaces[2].y = this.y + this.height * 0.5 * this.tangentY + this.normalY * offset;
		this.surfaces[2].length = this.thickness + extraThickness;

		this.surfaces[3].x = this.x - this.height * 0.5 * this.tangentX + this.normalX * offset;
		this.surfaces[3].y = this.y - this.height * 0.5 * this.tangentY + this.normalY * offset;
		this.surfaces[3].length = this.thickness + extraThickness;


	}

	setAngle(angle)
	{
		super.setAngle(angle);
		try{

			if (this.surfaceAconvex)
			{
				this.surfaces[0].setAngle(angle+180);
			}
			else
			{
				this.surfaces[0].setAngle(angle);
			}

			if (this.surfaceBconvex)
			{
				this.surfaces[1].setAngle(angle);
			}
			else
			{
				this.surfaces[1].setAngle(angle+180);
			}
			this.surfaces[2].setAngle(angle + 90);
			this.surfaces[3].setAngle(angle - 90);
			this.Update();
		}
		catch(e)
		{

		}
	}

	GetCenterSurfaceA()
	{
		return this.surfaces[0].GetCenter();
	}

	GetCenterSurfaceB()
	{
		return this.surfaces[1].GetCenter();
	}

	ComputeEdgesSurfaceA()
	{
		return this.ComputeEdgesSurface(this.surfaces[0], -1);
	}

	ComputeEdgesSurfaceB()
	{
		return this.ComputeEdgesSurface(this.surfaces[1], 1);
	}

	ComputeEdgesSurface(surface, sign)
	{
		let cA = sign*Math.cos(0.5 * surface.arcAngle * Math.PI / 180.0) * surface.radius;
		let sA = Math.sin(0.5 * surface.arcAngle * Math.PI / 180.0) * surface.radius;
		let center = surface.GetCenter();
		let pU   = {x: center.x + this.normalX * cA + this.tangentX * sA, y: center.y + this.normalY * cA  + this.tangentY * sA}
		let pB = {x: center.x + this.normalX * cA - this.tangentX * sA, y: center.y + this.normalY * cA  - this.tangentY * sA}
		return {pU: pU , pB: pB }
	}

	SetValuesIfConsistent(height, thickness, radiusA, radiusB)
	{
		if (height/2 <= radiusA && height/2 <= radiusB)
		{
			this.height = height;
			this.surfaces[0].radius = radiusA;
			this.surfaces[1].radius = radiusB;
		}
		this.surfaces[0].arcAngle = 2 * Math.asin(this.height/(2 * this.surfaces[0].radius)) * 180.0 / Math.PI;
		this.surfaces[1].arcAngle = 2 * Math.asin(this.height/(2 * this.surfaces[1].radius)) * 180.0 / Math.PI;

		let thicknessMin = 0.0;
		if (this.surfaceAconvex)
		{
			thicknessMin += (1.0 - Math.cos(0.5*this.surfaces[0].arcAngle * Math.PI / 180)) * this.surfaces[0].radius ;
		}
		if (this.surfaceBconvex)
		{
			thicknessMin += (1.0 - Math.cos(0.5*this.surfaces[1].arcAngle * Math.PI / 180)) * this.surfaces[1].radius ;
		}
		this.thickness = Math.max(thicknessMin, thickness);
	}
}


function intersectionWithThickLense(p0, p1, lens)
{
	let firstBounce = null;
	let firstSurface = null;
	for (let i=0; i<lens.surfaces.length; i++)
	{
		let surface = lens.surfaces[i];
		let bounce = null;
		if (surface.elementType == ElementInterfaceFlat)
		{
			let lengthHalfX = surface.tangentX * surface.length * 0.5 ;
			let lengthHalfY = surface.tangentY * surface.length * 0.5 ;
			let p2 = {x: surface.x - lengthHalfX,  y: surface.y - lengthHalfY};
			let p3 = {x: surface.x + lengthHalfX,  y: surface.y + lengthHalfY};
			bounce = intersectionLineVsLine(p0, p1, p2, p3, true);
		}
		else if (surface.elementType == ElementInterfaceCurve)
		{
			bounce = intersectionLineVsCircle(p0, p1, surface.GetCenter(), surface.radius, surface.normalX, surface.normalY, surface.arcAngle);
		}
		
		if (bounce != null && bounce.t > ErrorTolerance)
		{
			if (firstBounce == null || bounce.t < firstBounce.t)
			{
				firstBounce = bounce;
				firstSurface = surface;;
			}
		}
	}
	return {bounce: firstBounce, element: firstSurface};
}

// dir and normal are normalized
function RefractionSurface(dir, bounce, surface)
{

	let normal = null;
	if (surface.elementType == ElementInterfaceFlat)
	{
		normal = {x: surface.normalX, y: surface.normalY};
	}
	else if (surface.elementType == ElementInterfaceCurve)
	{
		if (surface.radius >= RADIUS_INF)
		{
			normal = {x: surface.normalX, y: surface.normalY};
		}
		else
		{
			let center = surface.GetCenter();
			normal = {x: (bounce.x - center.x)/surface.radius, y: (bounce.y - center.y)/surface.radius};
		}
	}

	else
	{
		console.error("UNKNOWN SURFACE!!");
	}

	let n1 = surface.n1;
	let n2 = surface.n2;
	let dot = dir.x * normal.x + dir.y * normal.y;
	if (dot < 0.0)
	{
		normal.x *= -1;
		normal.y *= -1;
		dot *= -1;
		n1 = surface.n2;
		n2 = surface.n1;
	}

	// n1 and n2 as swapped here due to how the angle/normals are computed
	let a1 = Math.acos(dot);
	let a2 = Math.asin(n2 * Math.sin(a1) / n1);

	let cross = dir.x * normal.y - dir.y * normal.x;
	if (cross > 0)
	{
		a2 *= -1;
	}

	let a1Debug = a1 * 180 / Math.PI;
	let a2Debug = a2 * 180 / Math.PI;

	let c = Math.cos(a2);
	let s = Math.sin(a2);

	console.log("n1: " + n1 + " n2: " + n2 + "  a1: " + a1Debug + "  a2: " + a2Debug);
	console.log("surface.n1: " + surface.n1 + " surface.n2: " + surface.n2);

	let dirX = normal.x * c - normal.y * s;
	let dirY = normal.x * s + normal.y * c;

	return {x: dirX, y: dirY}
}
