
var simulation;
var lastClickPoint;
var updateAngle;
var selectElementType;

const ModeAddElement = Symbol("ModeAddElement");
const ModeEditElement = Symbol("ModeEditElement");
const ModeDeleteElement = Symbol("ModeDeleteElement");
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

	for (let i=1; i<5; i++)
	{
		let labelName = document.getElementById("elementSettingsLabelName_" + i.toString());
		let range = document.getElementById("elementSettingsRange_" + i.toString());
		let value = document.getElementById("elementSettingsValue_" + i.toString());
		listSettings.push({labelName:labelName, value: value, range:range});
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

function setSettingsWidget(ind, label, value, min, max)
{
	listSettings[ind].labelName.innerHTML = label;
	listSettings[ind].range.value = value;
	listSettings[ind].range.min = min;
	listSettings[ind].range.max = max;
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
			setSettingsWidget(1, "Width", simulation.activeElement.length, 5, 500);
			setSettingsWidget(2, "Rotation", simulation.activeElement.angle, 0, 360);
			break;
		case (ElementMirrorFlat):
			labelElementSelected.innerHTML = "Flat Mirror";
			setSettingsWidget(0, "Diameter", simulation.activeElement.length, 1, 500);
			setSettingsWidget(1, "Rotation", simulation.activeElement.angle, 0, 360);
			break;
		case (ElementMirrorCurved):
			labelElementSelected.innerHTML = "Curved Mirror";
			setSettingsWidget(0, "Radius", simulation.activeElement.radius, 1, 500);
			setSettingsWidget(1, "Rotation", simulation.activeElement.angle, 0, 360);
			setSettingsWidget(2, "Arc Angle", simulation.activeElement.arcAngle, 5, 360);
			break;
		case (ElementLensConverging):
			labelElementSelected.innerHTML = "Converging Lens";
			setSettingsWidget(0, "Diameter", simulation.activeElement.length, 1, 500);
			setSettingsWidget(1, "Rotation", simulation.activeElement.angle, 0, 360);
			setSettingsWidget(2, "Focal Length", simulation.activeElement.focalLength, 10, 500);
			break;
		case (ElementLensDiverging):
			labelElementSelected.innerHTML = "Diverging Lens";
			setSettingsWidget(0, "Diameter", simulation.activeElement.length, 1, 500);
			setSettingsWidget(1, "Rotation", simulation.activeElement.angle, 0, 360);
			setSettingsWidget(2, "Focal Length", simulation.activeElement.focalLength, 10, 500);
			break;
		case (ElementBlocker):
			labelElementSelected.innerHTML = "Blocker";
			setSettingsWidget(0, "Diameter", simulation.activeElement.length, 1, 500);
			setSettingsWidget(1, "Rotation", simulation.activeElement.angle, 0, 360);
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
			simulation.activeElement.numberRays = listSettings[0].range.value;
			break;
		case (ElementSourceBeam):
			simulation.activeElement.numberRays = listSettings[0].range.value;
			simulation.activeElement.length = listSettings[1].range.value;
			simulation.activeElement.setAngle(listSettings[2].range.value);
			break;
		case (ElementMirrorFlat):
			simulation.activeElement.length = listSettings[0].range.value;
			simulation.activeElement.setAngle(listSettings[1].range.value);
			break;
		case (ElementMirrorCurved):
			simulation.activeElement.radius = listSettings[0].range.value;
			simulation.activeElement.setAngle(listSettings[1].range.value);
			simulation.activeElement.arcAngle = listSettings[2].range.value;
			break;
		case (ElementLensConverging):
			simulation.activeElement.radius = listSettings[0].range.value;
			simulation.activeElement.setAngle(listSettings[1].range.value);
			simulation.activeElement.arcAngle = listSettings[2].range.value;
			break;
		case (ElementLensDiverging):
			simulation.activeElement.length = listSettings[0].range.value;
			simulation.activeElement.setAngle(listSettings[1].range.value);
			simulation.activeElement.focalLength = listSettings[2].range.value;
			break;
		case (ElementBlocker):
			simulation.activeElement.length = listSettings[0].range.value;
			simulation.activeElement.setAngle(listSettings[1].range.value);
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
	for (let i=0; i<4; i++)
	{
		listSettings[i].range.value = listSettings[i].value.value;
	}
	OnElementSlideSettingsChanged();
}

function SetInEditMode()
{
	deselectAllButtons();
	mode = ModeEditElement;
	simulation.isActiveElementNew = false;
	simulation.activeElement = null;
	resetSettings();
	simulation.render();
}

function SetInAddingMode()
{
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
		simulation.addMirrorCurved(100.0, 30.0);
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
	else if (element.id == "btnAddBloquer")
	{
		simulation.addBloquer(100.0);
		SetInAddingMode();
		setSelected = true;
	}
	else if (element.id == "btnClearAll")
	{
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
	simulation.DeleteActiveElement();
	SetSettingsFromActiveElement();
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

	var content = "";
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
		for (let i=0; i<lines.length-1; i++)
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
			}
		}
		simulation.refresh();
	}

	if (file.files.length > 0)
	{
		reader.readAsText(file.files[0]);
	}
}
