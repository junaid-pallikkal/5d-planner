import { Point2D, Point3D } from '@/types/geometry';

export interface ViewportTransform {
  x: number; // pan offset in pixels
  y: number; // pan offset in pixels
  scale: number; // pixels per meter (or zoom factor * base scale)
}

export class CoordinateService {
  public static readonly PIXELS_PER_METER_DEFAULT = 60; // 60px = 1 meter at zoom 1.0

  /**
   * Converts screen (canvas pixel) coordinates to world (meter) coordinates.
   */
  static screenToWorld(
    screen: Point2D,
    transform: ViewportTransform,
    basePixelsPerMeter: number = this.PIXELS_PER_METER_DEFAULT
  ): Point2D {
    const scale = transform.scale * basePixelsPerMeter;
    return {
      x: (screen.x - transform.x) / scale,
      y: (screen.y - transform.y) / scale,
    };
  }

  /**
   * Converts world (meter) coordinates to screen (canvas pixel) coordinates.
   */
  static worldToScreen(
    world: Point2D,
    transform: ViewportTransform,
    basePixelsPerMeter: number = this.PIXELS_PER_METER_DEFAULT
  ): Point2D {
    const scale = transform.scale * basePixelsPerMeter;
    return {
      x: world.x * scale + transform.x,
      y: world.y * scale + transform.y,
    };
  }

  /**
   * Maps 2D CAD coordinates (X, Y in meters) to 3D Three.js coordinates (X, Y_elevation, Z in meters).
   */
  static cad2DToThree3D(cadPoint: Point2D, elevation: number = 0): Point3D {
    return {
      x: cadPoint.x,
      y: elevation,
      z: cadPoint.y,
    };
  }

  /**
   * Maps 3D Three.js position back to 2D CAD coordinates.
   */
  static three3DToCad2D(pos: Point3D): Point2D {
    return {
      x: pos.x,
      y: pos.z,
    };
  }
}
