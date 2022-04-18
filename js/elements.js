
const ElementInvalid = Symbol("Invalid");
const ElementSourcePoint = Symbol("SourcePoint");
const ElementSourceBeam = Symbol("SourceBeam");
const ElementMirrorFlat = Symbol("MirrorFlat");
const ElementMirrorCurved = Symbol("MirrorCurved");
const ElementLensConverging = Symbol("LensConverging");
const ElementLensDiverging = Symbol("LensDiverging");
const ElementBlocker = Symbol("Blocker");

function intersectionLineVsLine(p0, p1, p2, p3, onlyInside)
{
    let s1 = {x: p1.x - p0.x, y: p1.y - p0.y};
	let s2 = {x: p3.x - p2.x, y: p3.y - p2.y};

	let d = (-s2.x * s1.y + s1.x * s2.y);
	let s = (-s1.y * (p0.x - p2.x) + s1.x * (p0.y - p2.y)) / d;
	let t = (s2.x * (p0.y - p2.y) - s2.y * (p0.x - p2.x)) / d;

	if (!onlyInside || (s >= 0 && s <= 1 && t >= 0 && t <= 1))
	{
		// Collision detected
           return {t: t, x: p0.x + t * s1.x, y: p0.y + t * s1.y};
	}
	return null;
}

function intersectionLineVsCircle(p0, p1, C, r)
{

// E is the starting point of the ray,
// L is the end point of the ray,
// C is the center of sphere you're testing against
// r is the radius of that sphere
// Compute:
// d = L - E ( Direction vector of ray, from start to end )
// f = E - C ( Vector from center sphere to ray start )
// float a = d.Dot( d ) ;
// float b = 2*f.Dot( d ) ;
// float c = f.Dot( f ) - r*r ;
// float discriminant = b*b-4*a*c;
// float t1 = (-b - discriminant)/(2*a);
// float t2 = (-b + discriminant)/(2*a);

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

	let t = -1;
	if (t1 > 0.0 && t2 > 0.0)
	{
		t = t1 < t2 ? t1 : t2;
	}
	else
	{
		if (t1 > 0.0)
		{
			t = t1;
		}
		else if (t2 > 0.0)
		{
			t = t2;
		}
	}

	if (t > 0.0)
	{
		return {t: t, x:p0.x + t*d.x, y:p1.y + t*d.y};
	}
	return null;
}


function calculateReflection(rayDir, element)
{
    let tanCmp = rayDir.x * element.tangentX + rayDir.y * element.tangentY;
    let norCmp = rayDir.x * element.normalX + rayDir.y * element.normalY;

    return {x: tanCmp * element.tangentX - norCmp * element.normalX, y: tanCmp * element.tangentY - norCmp * element.normalY};
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

	GetData()
	{
		return this.x.toString() + ";" + this.y.toString() + ";" + this.numberRays.toString();
	}


	SetFromData(data)
	{
		let bits = data.split(";");
		if (bits.length < 3)
		{
			console.error("ERROR while parsing Source Point");
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
		this.angle = 0;
		this.normalX = 0;
		this.normalY = 0;
		this.tangentX = 0;
		this.tangentY = 0;
		this.setAngle(0.0);
	}

	setAngle(angle)
	{
		this.angle = angle;
		if (this.angle > 360.0) this.angle -= 360.0;
		else if (this.angle < 0.0) this.Math += 360.0;
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
			console.error("ERROR while parsing base orientable element");
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
			console.error("ERROR while parsing Source Beam: expecting 5 elements and only " + bits.length + " found." );
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
			console.error("ERROR while parsing Flat Surface: expecting 4 elements and only " + bits.length + " found." );
		}
		else
		{
			this.length = parseFloat(bits[3]);
		}
	}
}

class SurfaceCurved extends OrientableElement
{
	constructor(x, y, radius, arcAngle, mirror)
	{
		super(x,y)
		this.radius = radius;
		this.arcAngle = arcAngle
		if (mirror)
		{
        	this.elementType = ElementMirrorCurved;
		}
	}

	GetData()
	{
		return super.GetData() + ";" + this.radius.toString() + ";" + this.arcAngle.toString();
	}

	SetFromData(data)
	{
		super.SetFromData(data);

		let bits = data.split(";");
		if (bits.length < 5)
		{
			console.error("ERROR while parsing Curved Surface: expecting 5 elements and only " + bits.length + " found." );
		}
		else
		{
			this.radius = parseFloat(bits[3]);
			this.arcAngle = parseFloat(bits[4]);
		}
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
			console.error("ERROR while parsing Thin Lens: expecting 5 elements and only " + bits.length + " found." );
		}
		else
		{
			this.length = parseFloat(bits[3]);
			this.focalLength = parseInt(bits[4]);
		}
	}
}


