import yaml from "js-yaml";

function parseItemHasChildren(
  item: { [key: string]: any },
  child: { [key: string]: any }
) {
  return {
    description: `${item.name} - ${child.name}`,
    name: `${item.name.toLowerCase().replace(/\s|-/g, "_")}_${child.name
      .toLowerCase()
      .replace(/\s|-/g, "_")}`,
    url: child.url,
    method: child.method,
    body: Object.keys(child.body || {}).map((key) => ({
      key: key,
      value: child.body[key],
      expression: "raw",
    })),
    headers: child.headers
      ? child.headers.map((h: any) => ({
          key: h.name,
          value: h.value,
          expression: "raw",
        }))
      : [],
  };
}

function parseItemWithoutChildren(item: { [key: string]: any }) {
  let requestBody: { [key: string]: any } = {};
  Object.keys(item.body || {}).forEach((key) => {
    let value = item.body[key];
    try {
      value = JSON.parse(item.body[key]);
      requestBody = {
        ...requestBody,
        ...value,
      };
    } catch (error) {
      requestBody[key] = item.body[key];
    }
  });

  return {
    description: `${item.name}`,
    name: item.name.toLowerCase().replace(/\s|-/g, "_"),
    url: item.url,
    method: item.method,
    body: Object.keys(requestBody || {}).map((key) => ({
      key: key,
      value: requestBody[key],
    })),
    headers: item.headers
      ? item.headers.map((h: any) => ({
          key: h.name,
          value: h.value,
        }))
      : [],
  };
}

function parse(content: string) {
  const doc = yaml.load(content) as any;
  let items: any[] = [];

  for (const item of doc.collection) {
    if (item.children) {
      for (const child of item.children) {
        items.push(parseItemHasChildren(item, child));
      }
    } else {
      items.push(parseItemWithoutChildren(item));
    }
  }

  return items;
}

export { parse };
