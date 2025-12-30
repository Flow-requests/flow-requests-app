import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CustomPackage from "../types/custom-node";
import PackageUtil from "@/utils/package.util";
import Dexie from "dexie";

function useCustomNode() {
  const [packages, setPackages] = useState<CustomPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [packageName, setPackageName] = useState("");
  const [libraryName, SetlibraryName] = useState("");

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const db = new Dexie("FlowRequests");
      db.version(1).stores({
        plugins: "++id",
      });

      const results = await db.plugins.toArray();
      setPackages(results);
    } catch (error) {
      toast.error("Failed to fetch packages");
    } finally {
      setLoading(false);
    }
  };

  const installPackage = async (packageName: string, libraryName: string) => {
    if (!packageName.trim() && !libraryName.trim()) {
      toast.error("Please enter a CDN URL and library name");
      return;
    }

    setLoading(true);
    try {
      const packageUtil = new PackageUtil();
      await packageUtil.install([
        {
          url: packageName,
          libraryName: libraryName,
        },
      ]);

      const db = new Dexie("FlowRequests");
      db.version(1).stores({
        plugins: "++id",
      });

      await db.plugins.add({
        url: packageName,
        libraryName: libraryName,
        enabled: true,
      });
      toast.success("Plugin installed successfully");
      setPackageName("");
      fetchPackages();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to install package");
    } finally {
      setLoading(false);
    }
  };

  const togglePackage = async (id: string, enabled: boolean) => {
    try {
      const db = new Dexie("FlowRequests");
      db.version(1).stores({
        plugins: "++id",
      });

      await db.plugins.update(id, {
        enabled: enabled,
      });
      toast.success(`Plugin ${enabled ? "disabled" : "enabled"} successfully`);
      fetchPackages();
    } catch (error) {
      toast.error("Failed to toggle package");
    }
  };

  return {
    packageName,
    setPackageName,
    installPackage,
    packages,
    loading,
    fetchPackages,
    togglePackage,
    libraryName,
    SetlibraryName,
  };
}

export default useCustomNode;
