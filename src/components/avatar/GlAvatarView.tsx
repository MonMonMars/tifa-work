import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import * as THREE from 'three';
import type { ExpressionSnapshot } from '../../expression/types';
import { UI } from '../../theme/tokens';

interface Props {
  accentColor: string;
  expression: ExpressionSnapshot;
  onFailed: () => void;
}

function hexToNumber(hex: string): number {
  const c = hex.replace('#', '');
  return parseInt(c.length === 6 ? c : 'ffffff', 16);
}

/**
 * Minimal expo-gl stage — procedural mesh until a legal VRM is added (docs/VRM_AVATAR.md).
 */
export function GlAvatarView({ accentColor, expression, onFailed }: Props) {
  const [ready, setReady] = useState(false);
  const disposeRef = useRef<(() => void) | null>(null);
  const expressionRef = useRef(expression);
  expressionRef.current = expression;

  useEffect(
    () => () => {
      disposeRef.current?.();
      disposeRef.current = null;
    },
    [],
  );

  const onContextCreate = useCallback(
    async (gl: ExpoWebGLRenderingContext) => {
      let disposed = false;
      let raf = 0;

      try {
        const width = gl.drawingBufferWidth;
        const height = gl.drawingBufferHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0.2, 3.2);

        const geometry = new THREE.IcosahedronGeometry(0.85, 1);
        const material = new THREE.MeshStandardMaterial({
          color: hexToNumber(accentColor),
          roughness: 0.35,
          metalness: 0.15,
          emissive: new THREE.Color(hexToNumber(accentColor)).multiplyScalar(0.08),
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const key = new THREE.DirectionalLight(0xffffff, 1.1);
        key.position.set(2, 3, 4);
        scene.add(key);
        scene.add(new THREE.AmbientLight(0xffffff, 0.45));

        const renderer = new THREE.WebGLRenderer({
          canvas: {
            width,
            height,
            style: {},
            addEventListener: () => {},
            removeEventListener: () => {},
            getContext: () => gl,
          } as unknown as HTMLCanvasElement,
          context: gl,
          alpha: true,
          antialias: true,
        });
        renderer.setSize(width, height, false);
        renderer.setClearColor(0x000000, 0);

        const start = Date.now();
        const loop = () => {
          if (disposed) return;
          raf = requestAnimationFrame(loop);
          const t = (Date.now() - start) / 1000;
          const joy = expressionRef.current.weights.joy ?? 0;
          const affection = expressionRef.current.weights.affection ?? 0;
          const pulse = 1 + 0.04 * joy + 0.02 * affection;
          mesh.rotation.y = t * 0.55;
          mesh.rotation.x = Math.sin(t * 0.7) * 0.12;
          mesh.scale.setScalar(pulse);
          renderer.render(scene, camera);
          gl.endFrameEXP();
        };
        loop();
        setReady(true);

        disposeRef.current = () => {
          disposed = true;
          cancelAnimationFrame(raf);
          geometry.dispose();
          material.dispose();
          renderer.dispose();
        };
      } catch {
        onFailed();
      }
    },
    [accentColor, onFailed],
  );

  return (
    <View style={styles.wrap}>
      <GLView style={styles.gl} onContextCreate={onContextCreate} />
      {!ready && (
        <View style={styles.boot}>
          <Text style={styles.bootText}>Starting 3D stage…</Text>
        </View>
      )}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>GL placeholder · VRM TODO</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: UI.bgDeep },
  gl: { flex: 1 },
  boot: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bootText: { color: UI.textDim, fontSize: 12 },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
  },
  badgeText: { color: UI.textDim, fontSize: 10 },
});
