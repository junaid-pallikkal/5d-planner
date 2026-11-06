import * as THREE from 'three';
import { GLTFExporter } from 'three-stdlib';

export class GltfExporterService {
  static async exportSceneToGltf(scene: THREE.Object3D, fileName = 'model.glb', binary = true): Promise<void> {
    const exporter = new GLTFExporter();

    return new Promise((resolve, reject) => {
      exporter.parse(
        scene,
        (result) => {
          if (result instanceof ArrayBuffer) {
            const blob = new Blob([result], { type: 'model/gltf-binary' });
            this.triggerDownload(blob, fileName.endsWith('.glb') ? fileName : `${fileName}.glb`);
          } else {
            const output = JSON.stringify(result, null, 2);
            const blob = new Blob([output], { type: 'application/json' });
            this.triggerDownload(blob, fileName.endsWith('.gltf') ? fileName : `${fileName}.gltf`);
          }
          resolve();
        },
        (error) => {
          console.error('An error occurred during GLTF export:', error);
          reject(error);
        },
        { binary }
      );
    });
  }

  private static triggerDownload(blob: Blob, filename: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
