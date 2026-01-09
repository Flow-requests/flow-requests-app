import { NodeBase } from "core-package-mini-n8n";

class PackageUtil {
  async load(
    customPackages: Array<{ url: string; libraryName: string }>,
    state: any = {},
  ): Promise<Array<NodeBase>> {
    await this.install(customPackages);
    const customNode: Array<NodeBase> = [];
    for (const customPackage of customPackages) {
      try {
        const instance = eval(`${customPackage.libraryName}`);
        if (instance.default) {
          customNode.push(new instance.default(state));
        } else {
          customNode.push(new instance(state));
        }
      } catch (error) {
        console.error(error);
      }
    }
    return customNode;
  }

  async install(
    customPackages: Array<{ url: string; libraryName: string }>,
  ): Promise<void> {
    for (const customPackage of customPackages) {
      if (document.getElementById(customPackage.libraryName)) {
        continue;
      }

      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = customPackage.url;
        script.id = customPackage.libraryName;
        script.async = false;
        script.onload = async () => {
          resolve({});
        };
        script.onerror = () => {
          console.error(`Error loading ${customPackage.libraryName}.`);
          reject();
        };
        document.body.appendChild(script);
      });
    }
  }
}

export default PackageUtil;
