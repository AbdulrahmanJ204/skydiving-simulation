import {Color, Vector3} from "three";

// checked
export class Force {
    force;
    yVec;
    name;
    showArrowHelper = false;
    color;
    constructor({name, color}) {
        this.force = new Vector3(0, 0, 0);
        this.yVec = new Vector3(0, 1, 0);
        this.name = name;
        this.color = new Color(color);
    }

    calculateForce({skydiver, variables}) {
    }

    addSettingsFolder(parentFolder) {
        const folder = parentFolder.addFolder(this.name);
        folder.close()
        folder.add(this, "showArrowHelper").name("Show Arrow").listen();
        folder.addColor(this, "color").name("Color").listen();
        return folder;
    }
}
