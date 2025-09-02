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
            startPosition: {x: 3, y: 2000, z: 40},
            startVelocity: {x: 0, y: 0, z: 0},

            // Physics properties
            gravity: 9.81,
            airDensity: 1.225,
            dragCoefficientBeforeParachute: 0.1,
            dragCoefficientForParachute: 0.3,
            liftCoefficientBeforeParachute: 0.09,
            liftCoefficientForParachute: 0.22,
            OMEGA: 7.2921159e-5,
            windSpeed: {x: 0, y: 0, z: 0},
            latitude: 90,

            // Simulation settings
            autoOpenParachute: false,
            parachuteOpenHeight: 1000,
        };
        this.initializeWidget();
    }

    initializeWidget() {
        // Get references to existing HTML elements
        this.overlay = document.getElementById('start-widget-overlay');
        this.widget = document.getElementById('start-widget-container');
        
        // Set initial values in the form
        this.setInitialValues();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    setInitialValues() {
        // Set all input values to match initialValues
        document.getElementById('mass').value = this.initialValues.mass;
        document.getElementById('area').value = this.initialValues.area;
        document.getElementById('parachuteArea').value = this.initialValues.parachuteArea;

        document.getElementById('startX').value = this.initialValues.startPosition.x;
        document.getElementById('startY').value = this.initialValues.startPosition.y;
        document.getElementById('startZ').value = this.initialValues.startPosition.z;

        document.getElementById('velX').value = this.initialValues.startVelocity.x;
        document.getElementById('velY').value = this.initialValues.startVelocity.y;
        document.getElementById('velZ').value = this.initialValues.startVelocity.z;

        document.getElementById('gravity').value = this.initialValues.gravity;
        document.getElementById('airDensity').value = this.initialValues.airDensity;
        document.getElementById('dragCoeffBefore').value = this.initialValues.dragCoefficientBeforeParachute;
        document.getElementById('dragCoeffPara').value = this.initialValues.dragCoefficientForParachute;
        document.getElementById('liftCoeffBefore').value = this.initialValues.liftCoefficientBeforeParachute;
        document.getElementById('liftCoeffPara').value = this.initialValues.liftCoefficientForParachute;
        document.getElementById('omega').value = this.initialValues.OMEGA;
        document.getElementById('latitude').value = this.initialValues.latitude;

        document.getElementById('windX').value = this.initialValues.windSpeed.x;
        document.getElementById('windY').value = this.initialValues.windSpeed.y;
        document.getElementById('windZ').value = this.initialValues.windSpeed.z;

        document.getElementById('autoParachute').checked = this.initialValues.autoOpenParachute;
        document.getElementById('parachuteHeight').value = this.initialValues.parachuteOpenHeight;
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
        // Reset to the initial values defined in the constructor
        this.setInitialValues();
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


}
