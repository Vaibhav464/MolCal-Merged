console.log('MolCal Plus app.js loaded');

let RDKitModule = null;

// Simple ID generator for items
let nextId = 1;
let reactants = []; // [{id, smiles, name}]
let products = []; // [{id, smiles, name}];

// Initialize RDKit.js
window.initRDKitModule()
    .then(function (RDKit) {
        console.log('RDKit version: ' + RDKit.version());
        RDKitModule = RDKit;
        setupUI();
    })
    .catch(function (e) {
        console.error('Failed to load RDKit.js', e);
    });

// Draw one SMILES into a canvas element
function renderSmilesToCanvas(smiles, canvas, width = 200, height = 150) {
    if (!RDKitModule) {
        console.warn('RDKit is not ready for rendering yet.');
        return;
    }
    if (!smiles || !canvas) return;

    try {
        const mol = RDKitModule.get_mol(smiles);
        if (!mol) {
            console.warn("Invalid structure for rendering.");
            return;
        }

        canvas.width = width;
        canvas.height = height;
        mol.draw_to_canvas(canvas, width, height);
        mol.delete();
    } catch (e) {
        console.error(e);
    }
}

// Get current SMILES from JSME
function getCurrentSmilesFromJsme() {
    if (!window.jsmeApplet) {
        alert("JSME is still loading.");
        return "";
    }
    try {
        const s = window.jsmeApplet.smiles();
        if (!s || !s.trim()) {
            alert("Please draw a molecule in JSME first.");
            return "";
        }
        return s.trim();
    } catch (e) {
        console.error(e);
        alert("Error reading SMILES from JSME.");
        return "";
    }
}

