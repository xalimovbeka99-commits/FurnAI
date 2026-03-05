function generateList() {
    let width = parseFloat(document.getElementById("width").value);
    let height = parseFloat(document.getElementById("height").value);
    let depth = parseFloat(document.getElementById("depth").value);

    if (!width || !height || !depth) {
        alert("Please enter all dimensions");
        return;
    }

    let result = `
    Side Panels: 2 pieces - ${height} x ${depth}
    Top & Bottom: 2 pieces - ${width} x ${depth}
    Back Panel: 1 piece - ${width} x ${height}
    Shelves: 3 pieces - ${width - 40} x ${depth - 20}
    `;

    document.getElementById("result").innerText = result;
}

function validateMeasurements() {
    // Get all input fields
    const height = document.getElementById('height')?.value;
    const width = document.getElementById('width')?.value;
    const depth = document.getElementById('depth')?.value;
    const length = document.getElementById('length')?.value;

    // Check if any field is empty
    if ((height !== undefined && !height) ||
        (width !== undefined && !width) ||
        (depth !== undefined && !depth) ||
        (length !== undefined && !length)) {
        alert('Please enter all measurements');
        return false; // prevent form submission
    }

    // Optional: success alert
    alert('Measurements accepted!');
    return false; // keep page from refreshing
}
