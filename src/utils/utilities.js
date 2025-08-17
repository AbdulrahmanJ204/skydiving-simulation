import * as THREE from 'three';
// checked

export const round = (num, precision = 2) => {
  // برضو مشان مشكلة ال NAN
  if (!Number.isFinite(num)) return num; 
    return Number(num.toFixed(precision));
};

// تابع custom مشان حساب الزاويا بال FL , FD
THREE.Vector3.prototype.angleToFixed = function (v) {
  
  // مشان مشكلة ال NAN 
  if (this.lengthSq() === 0 || !v || v.lengthSq?.() === 0) {
    return 0;
  }
  const angle = this.angleTo(v);
  return round(angle);
};

let arrowHelpers = new Map();
// لل debug
// مشان ارسم الفيكتورات تبع السكايدايفووور
export function drawVector(scene, v, pos, vName, hex) {
  const dir = v.clone().normalize();
  const origin = pos.clone().add(new THREE.Vector3(0, 1.5, 0));
  const length = 4;

  if (arrowHelpers.has(vName)) {
    scene.remove(arrowHelpers.get(vName));
  }

  const arrow = new THREE.ArrowHelper(dir, origin, length, hex, 1, 0.5);
  arrowHelpers.set(vName, arrow);
  scene.add(arrow);
}

export function clearVectors(scene) {
  arrowHelpers.forEach(arrow => {
    scene.remove(arrow);
  });
  arrowHelpers.clear();
}

export function getArrowHelpers() {
  return arrowHelpers;
}
