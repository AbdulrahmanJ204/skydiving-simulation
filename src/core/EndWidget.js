export class EndWidget {
  constructor() {
    this.isVisible = false;
    this.finalValues = {};
    this.simulationStats = {};
    this.onRestartCallback = null;
    this.onExportCallback = null;
  }

  createWidget() {
    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.id = 'end-widget-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.35);
      z-index: 1000;
      display: none;
      justify-content: center;
      align-items: center;
      font-family: Arial, sans-serif;
    `;

    // Create widget container
    this.widget = document.createElement('div');
    this.widget.style.cssText = `
      background: rgba(42, 42, 42, 0.65);
      border-radius: 10px;
      padding: 30px;
      max-width: 700px;
      max-height: 80vh;
      overflow-y: auto;
      color: white;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(4px);
    `;
    // Hide scrollbars but keep scrolling
    this.widget.classList.add('scroll-container');

    this.overlay.appendChild(this.widget);
    document.body.appendChild(this.overlay);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #end-widget-overlay .stat-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 20px 0;
      }
      
      #end-widget-overlay .stat-section {
        background: #3a3a3a;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #4CAF50;
      }
      
      #end-widget-overlay .stat-item {
        display: flex;
        justify-content: space-between;
        margin: 8px 0;
        padding: 5px 0;
        border-bottom: 1px solid #555;
      }
      
      #end-widget-overlay .stat-label {
        color: #ccc;
        font-weight: bold;
      }
      
      #end-widget-overlay .stat-value {
        color: #4CAF50;
        font-family: monospace;
      }
      
      #end-widget-overlay .highlight {
        color: #FF9800;
        font-weight: bold;
      }
      
      #end-widget-overlay button {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 12px 25px;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
        margin: 5px;
      }
      
      #end-widget-overlay button:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
      
      #end-widget-overlay .export-btn {
        background: #2196F3;
      }
      
      #end-widget-overlay .close-btn {
        background: #f44336;
      }

      /* Hide scrollbar while preserving scroll */
      #end-widget-overlay .scroll-container {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
      }
      #end-widget-overlay .scroll-container::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }
    `;
    
    document.head.appendChild(style);
  }

  show(finalValues, simulationStats) {
    this.finalValues = finalValues;
    this.simulationStats = simulationStats;
    
    if (!this.overlay) {
      this.createWidget();
    }
    
    this.updateContent();
    this.isVisible = true;
    this.overlay.style.display = 'flex';
  }

  updateContent() {
   
    this.widget.innerHTML = `
      <h2 style="margin-top: 0; color: #4CAF50; text-align: center;">Simulation Results</h2>
      
      
      <div class="stat-grid">
        <!-- Final Position & Velocity -->
        <div class="stat-section">
          <h3 style="color: #81C784; margin-top: 0;">Final Position</h3>
          <div class="stat-item">
            <span class="stat-label">X Position:</span>
            <span class="stat-value">${this.finalValues.position.x.toFixed(2)} m</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Y Position (Height):</span>
            <span class="stat-value">${this.finalValues.position.y.toFixed(2)} m</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Z Position:</span>
            <span class="stat-value">${this.finalValues.position.z.toFixed(2)} m</span>
          </div>
          
          <h4 style="color: #A5D6A7; margin-top: 15px;">Final Velocity</h4>
          <div class="stat-item">
            <span class="stat-label">X Velocity:</span>
            <span class="stat-value">${this.finalValues.velocity.x.toFixed(2)} m/s</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Y Velocity:</span>
            <span class="stat-value">${this.finalValues.velocity.y.toFixed(2)} m/s</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Z Velocity:</span>
            <span class="stat-value">${this.finalValues.velocity.z.toFixed(2)} m/s</span>
          </div>
          <div class="stat-item">
            <span class="stat-label highlight">Total Speed:</span>
            <span class="stat-value highlight">${this.calculateTotalSpeed().toFixed(2)} m/s</span>
          </div>
        </div>
        
        <!-- Simulation Statistics -->
        <div class="stat-section">
          <h3 style="color: #81C784; margin-top: 0;">Flight Statistics</h3>
          <div class="stat-item">
            <span class="stat-label">Max Speed:</span>
            <span class="stat-value">${this.simulationStats.maxSpeed?.toFixed(2) || '0.00'} m/s</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Max Altitude:</span>
            <span class="stat-value">${this.simulationStats.maxAltitude?.toFixed(2) || '0.00'} m</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Distance Traveled:</span>
            <span class="stat-value">${this.simulationStats.totalDistance?.toFixed(2) || '0.00'} m</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Parachute Opened:</span>
            <span class="stat-value">${this.finalValues.parachuteOpened ? 'Yes' : 'No'}</span>
          </div>
          ${this.finalValues.parachuteOpened ? `
          <div class="stat-item">
            <span class="stat-label">Parachute Open Time:</span>
            <span class="stat-value">${this.simulationStats.parachuteOpenTime?.toFixed(1) || '0.0'} s</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Parachute Open Height:</span>
            <span class="stat-value">${this.simulationStats.parachuteOpenHeight?.toFixed(2) || '0.00'} m</span>
          </div>
          ` : ''}
        </div>
        
        
        
      </div>
      <!-- Forces & Physics -->
        <div class="stat-section">
          <h3 style="color: #81C784; margin-top: 0;">Final Forces</h3>
          <div class="stat-item">
            <span class="stat-label">Gravity Force:</span>
            <span class="stat-value">${this.finalValues.forces?.gravity?.toFixed(2) || '0.00'} N</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Drag Force:</span>
            <span class="stat-value">${this.finalValues.forces?.drag?.toFixed(2) || '0.00'} N</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Lift Force:</span>
            <span class="stat-value">${this.finalValues.forces?.lift?.toFixed(2) || '0.00'} N</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Coriolis Force:</span>
            <span class="stat-value">${this.finalValues.forces?.coriolis?.toFixed(2) || '0.00'} N</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Force:</span>
            <span class="stat-value">${this.finalValues.forces?.total?.toFixed(2) || '0.00'} N</span>
          </div>
        </div>
      <div style="text-align: center; margin-top: 30px;">
      <button id="close-results" class="close-btn">Close</button>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
  
    const closeButton = document.getElementById('close-results');

    closeButton?.addEventListener('click', () => {
      this.hide();
    });
  }

  calculateTotalSpeed() {
    const vel = this.finalValues.velocity;
    return Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
  }
  
  hide() {
    this.isVisible = false;
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
  }


}
