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
  calculateForce({ skydiver, controllableVariables }) { }

  addSettingsFolder(parentFolder) {
    const folder = parentFolder.addFolder(this.name);
    folder.add(this, "showArrowHelper").name("Show Arrow").listen();
    folder.addColor(this, "color").name("Color").listen();
    return folder;
  }
}
