import * as THREE from 'three';

export class StartWidget {
  constructor() {
    this.isVisible = true;
    this.onStartCallback = null;
    this.onPositionChangeCallback = null;
    this.initialValues = {
      // Skydiver properties
      mass: 100,
      area: 1,
      parachuteArea: 10,
      startPosition: { x: 3, y: 2000, z: 40 },
      startVelocity: { x: 0, y: 0, z: 0 },
      
      // Physics properties
      gravity: 9.81,
      airDensity: 1.225,
      dragCoefficientBeforeParachute: 0.005,
      dragCoefficientForParachute: 0.005,
      liftCoefficientBeforeParachute: 0.3,
      liftCoefficientForParachute: 0.005,
      OMEGA: 7.2921159e-5,
      windSpeed: { x: 0, y: 0, z: 0 },
      latitude: 90,
      
      // Simulation settings
      autoOpenParachute: false,
      parachuteOpenHeight: 1000,
    };

    this.createWidget();
  }

  createWidget() {
    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.id = 'start-widget-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      z-index: 1000;
      display: flex;
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
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      color: white;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(4px);
    `;
    // Hide scrollbars but keep scrolling
    this.widget.classList.add('scroll-container');

    this.widget.innerHTML = `
      <h2 style="margin-top: 0; color: #4CAF50; text-align: center;">Skydiving Simulation Setup</h2>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-right: 15px">
        <!-- Skydiver Properties -->
        <div>
          <h3 style="color: #81C784; border-bottom: 1px solid #555; padding-bottom: 5px;">Skydiver Properties</h3>
          
          <label>Mass (kg):</label>
          <input type="number" id="mass" value="${this.initialValues.mass}" min="50" max="200" step="1">
          
          <label>Body Area (m²):</label>
          <input type="number" id="area" value="${this.initialValues.area}" min="0.5" max="3" step="0.1">
          
          <label>Parachute Area (m²):</label>
          <input type="number" id="parachuteArea" value="${this.initialValues.parachuteArea}" min="5" max="50" step="1">
          
          <h4 style="color: #A5D6A7; margin-top: 20px;">Start Position</h4>
          <label>X Position:</label>
          <input type="number" id="startX" value="${this.initialValues.startPosition.x}" step="1">
          
          <label>Y Position (Height):</label>
          <input type="number" id="startY" value="${this.initialValues.startPosition.y}" min="100" max="10000" step="100">
          
          <label>Z Position:</label>
          <input type="number" id="startZ" value="${this.initialValues.startPosition.z}" step="1">
          
          <h4 style="color: #A5D6A7; margin-top: 20px;">Initial Velocity</h4>
          <label>X Velocity (m/s):</label>
          <input type="number" id="velX" value="${this.initialValues.startVelocity.x}" step="0.1">
          
          <label>Y Velocity (m/s):</label>
          <input type="number" id="velY" value="${this.initialValues.startVelocity.y}" step="0.1">
          
          <label>Z Velocity (m/s):</label>
          <input type="number" id="velZ" value="${this.initialValues.startVelocity.z}" step="0.1">
        </div>
        
        <!-- Physics Properties -->
        <div>
          <h3 style="color: #81C784; border-bottom: 1px solid #555; padding-bottom: 5px;">Physics Properties</h3>
          
          <label>Gravity (m/s²):</label>
          <input type="number" id="gravity" value="${this.initialValues.gravity}" min="1" max="20" step="0.1">
          
          <label>Air Density (kg/m³):</label>
          <input type="number" id="airDensity" value="${this.initialValues.airDensity}" min="0.1" max="3" step="0.01">
          
          <label>Drag Coefficient (Before Parachute):</label>
          <input type="number" id="dragCoeffBefore" value="${this.initialValues.dragCoefficientBeforeParachute}" min="0.001" max="0.1" step="0.001">
          
          <label>Drag Coefficient (Parachute):</label>
          <input type="number" id="dragCoeffPara" value="${this.initialValues.dragCoefficientForParachute}" min="0.001" max="0.1" step="0.001">
          
          <label>Lift Coefficient (Before Parachute):</label>
          <input type="number" id="liftCoeffBefore" value="${this.initialValues.liftCoefficientBeforeParachute}" min="0.001" max="1" step="0.01">
          
          <label>Lift Coefficient (Parachute):</label>
          <input type="number" id="liftCoeffPara" value="${this.initialValues.liftCoefficientForParachute}" min="0.001" max="0.1" step="0.001">
          
          <label>Earth Rotation OMEGA (rad/s):</label>
          <input type="number" id="omega" value="${this.initialValues.OMEGA}" min="0" max="0.0001" step="0.000001">
          
          <label>Latitude (degrees):</label>
          <input type="number" id="latitude" value="${this.initialValues.latitude}" min="-180" max="180" step="1">
          
          <h4 style="color: #A5D6A7; margin-top: 20px;">Wind Speed</h4>
          <label>Wind X (m/s):</label>
          <input type="number" id="windX" value="${this.initialValues.windSpeed.x}" step="0.1">
          
          <label>Wind Y (m/s):</label>
          <input type="number" id="windY" value="${this.initialValues.windSpeed.y}" step="0.1">
          
          <label>Wind Z (m/s):</label>
          <input type="number" id="windZ" value="${this.initialValues.windSpeed.z}" step="0.1">
          
          <label>Parachute Open Height (m):</label>
          <input type="number" id="parachuteHeight" value="${this.initialValues.parachuteOpenHeight}" min="100" max="3000" step="50">
        </div>
        <div style = "span:full;">
          <h4 style="color: #A5D6A7; margin-top: 20px;">Simulation Settings</h4>
          <label>
          <input type="checkbox" id="autoParachute" ${this.initialValues.autoOpenParachute ? 'checked' : ''}>
          Auto-open Parachute
          </label>
          </div>
          
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <button id="start-simulation" style="
          background: #4CAF50;
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 18px;
          border-radius: 5px;
          cursor: pointer;
          margin-right: 10px;
        ">Start Simulation</button>
        
        <button id="reset-defaults" style="
          background: #FF9800;
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 18px;
          border-radius: 5px;
          cursor: pointer;
        ">Reset to Defaults</button>
      </div>
    `;

    // Add styles for inputs
    const style = document.createElement('style');
    style.textContent = `
      #start-widget-overlay label {
        display: block;
        margin-top: 10px;
        margin-bottom: 5px;
        color: #ccc;
        font-size: 14px;
      }
      
