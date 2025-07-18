import { Vector3, Color } from "three";
export class Force {
  constructor({ name, color }) {
    this.force = new Vector3(0, 0, 0);
    this.xVec = new Vector3(1, 0, 0);
    this.yVec = new Vector3(0, 1, 0);
    this.zVec = new Vector3(0, 0, 1);
    this.name = name;
    this.showArrowHelper = false;
    this.color = new Color(color);
  }
  calculateForce({ skydiver, controllableVariables }) {}
  addGuiFolder(gui) {
    this.folder = gui.addFolder(this.name);
    this.folder.add(this, "showArrowHelper").listen();
    this.folder.addColor(this, "color").listen();
    this.folder.add(this.force, "x").listen().disable();
    this.folder.add(this.force, "y").listen().disable();
    this.folder.add(this.force, "z").listen().disable();
  }
}
