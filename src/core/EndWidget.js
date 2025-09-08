export class EndWidget {
  constructor() {
    this.isVisible = false;
    this.finalValues = {};
    this.simulationStats = {};
    this.onRestartCallback = null;
    this.onExportCallback = null;
    this.initializeWidget();
  }

  initializeWidget() {
    this.overlay = document.getElementById("end-widget-overlay");
    this.widget = document.getElementById("end-widget-container");
  }

  show(finalValues, simulationStats) {
    this.finalValues = finalValues;
    this.simulationStats = simulationStats;

    this.updateContent();
    this.isVisible = true;
    this.overlay.style.display = "flex";
  }

  updateContent() {
    updatePos();

    updateVelocity();

    updateSimStats();

    updateForces();

    parachuteStats();

    this.setupEventListeners();
  }
  updateForces() {
    document.getElementById("gravity-force").textContent = `${
      this.finalValues.forces?.gravity?.toFixed(2) || "0.00"
    } N`;
    document.getElementById("drag-force").textContent = `${
      this.finalValues.forces?.drag?.toFixed(2) || "0.00"
    } N`;
    document.getElementById("lift-force").textContent = `${
      this.finalValues.forces?.lift?.toFixed(2) || "0.00"
    } N`;
    document.getElementById("coriolis-force").textContent = `${
      this.finalValues.forces?.coriolis?.toFixed(2) || "0.00"
    } N`;
    document.getElementById("total-force").textContent = `${
      this.finalValues.forces?.total?.toFixed(2) || "0.00"
    } N`;
  }

  updateSimStats() {
    document.getElementById("max-speed").textContent = `${
      this.simulationStats.maxSpeed?.toFixed(2) || "0.00"
    } m/s`;
    document.getElementById("max-altitude").textContent = `${
      this.simulationStats.maxAltitude?.toFixed(2) || "0.00"
    } m`;
    document.getElementById("total-distance").textContent = `${
      this.simulationStats.totalDistance?.toFixed(2) || "0.00"
    } m`;
    document.getElementById("parachute-opened").textContent = this.finalValues
      .parachuteOpened
      ? "Yes"
      : "No";
  }
  updateVelocity() {
    document.getElementById(
      "final-x-vel"
    ).textContent = `${this.finalValues.velocity.x.toFixed(2)} m/s`;
    document.getElementById(
      "final-y-vel"
    ).textContent = `${this.finalValues.velocity.y.toFixed(2)} m/s`;
    document.getElementById(
      "final-z-vel"
    ).textContent = `${this.finalValues.velocity.z.toFixed(2)} m/s`;
    document.getElementById(
      "total-speed"
    ).textContent = `${this.calculateTotalSpeed().toFixed(2)} m/s`;
  }

  updatePos() {
    document.getElementById(
      "final-x-pos"
    ).textContent = `${this.finalValues.position.x.toFixed(2)} m`;
    document.getElementById(
      "final-y-pos"
    ).textContent = `${this.finalValues.position.y.toFixed(2)} m`;
    document.getElementById(
      "final-z-pos"
    ).textContent = `${this.finalValues.position.z.toFixed(2)} m`;
  }
  parachuteStats() {
    const parachuteTimeItem = document.getElementById("parachute-time-item");
    const parachuteHeightItem = document.getElementById(
      "parachute-height-item"
    );

    if (this.finalValues.parachuteOpened) {
      parachuteTimeItem.style.display = "flex";
      parachuteHeightItem.style.display = "flex";
      document.getElementById("parachute-open-time").textContent = `${
        this.simulationStats.parachuteOpenTime?.toFixed(1) || "0.0"
      } s`;
      document.getElementById("parachute-open-height").textContent = `${
        this.simulationStats.parachuteOpenHeight?.toFixed(2) || "0.00"
      } m`;
    } else {
      parachuteTimeItem.style.display = "none";
      parachuteHeightItem.style.display = "none";
    }
  }

  setupEventListeners() {
    const closeButton = document.getElementById("close-results");

    closeButton?.addEventListener("click", () => {
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
      this.overlay.style.display = "none";
    }
  }
}
