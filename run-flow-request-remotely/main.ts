import axios from "npm:axios";
import fs from "node:fs";

Deno.serve(async (request: Request) => {
  const body = await request.json();
  const plugins = body.plugins.map((item: { [key: string]: any }) => {
    const url = item.url;
    const urlSplited = url.split("/");
    if (urlSplited[urlSplited.length - 1].indexOf("bundle.js") >= 0) {
      urlSplited[urlSplited.length - 1] = "deno-bundle.js";
    }
    return urlSplited.join("/");
  });

  // const pluginsInstances = [];
  // for (let index = 0; index < plugins.length; index += 1) {
  //   try {
  //     const url = plugins[index];
  //     console.log(url);
  //     const item = await import(url);
  //     pluginsInstances.push(item.default.default);
  //     console.log(new item.default.default({}).getConfig());

  //     //     "https://unpkg.com/alert-message-plugin-flow-requests@1.2.1/dist/node-bundle.js"
  //     //   );
  //     //   console.log(
  //     //     new item.default.default({}).execute({
  //     //       settings: {
  //     //         message: "Test here",
  //     //       },
  //     //     })
  //     //   );
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // const pluginUrls = [
  //   "https://unpkg.com/mailtrap-plugin@1.1.5/dist/deno-bundle.js",
  // ];

  // for (let index = 0; index < pluginUrls.length; index += 1) {
  //   const url = pluginUrls[index]

  // }

  // const { data: content } = await axios.get(
  //   "https://unpkg.com/mailtrap-plugin@1.1.5/dist/deno-bundle.js"
  // );

  // await fs.writeFileSync("./mailtrap.js", content);
  // console.log(content);

  // const item = await import("./mailtrap.js");
  // console.log(new item.default({}).getConfig());

  let item = await import(
    "https://unpkg.com/mailtrap-plugin@1.1.5/src/index.ts"
  );
  console.log(new item.default({}).getConfig());

  item = await import(
    "https://cdn.jsdelivr.net/npm/alert-message-plugin-flow-requests@1.2.4"
  );
  console.log(new item.default({}).getConfig());
  // console.log(pluginsInstances);
  // const item = await import(
  //   "https://unpkg.com/mailtrap-plugin@1.1.6/dist/deno-bundle.js"
  //   // "https://cdn.jsdelivr.net/npm/mailtrap-plugin@1.1.5/dist/deno-bundle.js"
  // );
  // console.log((new item.default({}).execute({
  //   settings: {
  //     "message": "ababab cdcdcd"
  //   }
  // })))
  //   console.log(
  //     new item.default.default({}).execute({
  //       settings: {
  //         message: "Test here",
  //       },
  //     })
  //   );
  return new Response("Hello, Deno!");
});
