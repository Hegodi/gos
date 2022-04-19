
var simulation;
var lastClickPoint;
var updateAngle;
var selectElementType;

const ModeAddElement = Symbol("ModeAddElement");
const ModeEditElement = Symbol("ModeEditElement");
const ModeDeleteElement = Symbol("ModeDeleteElement");

const PRECISION_FLOAT = 0.01;

const MaxNumberSettings = 6;

var mode
var mouseDown;
var elementType = null;
var listSettings = new Array();
var labelPositionX;
var labelPositionY;
var gridCheckbox;
var gridSizeNumber;
var snapToGridCheckbox;
var checkboxAdditiveMode;
var checkboxShowDetails;
var textInfo;

var panelSettings;

var labelElementSelected;

function Start() 
{
	window.onscroll = function() {};
	let canvas = document.getElementById("canvasSimulation");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	let context = canvas.getContext("2d");
	canvas.addEventListener('mousedown', OnMouseDown);
	canvas.addEventListener('mouseup', OnMouseUp);
	canvas.addEventListener('mousemove', OnMouseMove);
	document.addEventListener('keypress', OnKeyPressed);
	document.addEventListener('wheel', OnMouseWheel);
	simulation = new Simulation(context, canvas);

	document.getElementById("textVersion").innerHTML = VERSION;

	for (let i=1; i<MaxNumberSettings+1; i++)
	{
		let labelName = document.getElementById("elementSettingsLabelName_" + i.toString());
		let range = document.getElementById("elementSettingsRange_" + i.toString());
		let value = document.getElementById("elementSettingsValue_" + i.toString());
		listSettings.push({labelName:labelName, value: value, range:range, scale:1.0});
		range.addEventListener("input", OnElementSlideSettingsChanged);
		value.addEventListener("change", OnElementValueSettingsChanged);
	}
	labelElementSelected = document.getElementById("labelElementSelected");
	labelPositionX = document.getElementById("labelPositionX");
	labelPositionY = document.getElementById("labelPositionY");

	panelSettings = document.getElementById("elmentSettingsPanel");

	gridCheckbox = document.getElementById("gridVisible");
	gridCheckbox.addEventListener("change", OnGridChanges);
	gridSizeNumber = document.getElementById("gridSize")
	gridSizeNumber.addEventListener("change", OnGridChanges);
	snapToGridCheckbox = document.getElementById("snapToGrid");
	checkboxAdditiveMode = document.getElementById("additiveMode");
	checkboxShowDetails = document.getElementById("showDetails")
	checkboxShowDetails.addEventListener("change", () => {simulation.showDetails = checkboxShowDetails.checked; simulation.render();})
	textInfo = document.getElementById("textInfo");
	textInfo.innerHTML ="Welcome to GOS " + VERSION;

	resetSettings();
	mouseDown = false;
	NewSimulation();
}

// Events:
function OnMouseDown(event)
{
	console.log(event.button)
	if (event.button == 2)
	{
		SetInEditMode();
		return;
	}
	mouseDown = true;

	if (mode == ModeAddElement)
	{
		simulation.confirmAddActiveElement();
		lastClickPoint = {x: event.offsetX, y: event.offsetY};
		SetInEditMode();
	}
	else if (mode == ModeEditElement)
	{
		simulation.trySelectElement(event.offsetX, event.offsetY);
		SetSettingsFromActiveElement();
	}
}

function OnGridChanges()
{
	simulation.gridEnabled = gridCheckbox.checked;
	simulation.gridSize = parseInt(gridSizeNumber.value);
	console.log(simulation.gridSize);
	simulation.render();
}

function OnMouseUp(event)
{
	//simulation.addSourcePoint(event.offsetX, event.offsetY, 36);
	mouseDown = false;
}

function OnMouseMove(event)
{
	if (mode == ModeEditElement)
	{
		if (mouseDown)
		{
			MoveActiveElement(event.offsetX, event.offsetY, true);
			SetSettingsFromActiveElement();
		}
	}
	else if (mode == ModeAddElement)
	{
		MoveActiveElement(event.offsetX, event.offsetY, false);
	}
}

function MoveActiveElement(x, y, recalculate)
{
	if (snapToGridCheckbox.checked)
	{
		x = Math.round(x / simulation.gridSize) * simulation.gridSize;
		y = Math.round(y / simulation.gridSize) * simulation.gridSize;
	}
	simulation.changePositionActiveElement(x, y, recalculate);
}

