"use client";

import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PointerLockControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useCameraStore } from "@/stores/camera-store";
import { toast } from "sonner";

export const CameraController: React.FC = () => {
  const { camera, gl, scene } = useThree();
  const orbitRef = useRef<OrbitControlsImpl>(null);
  const mode = useCameraStore((s) => s.mode);
  const isFirstPerson = useCameraStore((s) => s.isFirstPerson);
  const focusTrigger = useCameraStore((s) => s.focusTrigger);

  // Animated camera lerp targets
  const targetGoal = useRef<THREE.Vector3 | null>(null);
  const positionGoal = useRef<THREE.Vector3 | null>(null);

  // Set initial target on mount
  useEffect(() => {
    if (orbitRef.current) {
      orbitRef.current.target.set(4, 0.5, 3.5);
      orbitRef.current.update();
    }
  }, []);

  // Handle focusTrigger from store (Focus Selection, Focus Building, etc.)
  useEffect(() => {
    if (!focusTrigger) return;
    targetGoal.current = new THREE.Vector3(
      focusTrigger.target.x,
      focusTrigger.target.y,
      focusTrigger.target.z
    );
    if (focusTrigger.position) {
      positionGoal.current = new THREE.Vector3(
        focusTrigger.position.x,
        focusTrigger.position.y,
        focusTrigger.position.z
      );
    }
  }, [focusTrigger]);

  // Switch camera modes
  useEffect(() => {
    if (!orbitRef.current) return;

    if (mode === "top_down") {
      const curTarget = orbitRef.current.target.clone();
      positionGoal.current = new THREE.Vector3(curTarget.x, curTarget.y + 25, curTarget.z);
      orbitRef.current.maxPolarAngle = 0.05; // lock top-down
    } else if (mode === "isometric") {
      const curTarget = orbitRef.current.target.clone();
      positionGoal.current = new THREE.Vector3(curTarget.x + 12, curTarget.y + 12, curTarget.z + 12);
      orbitRef.current.maxPolarAngle = Math.PI / 2.2;
    } else {
      // standard orbit
      orbitRef.current.maxPolarAngle = Math.PI / 2.05; // don't go below ground
    }
  }, [mode]);

  // Double-click on any 3D surface to re-center/focus orbit target on that point
  useEffect(() => {
    if (isFirstPerson) return;
    const dom = gl.domElement;

    const handleDblClick = (event: MouseEvent) => {
      const rect = dom.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      // Filter for solid meshes (walls, floors, furniture, roofs, ground)
      const hit = intersects.find(
        (i) =>
          i.object.type === "Mesh" &&
          !i.object.name.includes("Helper") &&
          !(i.object as THREE.Mesh).userData?.isHelper
      );

      if (hit) {
        targetGoal.current = hit.point.clone();
        toast.info(
          `Focus point set to (${hit.point.x.toFixed(1)}m, ${hit.point.z.toFixed(1)}m)`
        );
      }
    };

    dom.addEventListener("dblclick", handleDblClick);
    return () => {
      dom.removeEventListener("dblclick", handleDblClick);
    };
  }, [gl, camera, scene, isFirstPerson]);

  // First-person walkthrough movement keys
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });

  useEffect(() => {
    if (!isFirstPerson) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          moveState.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          moveState.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          moveState.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          moveState.current.right = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          moveState.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          moveState.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          moveState.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          moveState.current.right = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isFirstPerson]);

  // Frame update loop
  useFrame((_, delta) => {
    // 1. Walkthrough mode
    if (isFirstPerson) {
      const speed = 4.0 * delta; // 4 meters/sec walk speed
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      dir.y = 0;
      dir.normalize();

      const sideDir = new THREE.Vector3().crossVectors(camera.up, dir).negate();

      if (moveState.current.forward) camera.position.addScaledVector(dir, speed);
      if (moveState.current.backward) camera.position.addScaledVector(dir, -speed);
      if (moveState.current.left) camera.position.addScaledVector(sideDir, -speed);
      if (moveState.current.right) camera.position.addScaledVector(sideDir, speed);

      camera.position.y = 1.65; // Eye height (1.65m human eye level)
      return;
    }

    // 2. Smooth Lerp Camera Target
    if (orbitRef.current && targetGoal.current) {
      orbitRef.current.target.lerp(targetGoal.current, 0.12);
      if (orbitRef.current.target.distanceTo(targetGoal.current) < 0.02) {
        orbitRef.current.target.copy(targetGoal.current);
        targetGoal.current = null;
      }
      orbitRef.current.update();
    }

    // 3. Smooth Lerp Camera Position
    if (positionGoal.current) {
      camera.position.lerp(positionGoal.current, 0.12);
      if (camera.position.distanceTo(positionGoal.current) < 0.05) {
        camera.position.copy(positionGoal.current);
        positionGoal.current = null;
      }
    }
  });

  if (isFirstPerson) {
    return <PointerLockControls />;
  }

  return (
    <OrbitControls
      ref={orbitRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={0.5}
      maxDistance={120}
      enablePan={true}
      panSpeed={1.0}
      screenSpacePanning={true}
    />
  );
};
