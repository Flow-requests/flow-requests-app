import { useState } from "react";
import { toast } from "react-toastify";
import CustomPackage from "../types/custom-node";
import PackageUtil from "@/utils/package.util";
import * as pluginRepository from "@/repositories/plugins.repository";

const packageUtil = new PackageUtil();

function useCustomNode() {
  const [packages, setPackages] = useState<CustomPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [packageName, setPackageName] = useState("");
  const [libraryName, SetlibraryName] = useState("");

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const results = await pluginRepository.getAll();
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
      await packageUtil.install([
        {
          url: packageName,
          libraryName: libraryName,
        },
      ]);

      await pluginRepository.insert({
        url: packageName,
        libraryName: libraryName,
        enabled: true,
      } as CustomPackage);
      toast.success("Plugin installed successfully");
      setPackageName("");
      fetchPackages();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to install package");
    } finally {
      setLoading(false);
    }
  };

  const removePackage = async (id: string, libraryName: string) => {
    try {
      await pluginRepository.removeById(id);
      const script = document.getElementById(libraryName);
      if (script) {
        script.remove();
      }

      toast.success("Plugin removed successfully");
      fetchPackages();
    } catch (error) {
      toast.error("Failed to remove package");
    }
  };

  return {
    packageName,
    setPackageName,
    installPackage,
    packages,
    loading,
    fetchPackages,
    removePackage,
    libraryName,
    SetlibraryName,
  };
}

export default useCustomNode;