function OnKeyPressed(event)
{
	if (mode != ModeEditElement)
	{
		return;
	}

	if (event.key == "c")
	{
		simulation.cloneActiveElement();
		SetSettingsFromActiveElement();
		SetInAddingMode();
	}
	else if (event.key == "x")
	{
		simulation.DeleteActiveElement();
		SetSettingsFromActiveElement();
	}

}

function OnMouseWheel(event)
{
	if (mode != ModeEditElement)
	{
		return;
	}

	if (simulation.activeElement != null)
	{
		simulation.activeElement.setAngle(simulation.activeElement.angle + 0.1*event.deltaY);
		SetSettingsFromActiveElement();
		if (simulation.isActiveElementNew)
		{
			simulation.render();
		}
		else
		{
			simulation.refresh();
		}
	}
}

function resetSettings()
{
	labelElementSelected.innerHTML="";
	for (let i=0; i<listSettings.length; i++)
	{
		listSettings[i].labelName.style.display = "none";
		listSettings[i].value.style.display = "none";
		listSettings[i].range.style.display = "none";
	}

	panelSettings.style.display = "none";
}

function setSettingsWidget(ind, label, value, min, max, step = 1, scale = 1.0)
{
	listSettings[ind].scale = 1.0;
	listSettings[ind].labelName.innerHTML = label;
	listSettings[ind].range.value = value / listSettings[ind].scale;
	listSettings[ind].range.min = min;
	listSettings[ind].range.max = max;
	listSettings[ind].range.step = step;
	listSettings[ind].value.min = min;
	listSettings[ind].value.max = max;
	listSettings[ind].value.step = step;
	listSettings[ind].labelName.style.display = "block";
	listSettings[ind].value.style.display = "block";
	listSettings[ind].range.style.display = "block";
}


function SetSettingsFromActiveElement()
{
	resetSettings();
	if (simulation.activeElement == null)
	{
		return;
	}
	panelSettings.style.display = "block";


	labelPositionX.innerHTML = simulation.activeElement.x;
	labelPositionY.innerHTML = simulation.activeElement.y;

	switch(simulation.activeElement.elementType)
	{
		case(ElementInvalid):
			break;
		case (ElementSourcePoint):
			labelElementSelected.innerHTML = "Source Point";
			setSettingsWidget(0, "N of rays", simulation.activeElement.numberRays, 50, 500);
			break;
		case (ElementSourceBeam):
			labelElementSelected.innerHTML = "Beam";
			setSettingsWidget(0, "N of rays", simulation.activeElement.numberRays, 2, 100);
			setSettingsWidget(1, "Width", simulation.activeElement.length, 5, 500, PRECISION_FLOAT);
			setSettingsWidget(2, "Rotation", simulation.activeElement.angle, 0, 360, PRECISION_FLOAT);
			break;
		case (ElementMirrorFlat):
			labelElementSelected.innerHTML = "Flat Mirror";
			setSettingsWidget(0, "Diameter", simulation.activeElement.length, 1, 500, PRECISION_FLOAT);
			setSettingsWidget(1, "Rotation", simulation.activeElement.angle, 0, 360, PRECISION_FLOAT);
			break;
		case (ElementMirrorCurved):
			labelElementSelected.innerHTML = "Curved Mirror";
			setSettingsWidget(0, "Radius", simulation.activeElement.radius, 1, 1000, PRECISION_FLOAT);
			setSettingsWidget(1, "Rotation", simulation.activeElement.angle, 0, 360, PRECISION_FLOAT);
			setSettingsWidget(2, "Arc Angle", simulation.activeElement.arcAngle, 5, 360, PRECISION_FLOAT);
			break;
		case (ElementLensConverging):
			labelElementSelected.innerHTML = "Converging Lens";
			setSettingsWidget(0, "Diameter", simulation.activeElement.length, 1, 500, PRECISION_FLOAT);
			setSettingsWidget(1, "Rotation", simulation.activeElement.angle, 0, 360, PRECISION_FLOAT);
			setSettingsWidget(2, "Focal Length", simulation.activeElement.focalLength, 10, 500, PRECISION_FLOAT);
			break;
		case (ElementLensDiverging):
			labelElementSelected.innerHTML = "Diverging Lens";
			setSettingsWidget(0, "Diameter", simulation.activeElement.length, 1, 500, PRECISION_FLOAT);
			setSettingsWidget(1, "Rotation", simulation.activeElement.angle, 0, 360, PRECISION_FLOAT);
			setSettingsWidget(2, "Focal Length", simulation.activeElement.focalLength, 10, 500, PRECISION_FLOAT);
			break;
		case (ElementBlocker):
			labelElementSelected.innerHTML = "Blocker";
			setSettingsWidget(0, "Diameter", simulation.activeElement.length, 1, 500, PRECISION_FLOAT);
			setSettingsWidget(1, "Rotation", simulation.activeElement.angle, 0, 360, PRECISION_FLOAT);
			break;
		case (ElementThickLens):
			labelElementSelected.innerHTML = "Thick Lens";
			setSettingsWidget(0, "Height", simulation.activeElement.height, 10, 500, PRECISION_FLOAT);
			setSettingsWidget(1, "Rotation", simulation.activeElement.angle, 0, 360, PRECISION_FLOAT);
			setSettingsWidget(2, "Thickness", simulation.activeElement.thickness, 20, 200, PRECISION_FLOAT);
			if (simulation.activeElement.surfaces[0].radius < RADIUS_INF)
			{
				setSettingsWidget(3, "Radius A", simulation.activeElement.surfaces[0].radius, 10, 2000, PRECISION_FLOAT);
			}
			if (simulation.activeElement.surfaces[1].radius < RADIUS_INF)
			{
				setSettingsWidget(4, "Radius B", simulation.activeElement.surfaces[1].radius, 10, 2000, PRECISION_FLOAT);
			}
			setSettingsWidget(5, "Refractive Index", simulation.activeElement.refractiveIndex, PRECISION_FLOAT, 10, PRECISION_FLOAT);
			break;
	}
	UpdateSettingsLabels();
}