function setupUI() {
    const btnSmiles = document.getElementById('calcBtn');
    const smilesInput = document.getElementById('smiles');
    const result = document.getElementById('result');
    const reactantNameInput = document.getElementById("reactantNameInput");
    const productNameInput = document.getElementById("productNameInput");
    const tempInput = document.getElementById("tempInput");
    const timeInput = document.getElementById("timeInput");
    const solventInput = document.getElementById("solventInput");

    const jsmeUseForMwBtn = document.getElementById('jsmeUseForMwBtn');

    // helper: compute MW from a SMILES string using RDKit
    function computeMWFromSmiles(smiles) {
        if (!smiles) {
            result.textContent = 'Please provide a SMILES string.';
            return;
        }

        if (!RDKitModule) {
            result.textContent = 'RDKit is still loading, please wait...';
            return;
        }

        try {
            const mol = RDKitModule.get_mol(smiles);

            const descJson = mol.get_descriptors();
            const descriptors = JSON.parse(descJson);

            const mw = descriptors.amw;
            const exact = descriptors.exactmw;

            if (typeof mw !== 'number') {
                result.textContent = 'Could not read MW (amw). Got: ' + String(mw);
            } else {
                result.textContent =
                    `MW: ${mw.toFixed(2)} | Exact: ${exact.toFixed(4)} (SMILES: ${smiles})`;
            }

            mol.delete();
        } catch (err) {
            console.error(err);
            result.textContent = 'Invalid SMILES or RDKit error.';
        }
    }

    // 1) Button: calculate from manual SMILES input
    if (btnSmiles) {
        btnSmiles.addEventListener('click', () => {
            const smiles = (smilesInput.value || '').trim();
            computeMWFromSmiles(smiles);
        });
    }

    // 2) Button: calculate MW from JSME drawing
    if (jsmeUseForMwBtn) {
        jsmeUseForMwBtn.addEventListener('click', () => {
            if (!window.jsmeApplet) {
                result.textContent = 'JSME is still loading.';
                return;
            }
            try {
                const smiles = window.jsmeApplet.smiles();
                if (!smiles) {
                    result.textContent = 'Please draw a molecule in JSME first.';
                    return;
                }
                console.log('JSME SMILES for MW:', smiles);
                smilesInput.value = smiles;
                computeMWFromSmiles(smiles);
            } catch (e) {
                console.error(e);
                result.textContent = 'Error reading SMILES from JSME.';
            }
        });
    }

    // --------- NEW: multi-reactant / multi-product UI ---------

    const addReactantBtn = document.getElementById("addReactantBtn");
    const addProductBtn = document.getElementById("addProductBtn");
    const reactantsListDiv = document.getElementById("reactantsList");
    const productsListDiv = document.getElementById("productsList");
    const exportSchemeBtn = document.getElementById("exportSchemeBtn");

    function createItemElement(kind, item) {
        // kind: "reactant" or "product"
        const wrapper = document.createElement("div");
        wrapper.className = "reaction-item";
        wrapper.style.border = "1px solid #ccc";
        wrapper.style.padding = "6px";
        wrapper.style.marginBottom = "6px";
        wrapper.style.borderRadius = "4px";

        const title = document.createElement("div");
        title.textContent = (kind === "reactant" ? "Reactant " : "Product ") + item.id;
        title.style.fontWeight = "bold";
        title.style.marginBottom = "4px";

        const nameLine = document.createElement("div");
        nameLine.textContent = item.name ? item.name : "";
        nameLine.style.fontSize = "0.85rem";
        nameLine.style.marginBottom = "4px";

        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 120;
        canvas.style.border = "1px solid #ddd";
        canvas.style.display = "block";
        canvas.style.marginBottom = "4px";

        // Render the structure
        renderSmilesToCanvas(item.smiles, canvas, 200, 120);

        const btnRow = document.createElement("div");
        btnRow.style.display = "flex";
        btnRow.style.gap = "4px";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";

        btnRow.appendChild(editBtn);
        btnRow.appendChild(deleteBtn);

        wrapper.appendChild(title);
        wrapper.appendChild(nameLine);
        wrapper.appendChild(canvas);
        wrapper.appendChild(btnRow);

        // Edit: load into JSME
        editBtn.addEventListener("click", () => {
            try {
                window.jsmeApplet.readGenericMolecularInput(item.smiles);
            } catch (e) {
                console.error(e);
                alert("Could not load structure into editor.");
            }
        });

        // Delete: remove from array + re-render list
        deleteBtn.addEventListener("click", () => {
            if (kind === "reactant") {
                reactants = reactants.filter(r => r.id !== item.id);
                renderLists();
            } else {
                products = products.filter(p => p.id !== item.id);
                renderLists();
            }
        });

        return wrapper;
    }

    function renderLists() {
        // Clear
        reactantsListDiv.innerHTML = "";
        productsListDiv.innerHTML = "";

        // Reactants
        reactants.forEach(item => {
            const el = createItemElement("reactant", item);
            reactantsListDiv.appendChild(el);
        });

        // Products
        products.forEach(item => {
            const el = createItemElement("product", item);
            productsListDiv.appendChild(el);
        });
    }

    // Add reactant from editor
    if (addReactantBtn) {
        addReactantBtn.addEventListener("click", () => {
            const s = getCurrentSmilesFromJsme();
            if (!s) return;
            const name = (reactantNameInput.value || "").trim();
            reactants.push({ id: nextId++, smiles: s, name });
            renderLists();
        });
    }

    // Add product from editor
    if (addProductBtn) {
        addProductBtn.addEventListener("click", () => {
            const s = getCurrentSmilesFromJsme();
            if (!s) return;
            const name = (productNameInput.value || "").trim();
            products.push({ id: nextId++, smiles: s, name });
            renderLists();
        });
    }

    // Export scheme: all reactants → all products
    if (exportSchemeBtn) {
        exportSchemeBtn.addEventListener("click", () => {
            if (reactants.length === 0 || products.length === 0) {
                alert("Add at least one reactant and one product before exporting.");
                return;
            }

            const width = 800;
            const baseHeight = 300;
            const molWidth = 160;
            const molHeight = 120;
            const marginX = 20;
            const marginY = 20;

            // compute total needed height for structures
            const reactTotalHeight = reactants.length * molHeight + (reactants.length - 1) * 10;
            const prodTotalHeight = products.length * molHeight + (products.length - 1) * 10;

            // Build name lines for bottom labels
            const reactNames = reactants
                .map(r => r.name)
                .filter(n => n && n.trim())
                .join(", ");

            const prodNames = products
                .map(p => p.name)
                .filter(n => n && n.trim())
                .join(", ");

            const hasReactNames = reactNames.length > 0;
            const hasProdNames = prodNames.length > 0;

            const extraTextHeight = (hasReactNames || hasProdNames) ? 40 : 0;

            const neededHeight =
                Math.max(reactTotalHeight, prodTotalHeight) + 2 * marginY + extraTextHeight;

            // final canvas height (at least baseHeight)
            const height = Math.max(baseHeight, neededHeight);

            const schemeCanvas = document.createElement("canvas");
            schemeCanvas.width = width;
            schemeCanvas.height = height;
            const ctx = schemeCanvas.getContext("2d");

            // Background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);

            const reactStartY = (height - extraTextHeight - reactTotalHeight) / 2;
            const prodStartY = (height - extraTextHeight - prodTotalHeight) / 2;

            const reactX = marginX;
            const prodX = width - marginX - molWidth;

            // Draw each reactant (structure only)
            reactants.forEach((item, idx) => {
                const y = reactStartY + idx * (molHeight + 10);
                const molCanvas = document.createElement("canvas");
                renderSmilesToCanvas(item.smiles, molCanvas, molWidth, molHeight);
                ctx.drawImage(molCanvas, reactX, y, molWidth, molHeight);
            });

            // Draw each product (structure only)
            products.forEach((item, idx) => {
                const y = prodStartY + idx * (molHeight + 10);
                const molCanvas = document.createElement("canvas");
                renderSmilesToCanvas(item.smiles, molCanvas, molWidth, molHeight);
                ctx.drawImage(molCanvas, prodX, y, molWidth, molHeight);
            });

            // Short arrow in the center
            const arrowY = (height - extraTextHeight) / 2;
            const arrowCenterX = width / 2;
            const arrowHalfLen = 40; // total 80 px

            const arrowStartX = arrowCenterX - arrowHalfLen;
            const arrowEndX = arrowCenterX + arrowHalfLen;

            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(arrowStartX, arrowY);
            ctx.lineTo(arrowEndX, arrowY);
            ctx.stroke();

            // small arrow head
            ctx.beginPath();
            ctx.moveTo(arrowEndX, arrowY);
            ctx.lineTo(arrowEndX - 8, arrowY - 5);
            ctx.lineTo(arrowEndX - 8, arrowY + 5);
            ctx.closePath();
            ctx.fillStyle = "#000000";
            ctx.fill();

            // Reaction conditions: "25 °C, 2 h, DMF"
            const tVal = (tempInput.value || "").trim();
            const timeVal = (timeInput.value || "").trim();
            const solvVal = (solventInput.value || "").trim();

            let condParts = [];
            if (tVal) condParts.push(`${tVal} °C`);
            if (timeVal) condParts.push(timeVal);
            if (solvVal) condParts.push(solvVal);

            const condText = condParts.join(", ");

            if (condText) {
                ctx.font = "16px Arial";
                ctx.fillStyle = "#000000";
                ctx.textAlign = "center";
                ctx.textBaseline = "alphabetic";
                ctx.fillText(condText, width / 2, arrowY - 20);
            }

            // Bottom labels: Reactant / Product names
            let textY = height - 10;  // start near bottom

            ctx.font = "14px Arial";
            ctx.fillStyle = "#000000";
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";

            if (hasProdNames) {
                ctx.fillText("Products: " + prodNames, marginX, textY);
                textY -= 18;
            }

            if (hasReactNames) {
                ctx.fillText("Reactants: " + reactNames, marginX, textY);
            }

            // Download
            const url = schemeCanvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = url;
            a.download = "reaction_scheme.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }

    // Initial empty render
    renderLists();
}
