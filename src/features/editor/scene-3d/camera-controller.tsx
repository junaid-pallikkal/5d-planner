"use client";

import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PointerLockControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useCameraStore } from "@/stores/camera-store";

export const CameraController: React.FC = () => {
  const { camera } = useThree();
  const orbitRef = useRef<OrbitControlsImpl>(null);
  const mode = useCameraStore((s) => s.mode);
  const isFirstPerson = useCameraStore((s) => s.isFirstPerson);

  // Switch camera modes
  useEffect(() => {
    if (!orbitRef.current) return;

    if (mode === 'top_down') {
      camera.position.set(4, 25, 3.5);
      camera.lookAt(4, 0, 3.5);
      orbitRef.current.target.set(4, 0, 3.5);
      orbitRef.current.maxPolarAngle = 0.05; // lock top-down
    } else if (mode === 'isometric') {
      camera.position.set(15, 15, 15);
      camera.lookAt(4, 0, 3.5);
      orbitRef.current.target.set(4, 0, 3.5);
      orbitRef.current.maxPolarAngle = Math.PI / 2.2;
    } else {
      // standard orbit
      orbitRef.current.maxPolarAngle = Math.PI / 2.05; // don't go below ground
    }
    orbitRef.current.update();
  }, [mode, camera]);

  // First-person walkthrough movement keys
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });

  useEffect(() => {
    if (!isFirstPerson) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isFirstPerson]);

  useFrame((_, delta) => {
    if (!isFirstPerson) return;

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
  });

  if (isFirstPerson) {
    return <PointerLockControls />;
  }

  return (
    <OrbitControls
      ref={orbitRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={1}
      maxDistance={60}
      target={[4, 1, 3.5]}
    />
  );
};