function OnElementSlideSettingsChanged()
{
	UpdateSettingsLabels();
	if (simulation.activeElement == null)
	{
		return;
	}

	switch(simulation.activeElement.elementType)
	{
		case(ElementInvalid):
			break;
		case (ElementSourcePoint):
			simulation.activeElement.numberRays = parseInt(listSettings[0].range.value);
			break;
		case (ElementSourceBeam):
			simulation.activeElement.numberRays = parseInt(listSettings[0].range.value);
			simulation.activeElement.length = parseFloat(listSettings[1].range.value);
			simulation.activeElement.setAngle(listSettings[2].range.value);
			break;
		case (ElementMirrorFlat):
			simulation.activeElement.length = parseFloat(listSettings[0].range.value);
			simulation.activeElement.setAngle(listSettings[1].range.value);
			break;
		case (ElementMirrorCurved):
			simulation.activeElement.radius = parseFloat(listSettings[0].range.value);
			simulation.activeElement.setAngle(listSettings[1].range.value);
			simulation.activeElement.arcAngle = parseFloat(listSettings[2].range.value);
			break;
		case (ElementLensConverging):
			simulation.activeElement.length = parseFloat(listSettings[0].range.value);
			simulation.activeElement.setAngle(parseFloat(listSettings[1].range.value));
			simulation.activeElement.focalLength = parseFloat(listSettings[2].range.value);
			break;
		case (ElementLensDiverging):
			simulation.activeElement.length = parseFloat(listSettings[0].range.value);
			simulation.activeElement.setAngle(listSettings[1].range.value);
			simulation.activeElement.focalLength = parseFloat(listSettings[2].range.value);
			break;
		case (ElementBlocker):
			simulation.activeElement.length = parseFloat(listSettings[0].range.value);
			simulation.activeElement.setAngle(listSettings[1].range.value);
			break;
		case (ElementThickLens):
			let height = parseFloat(listSettings[0].range.value);
			let thickness = parseFloat(listSettings[2].range.value);
			let radiusA = RADIUS_INF;
			let radiusB = RADIUS_INF;
			if (simulation.activeElement.surfaces[0].radius < RADIUS_INF)
			{
				radiusA = parseFloat(listSettings[3].range.value);
			}
			if (simulation.activeElement.surfaces[1].radius < RADIUS_INF)
			{
				radiusB = parseFloat(listSettings[4].range.value);
			}
			simulation.activeElement.refractiveIndex = parseFloat(listSettings[5].range.value);
			simulation.activeElement.SetValuesIfConsistent(height, thickness, radiusA, radiusB);
			simulation.activeElement.setAngle(listSettings[1].range.value);
			SetSettingsFromActiveElement();
			break;
	}

	simulation.refresh();
}

