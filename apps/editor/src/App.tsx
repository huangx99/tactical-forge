import { useEffect } from 'react';
import { EditorLayout } from './layouts/EditorLayout';
import { useSceneStore } from './stores/sceneStore';
import { createDemoScene } from './stores/demoScene';

export default function App() {
  const { scenes, setActiveScene } = useSceneStore();

  // Create demo scene on first load
  useEffect(() => {
    if (scenes.length === 0) {
      const demo = createDemoScene();
      useSceneStore.setState((s) => ({
        scenes: [demo],
        activeSceneId: demo.id,
      }));
    }
  }, []);

  return <EditorLayout />;
}