      #start-widget-overlay input[type="number"] {
        width: 100%;
        padding: 8px;
        border: 1px solid #555;
        border-radius: 4px;
        background: #3a3a3a;
        color: white;
        font-size: 14px;
      }
      
      #start-widget-overlay input[type="checkbox"] {
        margin-right: 8px;
        transform: scale(1.2);
      }
      
      #start-widget-overlay button:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      /* Hide scrollbar while preserving scroll */
      #start-widget-overlay .scroll-container {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
      }
      #start-widget-overlay .scroll-container::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }
    `;
    
    document.head.appendChild(style);
    this.overlay.appendChild(this.widget);
    document.body.appendChild(this.overlay);

    this.setupEventListeners();
  }

  setupEventListeners() {
    const startButton = document.getElementById('start-simulation');
    const resetButton = document.getElementById('reset-defaults');

    startButton.addEventListener('click', () => {
      this.collectValues();
      this.hide();
      if (this.onStartCallback) {
        this.onStartCallback(this.initialValues);
      }
    });

    resetButton.addEventListener('click', () => {
      this.resetToDefaults();
      this.notifyPositionChange();
    });
    
    // Add real-time position update listeners
    this.setupPositionChangeListeners();
  }

  collectValues() {
    // Collect all input values
    this.initialValues.mass = parseFloat(document.getElementById('mass').value);
    this.initialValues.area = parseFloat(document.getElementById('area').value);
    this.initialValues.parachuteArea = parseFloat(document.getElementById('parachuteArea').value);
    
    this.initialValues.startPosition.x = parseFloat(document.getElementById('startX').value);
    this.initialValues.startPosition.y = parseFloat(document.getElementById('startY').value);
    this.initialValues.startPosition.z = parseFloat(document.getElementById('startZ').value);
    
    this.initialValues.startVelocity.x = parseFloat(document.getElementById('velX').value);
    this.initialValues.startVelocity.y = parseFloat(document.getElementById('velY').value);
    this.initialValues.startVelocity.z = parseFloat(document.getElementById('velZ').value);
    
    this.initialValues.gravity = parseFloat(document.getElementById('gravity').value);
    this.initialValues.airDensity = parseFloat(document.getElementById('airDensity').value);
    this.initialValues.dragCoefficientBeforeParachute = parseFloat(document.getElementById('dragCoeffBefore').value);
    this.initialValues.dragCoefficientForParachute = parseFloat(document.getElementById('dragCoeffPara').value);
    this.initialValues.liftCoefficientBeforeParachute = parseFloat(document.getElementById('liftCoeffBefore').value);
    this.initialValues.liftCoefficientForParachute = parseFloat(document.getElementById('liftCoeffPara').value);
    this.initialValues.OMEGA = parseFloat(document.getElementById('omega').value);
    this.initialValues.latitude = parseFloat(document.getElementById('latitude').value);
    
    this.initialValues.windSpeed.x = parseFloat(document.getElementById('windX').value);
    this.initialValues.windSpeed.y = parseFloat(document.getElementById('windY').value);
    this.initialValues.windSpeed.z = parseFloat(document.getElementById('windZ').value);
    
    this.initialValues.autoOpenParachute = document.getElementById('autoParachute').checked;
    this.initialValues.parachuteOpenHeight = parseFloat(document.getElementById('parachuteHeight').value);
  }

  resetToDefaults() {
    document.getElementById('mass').value = 100;
    document.getElementById('area').value = 1;
    document.getElementById('parachuteArea').value = 10;
    
    document.getElementById('startX').value = 3;
    document.getElementById('startY').value = 2000;
    document.getElementById('startZ').value = 0;
    
    document.getElementById('velX').value = 0;
    document.getElementById('velY').value = 0;
    document.getElementById('velZ').value = 0;
    
    document.getElementById('gravity').value = 9.81;
    document.getElementById('airDensity').value = 1.225;
    document.getElementById('dragCoeffBefore').value = 0.005;
    document.getElementById('dragCoeffPara').value = 0.005;
    document.getElementById('liftCoeffBefore').value = 0.3;
    document.getElementById('liftCoeffPara').value = 0.005;
    document.getElementById('omega').value = 7.2921159e-5;
    document.getElementById('latitude').value = 90;
    
    document.getElementById('windX').value = 0;
    document.getElementById('windY').value = 0;
    document.getElementById('windZ').value = 0;
    
    document.getElementById('autoParachute').checked = false;
    document.getElementById('parachuteHeight').value = 1000;
  }
  
  setupPositionChangeListeners() {
    const positionInputs = ['startX', 'startY', 'startZ'];
    
    positionInputs.forEach(inputId => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener('input', () => {
          this.notifyPositionChange();
        });
      }
    });
  }
  
  notifyPositionChange() {
    if (this.onPositionChangeCallback) {
      const currentPosition = {
        x: parseFloat(document.getElementById('startX').value) || 0,
        y: parseFloat(document.getElementById('startY').value) || 0,
        z: parseFloat(document.getElementById('startZ').value) || 0
      };
      this.onPositionChangeCallback(currentPosition);
    }
  }

  show() {
    this.isVisible = true;
    this.overlay.style.display = 'flex';
  }

  hide() {
    this.isVisible = false;
    this.overlay.style.display = 'none';
  }

  onStart(callback) {
    this.onStartCallback = callback;
  }
  
  onPositionChange(callback) {
    this.onPositionChangeCallback = callback;
  }

  getValues() {
    return this.initialValues;
  }

  destroy() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
