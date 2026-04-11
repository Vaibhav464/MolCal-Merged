console.log("MolCal MW Calculator app.js loaded");

let RDKitModule = null;

// Initialize RDKit.js
window
  .initRDKitModule()
  .then(function (RDKit) {
    console.log("RDKit version: " + RDKit.version());
    RDKitModule = RDKit;
    setupUI();
  })
  .catch(function (e) {
    console.error("Failed to load RDKit.js", e);
  });

function setupUI() {
  const btnSmiles = document.getElementById("calcBtn");
  const smilesInput = document.getElementById("smiles");
  const result = document.getElementById("result");

  const jsmeUseForMwBtn = document.getElementById("jsmeUseForMwBtn");

  // helper: compute MW from a SMILES string using RDKit
  function computeMWFromSmiles(smiles) {
    if (!smiles) {
      result.textContent = "Please provide a SMILES string.";
      return;
    }

    if (!RDKitModule) {
      result.textContent = "RDKit is still loading, please wait...";
      return;
    }

    try {
      const mol = RDKitModule.get_mol(smiles);

      const descJson = mol.get_descriptors();
      const descriptors = JSON.parse(descJson);

      const mw = descriptors.amw;
      const exact = descriptors.exactmw;

      if (typeof mw !== "number") {
        result.textContent = "Could not read MW (amw). Got: " + String(mw);
      } else {
        result.textContent = `MW: ${mw.toFixed(2)} | Exact: ${exact.toFixed(4)} (SMILES: ${smiles})`;
      }

      mol.delete();
    } catch (err) {
      console.error(err);
      result.textContent = "Invalid SMILES or RDKit error.";
    }
  }

  // 1) Button: calculate from manual SMILES input
  if (btnSmiles) {
    btnSmiles.addEventListener("click", () => {
      const smiles = (smilesInput.value || "").trim();
      computeMWFromSmiles(smiles);
    });
  }

  // 2) Button: calculate MW from JSME drawing
  if (jsmeUseForMwBtn) {
    jsmeUseForMwBtn.addEventListener("click", () => {
      if (!window.jsmeApplet) {
        result.textContent = "JSME is still loading.";
        return;
      }
      try {
        const smiles = window.jsmeApplet.smiles();
        if (!smiles) {
          result.textContent = "Please draw a molecule in JSME first.";
          return;
        }
        console.log("JSME SMILES for MW:", smiles);
        smilesInput.value = smiles;
        computeMWFromSmiles(smiles);
      } catch (e) {
        console.error(e);
        result.textContent = "Error reading SMILES from JSME.";
      }
    });
  }
}