function UpdateSettingsLabels()
{
	for (let i=0; i<listSettings.length; i++)
	{
		listSettings[i].value.value = listSettings[i].range.value;
	}
}


function OnElementValueSettingsChanged()
{
	for (let i=0; i<listSettings.length; i++)
	{
		listSettings[i].range.value = listSettings[i].value.value;
	}
	OnElementSlideSettingsChanged();
}

function SetInEditMode()
{
	textInfo.innerHTML = "Left click at the center to select an object";
	deselectAllButtons();
	mode = ModeEditElement;
	simulation.isActiveElementNew = false;
	simulation.activeElement = null;
	resetSettings();
	simulation.render();
}

function SetInAddingMode()
{
	textInfo.innerHTML = "Left click to place the object";
	SetSettingsFromActiveElement();
	mode = ModeAddElement;
	clearDownloadLink();
}


function deselectAllButtons()
{
	let buttons = document.getElementsByClassName("myButtonSelected");
	for (let i=0; i<buttons.length; i++)
	{
		buttons[i].className = "myButton";
	}
}

function OnButtonClick(element, index)
{
	deselectAllButtons();
	let setSelected = false;

	if (element.id == "btnAddSourcePoint")
	{
		simulation.addSourcePoint(20);
		SetInAddingMode();
		setSelected = true;
	}
	else if (element.id == "btnAddSourceBeam")
	{
		simulation.addSourceBeam(40.0, 5);
		SetInAddingMode();
		setSelected = true;
	}
	else if (element.id == "btnAddMirrorFlat")
	{
		simulation.addMirrorFlat(100.0);
		SetInAddingMode();
		setSelected = true;
	}
	else if (element.id == "btnAddMirrorCurved")
	{
		simulation.addMirrorCurved(150.0, 50.0);
		SetInAddingMode();
		setSelected = true;
	}
	else if (element.id == "btnAddConvergingLens")
	{
		simulation.addConvergingLens(100.0, 50.0);
		SetInAddingMode();
		setSelected = true;
	}
	else if (element.id == "btnAddDivergingLens")
	{
		simulation.addDivergingLens(100.0, 50.0);
		SetInAddingMode();
		setSelected = true;
	}
	else if (element.id == "btnAddThickLens_Slab")
	{
		simulation.addThickLens(0, 0);
		SetInAddingMode();
		setSelected = true;
	}
	else if (element.id == "btnAddThickLens_Biconvex")
	{
		simulation.addThickLens(1, 1);
		SetInAddingMode();
		setSelected = true;
	}
	else if (element.id == "btnAddThickLens_PlanoConvex")
	{
		simulation.addThickLens(0, 1);
		SetInAddingMode();
		setSelected = true;
	}
	else if (element.id == "btnAddThickLens_Meniscus")
	{
		simulation.addThickLens(1, -1);
		SetInAddingMode();
		setSelected = true;
	}
	else if (element.id == "btnAddThickLens_PlanoConcave")
	{
		simulation.addThickLens(0, -1);
		SetInAddingMode();
		setSelected = true;
	}
	else if (element.id == "btnAddThickLens_Biconcave")
	{
		simulation.addThickLens(-1, -1);
		SetInAddingMode();
		setSelected = true;
	}
	else if (element.id == "btnAddBloquer")
	{
		simulation.addBloquer(100.0);
		SetInAddingMode();
		setSelected = true;
	}
	else if (element.id == "btnClearAll")
	{
		textInfo.innerHTML ="New simulation";
		NewSimulation();
	}

	if (setSelected)
	{
		element.className = "myButtonSelected";
	}
	simulation.render();
}

function NewSimulation()
{
	document.getElementById("saveFilename").value = "New Simulation"
	clearDownloadLink();
	simulation.reset();
}

function OnCloneSelected()
{
	simulation.cloneActiveElement();
	SetInAddingMode();
}

function OnDeleteSelected()
{
	textInfo.innerHTML ="Object deleted";
	simulation.DeleteActiveElement();
	SetSettingsFromActiveElement();
}

function ExportPNG(simulation)
{
	SetInEditMode();
	deselectAllButtons();
	simulation.activeElement = null;
	simulation.isActiveElementNew = null;
	simulation.render();

	let filename = document.getElementById("saveFilename").value;
	if (filename == "")
	{
		filename = "NewSimulation";
	}

	var anchor = document.getElementById("downloadLink");
	anchor.href = simulation.canvas.toDataURL();
	anchor.download = filename + ".png";
	anchor.innerHTML ="click to download";
	anchor.click();
	textInfo.innerHTML = "Click in the link if the file was not downloaded";
}

