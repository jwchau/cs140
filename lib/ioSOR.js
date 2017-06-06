/*
 * VERSION 1.1 - ALWAYS CHECK FOR LATEST VERSION
 *
 * Library used to read and write 3D Obj Data into Obj File
 * Assumes the objects are SOR made up of quad faces.
 *
 * Written by:   Aakash Thakkar
 * Date:         October 2, 2016
 *
 * BUG FIXES:
 * 1) Looping Bug 
 *    Identified and Sovled by:   Mackenzie Glynn
 *    Date:         October 4, 2016
 *
 * File Format:
 * o STANDS FOR OBJECT NAME, V STANDS FOR VERTEX, F STANDS FOR FACE
 *
 * o [OBJECT_NAME]
 * v [x], [y], [z],
 * .
 * .
 * v [xn], [yn], [zn],
 * f [x], [y], [z],
 * .
 * .
 * f [xn], [yn], [zn],
 *
 * FUNCTIONS:
 * 1) saveFile(new SOR("", [VERTICES_ARRAY], [INDEXES_ARRAY]); --> Save 3d Object
 *    Desc: This function translates the SOR Object into a downloadable blob
 * 2) readFile()
 *    Return: SOR OBJECT
 *    USAGE: Once File Selected in Browser, USE: var sorObject = readFile();
 *    You can do this on an onclick event by a button.
 *    Desc: This function responds to an onchange event from the HTML FileInput and grabs the content of the file selected
 *          It then extracts SOR object from File Data
 *
 * NOTE: INSTRUCTION: STEPS:
 * 1) Add following code in the HTML DRIVER file( Inside body tag): <input type="file" id="fileinput" />
 * 2) Add the script before your own JS Code: <script src="../lib/ioSOR.js"></script>
 * 3) Add html button: <button type="button" onclick="readSOR()">Read SOR</button>
 * 4) Write function readSOR in yur own code.
 * 
 * Once user selects the file using file input, user will click Read SOR button.
 * In the readSOR() function you must execute readFile() that returns SOR object and render it.
 *
 */

var extractedSOR;

function SOR(objName, vertices, indexes)
{
    this.objName = objName;
    this.vertices = vertices;
    this.indexes = indexes;
}

function saveFile(SOR) {

    var text = "";
    // Anchor Element
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.download = SOR.objName + ".obj";

    text = "o " + SOR.objName + "\n";
    // Convert Vertices to Text
    for (var i = 0; i < SOR.vertices.length; i = i + 3) {
        text = text + "v " + SOR.vertices[i] + ", " + SOR.vertices[i + 1] + ", " + SOR.vertices[i + 2] + ",\n";
    }
    // Convert Indexes to Text
    for (var i = 0; i < SOR.indexes.length; i = i + 3) {
        text = text + "f " + SOR.indexes[i] + ", " + SOR.indexes[i + 1] + ", " + SOR.indexes[i + 2] + ",\n";
    }

    // Create Blob out of plain text
    var myBlob = new Blob([text], {
        type: "text/plain"
    });
    var url = window.URL.createObjectURL(myBlob);

    // Simulate Download
    a.href = url;
    a.click();
}

function readFile()
{
    if(extractedSOR != null)
    {
        alert(extractedSOR.objName);
        return extractedSOR;
    }
    else
    {
        alert("Error File Not Selected");
    }
}

function readEvent(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0];

    var sorObject = new SOR("", [], []);

    if (f) {
        var r = new FileReader();
        r.onload = function(e) {
            var contents = e.target.result;
            var line = "";
            while (1) {
                line = contents.substr(0, contents.indexOf("\n"));
                if (line.length <= 0)
                    break;
                if (line.charAt(0) == "o") {
                    sorObject.objName = line.substr(line.indexOf(" ") + 1);
                }
                if (line.charAt(0) == "v") {
                    line = line.substr(1);
                    sorObject.vertices.push(line.substr(0, line.indexOf(",")));
                    line = line.substr(line.indexOf(",") + 2);
                    sorObject.vertices.push(line.substr(0, line.indexOf(",")));
                    line = line.substr(line.indexOf(",") + 2);
                    sorObject.vertices.push(line.substr(0, line.indexOf(",")));
                }
                if (line.charAt(0) == "f") {
                    line = line.substr(1);
                    sorObject.indexes.push(line.substr(0, line.indexOf(",")));
                    line = line.substr(line.indexOf(",") + 2);
                    sorObject.indexes.push(line.substr(0, line.indexOf(",")));
                    line = line.substr(line.indexOf(",") + 2);
                    sorObject.indexes.push(line.substr(0, line.indexOf(",")));
                }
                contents = contents.substr(contents.indexOf("\n") + 1);
            }
            extractedSOR = sorObject;
        }
        r.readAsText(f);
    } else {
        alert("Failed to load file");
    }
}

document.getElementById('fileinput').addEventListener('change', readEvent);
