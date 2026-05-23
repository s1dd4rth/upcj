import { createHashRouter } from "react-router-dom";
import DemoPage from "./pages/DemoPage";
import DevPage from "./pages/DevPage";
import DesignCatalog from "./pages/DesignCatalog";

export const router = createHashRouter([
  { path: "/", element: <DemoPage mode="product" /> },
  { path: "/product", element: <DemoPage mode="product" /> },
  { path: "/demo", element: <DemoPage mode="demo" /> },
  { path: "/dev", element: <DevPage /> },
  { path: "/design", element: <DesignCatalog /> },
]);