function downloadCurrentSimulation()
{
	SetInEditMode();
	deselectAllButtons();
	simulation.activeElement = null;
	simulation.isActiveElementNew = null;
	simulation.render();

	let filename = document.getElementById("saveFilename").value;
	if (filename == "")
	{
		filename = "NewSimulation";
	}

	var content = VERSION + "\n";
	for (let i=0; i<simulation.arraySources.length; i++)
	{
		content += simulation.arraySources[i].elementType.description + "\n";
		content += simulation.arraySources[i].GetData() + "\n";
	}
	for (let i=0; i<simulation.arrayPasiveElements.length; i++)
	{
		content += simulation.arrayPasiveElements[i].elementType.description + "\n";
		content += simulation.arrayPasiveElements[i].GetData() + "\n";
	}
	var myBlob = new Blob([content], {type: "text/plain"});

	// (B) CREATE DOWNLOAD LINK
	var url = window.URL.createObjectURL(myBlob);
	var anchor = document.getElementById("downloadLink");
	anchor.href = url;
	anchor.download = filename + ".gos";
	anchor.innerHTML ="click to download";
    
	// (C) "FORCE DOWNLOAD"
	// NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
	// BETTER TO LET USERS CLICK ON THEIR OWN
	anchor.click();
	textInfo.innerHTML = "Click in the link if the file was not downloaded";
}

function clearDownloadLink()
{
	var anchor = document.getElementById("downloadLink");
	window.URL.revokeObjectURL(anchor.href);
	anchor.innerHTML ="";
}

function loadSimulation()
{
	SetInEditMode();
	deselectAllButtons();
	simulation.activeElement = null;
	simulation.isActiveElementNew = null;


	let file = document.getElementById("loadFile");
	let reader = new FileReader();

	let data = "";
	reader.onload = function() {

		if (!checkboxAdditiveMode.checked)
		{
			simulation.reset();
		}
		data = reader.result;
		lines = data.split("\n");
		// First line is version:
		let version = lines[0];
		console.log("Version: " + version);

		let errors = false;
		try
		{
			for (let i=1; i<lines.length-1; i+=2)
			{
				let element = null;
				switch(lines[i])
				{
					case (ElementSourcePoint).description:
						element = new SourcePoint(0,0,0);
						element.SetFromData(lines[i+1]);
						simulation.arraySources.push(element);
						break;
					case (ElementSourceBeam.description):
						element = new SourceBeam(0,0,1, 0);
						element.SetFromData(lines[i+1]);
						simulation.arraySources.push(element);
						break;
					case (ElementMirrorFlat.description):
						element = new SurfaceFlat(0,0,1, true);
						element.SetFromData(lines[i+1]);
						simulation.arrayPasiveElements.push(element);
						break;
					case (ElementMirrorCurved.description):
						element = new SurfaceCurved(0,0,1,1, true);
						element.SetFromData(lines[i+1]);
						simulation.arrayPasiveElements.push(element);
						break;
					case (ElementLensConverging.description):
						element = new ThinLens(0,0,1,1, true);
						element.SetFromData(lines[i+1]);
						simulation.arrayPasiveElements.push(element);
						break;
					case (ElementLensDiverging.description):
						element = new ThinLens(0,0,1,1, false);
						element.SetFromData(lines[i+1]);
						simulation.arrayPasiveElements.push(element);
						break;
					case (ElementBlocker.description):
						element = new SurfaceFlat(0,0,1, false);
						element.SetFromData(lines[i+1]);
						simulation.arrayPasiveElements.push(element);
						break;
					case (ElementThickLens.description):
						element = new ThickLens(0, 0);
						element.SetFromData(lines[i+1]);
						simulation.arrayPasiveElements.push(element);
						break;
					default:
						textInfo.innerHTML = "WARNING: unkown element types: " + lines[i];
						errors = true;
						break;
				}
			}
			if (!errors)
			{
				textInfo.innerHTML = "Simulation loaded successfully";
			}
		}
		catch(e)
		{
			textInfo.innerHTML = "ERROR: wrong format (" + e + ")";
		}
		simulation.refresh(); 
	}

	if (file.files.length > 0)
	{
		reader.readAsText(file.files[0]);
	}
	{
		textInfo.innerHTML = "No file slected";
	}
}
