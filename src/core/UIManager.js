import GUI from "lil-gui";

export class UIManager {
  constructor() {
    this.gui = new GUI({
      closeFolders: true,
      title: "Simulation Controls",
      width: 300,
    });
    
    // Create HTML overlay for simulation data
    this.createSimulationDataOverlay();
  }
  
  createSimulationDataOverlay() {
    // Create the overlay container
    this.dataOverlay = document.createElement('div');
    this.dataOverlay.id = 'simulation-data-overlay';
    this.dataOverlay.style.cssText = `
      position: fixed;
      top: 15px;
      left: 15px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      line-height: 1.4;
      min-width: 250px;
      z-index: 1000;
      border: 1px solid #333;
    `;
    
    document.body.appendChild(this.dataOverlay);
    
    // Initialize with empty content
    this.updateSimulationData({});
  }
  
  updateSimulationData(data) {
    const {
      position = { x: 0, y: 0, z: 0 },
      velocity = { x: 0, y: 0, z: 0 },
      acceleration = { x: 0, y: 0, z: 0 },
      autoLiftCoeffX = 0,
      autoLiftCoeffZ = 0,
      autoDragCoeff = 0,
      parachuteOpen = false,
      forces = {}
    } = data;
    
    let html = '<h3 style="margin: 0 0 10px 0; color: #4CAF50;">Simulation Data</h3>';
    
    // Position
    html += '<div style="margin-bottom: 8px;">';
    html += '<strong>Position:</strong><br>';
    html += `X: ${position.x.toFixed(2)} | Y: ${position.y.toFixed(2)} | Z: ${position.z.toFixed(2)}`;
    html += '</div>';
    
    // Velocity
    html += '<div style="margin-bottom: 8px;">';
    html += '<strong>Velocity:</strong><br>';
    html += `X: ${velocity.x.toFixed(2)} | Y: ${velocity.y.toFixed(2)} | Z: ${velocity.z.toFixed(2)}`;
    html += '</div>';
    
    // Acceleration
    html += '<div style="margin-bottom: 8px;">';
    html += '<strong>Acceleration:</strong><br>';
    html += `X: ${acceleration.x.toFixed(2)} | Y: ${acceleration.y.toFixed(2)} | Z: ${acceleration.z.toFixed(2)}`;
    html += '</div>';
    
    // Auto coefficients
    html += '<div style="margin-bottom: 8px;">';
    html += '<strong>Auto Coefficients:</strong><br>';
    html += `Lift X: ${autoLiftCoeffX.toFixed(4)} | Lift Z: ${autoLiftCoeffZ.toFixed(4)}<br>`;
    html += `Drag: ${autoDragCoeff.toFixed(4)}`;
    html += '</div>';
    
    // Status
    html += '<div style="margin-bottom: 8px;">';
    html += '<strong>Status:</strong><br>';
    html += `Parachute: ${parachuteOpen ? 'Open' : 'Closed'}`;
    html += '</div>';
    
    // Forces
    if (Object.keys(forces).length > 0) {
      html += '<div>';
      html += '<strong>Forces:</strong><br>';
      Object.entries(forces).forEach(([name, force]) => {
        const magnitude = Math.sqrt(force.x * force.x + force.y * force.y + force.z * force.z);
        html += `${name}: ${magnitude.toFixed(2)}N<br>`;
        html += `X: ${force.x.toFixed(2)} | Y: ${force.y.toFixed(2)} | Z: ${force.z.toFixed(2)}<br>`;
        html+='<br>';
      });
      html += '</div>';
    }
    
    this.dataOverlay.innerHTML = html;
  }

  addSkyDiverFolder(skyDiver) {
    if (skyDiver && skyDiver.addGuiFolder) {
      skyDiver.addGuiFolder(this.gui);
    }
  }

  addPhysicsFolder(physics) {
    if (physics && physics.addGuiFolder) {
      physics.addGuiFolder(this.gui);
    }
  }

  toggle() {
    this.gui.show(this.gui._hidden);
    // Toggle data overlay visibility
    this.dataOverlay.style.display = this.dataOverlay.style.display === 'none' ? 'block' : 'none';
  }

  getGUI() {
    return this.gui;
  }

}
